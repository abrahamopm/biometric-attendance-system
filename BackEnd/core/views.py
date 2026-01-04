from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta

from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Subject, Event, Enrollment, AttendanceRecord
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    SubjectSerializer, EventSerializer, EnrollmentSerializer,
    AttendanceRecordSerializer,
)
from .services.arcface_service import extract_embedding, compare_embeddings
from .tasks import send_session_reminder


User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[AllowAny],
        authentication_classes=[],
    )
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[AllowAny],
        authentication_classes=[],
    )
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        )


class SubjectViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Host':
            return Subject.objects.filter(host=user)
        # Allow attendees to browse available subjects
        return Subject.objects.all()

    def perform_create(self, serializer):
        serializer.save(host=self.request.user)


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Host':
            return Event.objects.filter(subject__host=user)
        elif user.role == 'Attendee':
            return Event.objects.filter(subject__enrollments__attendee=user)
        return Event.objects.none()

    @action(detail=True, methods=['post'])
    def start_session(self, request, pk=None):
        event = self.get_object()
        if event.status != 'Scheduled':
            return Response({"error": "Event not in Scheduled state"}, status=400)

        event.status = 'Ongoing'
        event.started_at = timezone.now()
        event.save()

        # Optional reminder; safe if Celery not running
        try:
            send_session_reminder.delay(event.id)
        except Exception:
            pass

        return Response({"message": "Session started"})

    @action(detail=True, methods=['post'])
    def mark_attendance(self, request, pk=None):
        """Upload a frame for an ongoing event and mark attendance."""
        event = self.get_object()
        if event.status != 'Ongoing':
            return Response({"error": "Session not active"}, status=400)

        image = request.FILES.get('image')
        if not image:
            return Response({"error": "Image required"}, status=400)

        try:
            embedding = extract_embedding(image)
            enrollments = Enrollment.objects.filter(
                subject=event.subject, is_active=True, is_deleted=False
            )

            best_match = None
            best_sim = 0.0

            for enr in enrollments:
                if not enr.facial_embedding:
                    continue
                match, sim = compare_embeddings(embedding, enr.facial_embedding)
                if match and sim > best_sim:
                    best_sim = sim
                    best_match = enr

            if best_match:
                time_diff = (timezone.now() - event.started_at).total_seconds() / 60
                status_val = 'Late' if time_diff > event.late_threshold else 'Present'

                record, _ = AttendanceRecord.objects.get_or_create(
                    event=event,
                    enrollment=best_match,
                    defaults={
                        'status': status_val,
                        'timestamp': timezone.now(),
                        'is_manual': False
                    }
                )
                return Response({
                    "success": True,
                    "student": best_match.attendee.full_name,
                    "status": status_val,
                    "confidence": round(best_sim * 100, 2),
                    "record_id": record.id
                })
            return Response({"success": False, "message": "No match"}, status=200)

        except ValueError as ve:
            return Response({"error": str(ve)}, status=400)
        except Exception:
            return Response({"error": "Recognition failed"}, status=500)

    @action(detail=True, methods=['get'])
    def export_csv(self, request, pk=None):
        event = self.get_object()
        records = event.records.all()
        return Response(AttendanceRecordSerializer(records, many=True).data)


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Host':
            return Enrollment.objects.filter(subject__host=user)
        elif user.role == 'Attendee':
            return Enrollment.objects.filter(attendee=user)
        return Enrollment.objects.none()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        enrollment = serializer.save()
        return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def enroll(self, request):
        subject_id = request.data.get('subject_id')
        image = request.FILES.get('image')

        if not subject_id:
            return Response({"error": "subject_id required"}, status=400)

        try:
            subject = Subject.objects.get(id=subject_id)
            embedding = None
            if image:
                embedding = extract_embedding(image)

            enrollment, _ = Enrollment.objects.update_or_create(
                subject=subject,
                attendee=request.user,
                defaults={'facial_embedding': embedding, 'is_active': True, 'is_deleted': False}
            )
            return Response(EnrollmentSerializer(enrollment).data, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

    @action(detail=True, methods=['post'])
    def delete_face_data(self, request, pk=None):
        enrollment = self.get_object()
        if request.user != enrollment.attendee:
            return Response({"error": "Unauthorized"}, status=403)

        enrollment.facial_embedding = None
        enrollment.is_active = False
        enrollment.is_deleted = True
        enrollment.save()
        return Response({"message": "Face data deleted"})


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Host':
            return AttendanceRecord.objects.filter(event__subject__host=user)
        elif user.role == 'Attendee':
            return AttendanceRecord.objects.filter(enrollment__attendee=user)
        return AttendanceRecord.objects.none()


class DashboardMetricsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'Host':
            return Response({"detail": "Host access required"}, status=403)

        subjects = Subject.objects.filter(host=user)
        events_qs = Event.objects.filter(subject__host=user)
        enrollments_qs = Enrollment.objects.filter(subject__host=user, is_active=True, is_deleted=False)
        records_qs = AttendanceRecord.objects.filter(event__subject__host=user)

        today = timezone.localdate()
        start_week = today - timedelta(days=today.weekday())
        end_week = start_week + timedelta(days=6)

        total_students = enrollments_qs.values('attendee_id').distinct().count()
        active_subjects = subjects.count()
        events_this_week = events_qs.filter(event_date__range=(start_week, end_week)).count()

        total_records = records_qs.count()
        present_records = records_qs.filter(status__in=['Present', 'Late']).count()
        attendance_rate = round((present_records / total_records) * 100, 1) if total_records else 0.0

        todays_schedule = [
            {
                "id": ev.id,
                "title": ev.title,
                "subject": ev.subject.code,
                "time": ev.start_time.strftime('%H:%M'),
                "status": ev.status,
            }
            for ev in events_qs.filter(event_date=today).order_by('start_time')
        ]

        recent_attendance = [
            {
                "id": rec.id,
                "studentName": rec.enrollment.attendee.full_name,
                "studentId": rec.enrollment.attendee_id,
                "status": rec.status,
                "checkInTime": rec.timestamp.strftime('%H:%M'),
                "subject": rec.event.subject.code,
            }
            for rec in records_qs.select_related('enrollment__attendee', 'event__subject').order_by('-timestamp')[:10]
        ]

        return Response({
            "stats": {
                "totalStudents": total_students,
                "attendanceRate": attendance_rate,
                "activeSubjects": active_subjects,
                "eventsThisWeek": events_this_week,
            },
            "schedule": todays_schedule,
            "recent_attendance": recent_attendance,
        })


class ReportsMetricsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'Host':
            return Response({"detail": "Host access required"}, status=403)

        period = request.query_params.get('period', 'week')
        days_lookup = {
            'week': 7,
            'month': 30,
            'semester': 120,
        }
        days = days_lookup.get(period, 7)

        today = timezone.localdate()
        start_date = today - timedelta(days=days - 1)

        records_qs = AttendanceRecord.objects.filter(
            event__subject__host=user,
            timestamp__date__gte=start_date,
        )
        events_qs = Event.objects.filter(subject__host=user, event_date__gte=start_date)
        subjects = Subject.objects.filter(host=user)

        total_records = records_qs.count()
        present_records = records_qs.filter(status__in=['Present', 'Late']).count()
        average_attendance = round((present_records / total_records) * 100, 1) if total_records else 0.0

        attendance_data = [
            {
                "date": day['day'].strftime('%b %d'),
                "present": day['present'],
                "late": day['late'],
                "absent": day['absent'],
            }
            for day in records_qs
            .annotate(day=TruncDate('timestamp'))
            .values('day')
            .annotate(
                present=Count('id', filter=Q(status='Present')),
                late=Count('id', filter=Q(status='Late')),
                absent=Count('id', filter=Q(status='Absent')),
            )
            .order_by('day')
        ]

        subject_stats = []
        for subj in subjects:
            subj_records = records_qs.filter(event__subject=subj)
            subj_total = subj_records.count()
            subj_present = subj_records.filter(status__in=['Present', 'Late']).count()
            avg_att = round((subj_present / subj_total) * 100, 1) if subj_total else 0.0
            enrolled = Enrollment.objects.filter(subject=subj, is_active=True, is_deleted=False).values('attendee_id').distinct().count()
            total_events = subj.events.filter(event_date__gte=start_date).count()
            subject_stats.append({
                "subject": subj.code,
                "avgAttendance": avg_att,
                "totalEvents": total_events,
                "enrolled": enrolled,
            })

        return Response({
            "summary": {
                "averageAttendance": average_attendance,
                "totalEvents": events_qs.count(),
                "reportsGenerated": total_records,
            },
            "attendanceData": attendance_data,
            "subjectStats": subject_stats,
        })
