from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
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

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
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

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
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
