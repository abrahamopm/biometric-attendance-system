from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from .models import User, Event, AttendanceRecord, Enrollment, EmailVerificationToken
from .serializers import UserSerializer, EventSerializer, AttendanceSerializer, EnrollmentSerializer
from .services.face_service import (
    encode_face_from_base64,
    compare_faces,
    face_encoding_to_bytes,
    recognize_faces_in_image # Add this import
)
import random
import string
import datetime
import secrets
import logging

logger = logging.getLogger(__name__)
# from django.shortcuts import get_object_or_404 -> Not needed if we catch DoesNotExist


class AuthViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def _issue_verification_token(self, user):
        token_value = secrets.token_urlsafe(32)
        EmailVerificationToken.objects.create(user=user, token=token_value)
        return token_value

    def _send_verification_email(self, user, token_value):
        verify_link = f"{settings.FRONTEND_VERIFY_URL}?token={token_value}"
        backend_link = f"{settings.SITE_URL}/api/auth/verify-email/?token={token_value}"
        subject = "Verify your email"
        message = (
            "Welcome to the Biometric Attendance System!\n\n"
            f"Please verify your email by visiting:\n{verify_link}\n\n"
            f"(Backend link for testing: {backend_link})\n\n"
            "If you did not sign up, you can ignore this email."
        )
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)

    def signup(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            # EMAIL VERIFICATION DISABLED - No email check required
            # if not serializer.validated_data.get('email'):
            #     return Response({"message": "Email is required for verification"}, status=status.HTTP_400_BAD_REQUEST)

            user = serializer.save()

            # EMAIL VERIFICATION DISABLED - Skip token and email
            # token_value = self._issue_verification_token(user)
            # self._send_verification_email(user, token_value)

            return Response({
                "message": "User created successfully.",  # Updated message
                "user_id": user.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            # Check 2FA or Email Verification here
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'role': user.role
            })
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        
        
    # EMAIL VERIFICATION DISABLED - Method commented out
    # def verify_email(self, request):
    #     token_value = request.data.get('token') or request.query_params.get('token')
    #     if not token_value:
    #         return Response({"message": "Missing token"}, status=400)
    #
    #     try:
    #         token = EmailVerificationToken.objects.get(token=token_value)
    #     except EmailVerificationToken.DoesNotExist:
    #         return Response({"message": "Invalid token"}, status=400)
    #
    #     if token.used:
    #         return Response({"message": "Token already used"}, status=400)
    #     if token.is_expired():
    #         return Response({"message": "Token expired"}, status=400)
    #
    #     user = token.user
    #     user.is_email_verified = True
    #     user.save(update_fields=["is_email_verified"])
    #
    #     token.used = True
    #     token.save(update_fields=["used"])
    #
    #     return Response({"message": "Email verified"})

    def verify_2fa(self, request):
        # Implementation placeholder
        return Response({"message": "2FA verified"})

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'host':
            return Event.objects.filter(host=user)
        return Event.objects.filter(enrollments__student=user)
        
    def perform_create(self, serializer):
        serializer.save(host=self.request.user)

    @action(detail=False, methods=['post'])
    def join_event(self, request):
        code = request.data.get('join_code')
        try:
            event = Event.objects.get(join_code=code)
            # Check if already enrolled
            if Enrollment.objects.filter(student=request.user, event=event).exists():
                 return Response({"message": "Already enrolled"}, status=200)
            
            Enrollment.objects.create(student=request.user, event=event)
            return Response({"message": f"Joined {event.name}"})
        except Event.DoesNotExist:
            return Response({"error": "Invalid code"}, status=404)

        except Event.DoesNotExist:
            return Response({"error": "Invalid code"}, status=404)

    @action(detail=True, methods=['post'])
    def start_session(self, request, pk=None):
        event = self.get_object()
        if event.host != request.user:
             return Response({"error": "Not authorized"}, status=403)
        
        event.is_live = True
        event.save()
        return Response({"status": "started", "is_live": True})

    @action(detail=True, methods=['post'])
    def end_session(self, request, pk=None):
        event = self.get_object()
        if event.host != request.user:
             return Response({"error": "Not authorized"}, status=403)
        
        event.is_live = False
        event.save()
        return Response({"status": "ended", "is_live": False})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user
        today = datetime.date.today()
        
        # 1. Total Students: Unique students enrolled in host's events
        total_students = Enrollment.objects.filter(event__host=user).values('student').distinct().count()
        
        # 2. Active Sessions: Events scheduled for today
        active_sessions = Event.objects.filter(host=user, date=today).count()
        
        # 3. Avg Attendance: Detailed calculation
        # This is a bit complex. Let's look at PAST events only to avoid skewing with upcoming 0-attendance events.
        past_events = Event.objects.filter(host=user, date__lt=today)
        
        total_attendance_percentage = 0
        events_count_for_avg = 0
        
        for event in past_events:
            enrolled_count = event.enrollments.count()
            if enrolled_count > 0:
                attendance_count = event.attendance_records.filter(status__in=['present', 'late']).count()
                event_percentage = (attendance_count / enrolled_count) * 100
                total_attendance_percentage += event_percentage
                events_count_for_avg += 1
                
        avg_attendance = 0
        if events_count_for_avg > 0:
            avg_attendance = round(total_attendance_percentage / events_count_for_avg, 1)
            
        return Response({
            "total_students": total_students,
            "active_sessions": active_sessions,
            "avg_attendance": avg_attendance
        })

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Hosts see all attendance for their events, Students see their own
        user = self.request.user
        if user.role == 'host':
             return AttendanceRecord.objects.filter(event__host=user)
        return AttendanceRecord.objects.filter(student=user)


    @action(detail=False, methods=['post'])
    def batch_recognize(self, request):
        event_id = request.data.get('event_id')
        image_data = request.data.get('image')
        
        if not event_id or not image_data:
            return Response({"error": "Missing event_id or image"}, status=400)
            
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response({"error": "Event not found"}, status=404)
            
        if event.host != request.user:
            return Response({"error": "Only host can perform batch recognition"}, status=403)
            
        # Get all enrolled students who have face embeddings
        enrollments = Enrollment.objects.filter(event=event).select_related('student')
        
        known_faces = {}
        student_map = {}
        
        for enrollment in enrollments:
            student = enrollment.student
            if student.face_embedding:
                known_faces[student.id] = student.face_embedding
                student_map[student.id] = student
                
        if not known_faces:
             return Response({"message": "No students with enrolled faces found for this event", "matches": []})
             
        # Perform recognition
        matches = recognize_faces_in_image(image_data, known_faces)
        
        results = []
        today = datetime.date.today()
        
        for match in matches:
            student_id = match['user_id']
            confidence = match['confidence']
            student = student_map[student_id]
            
            # Mark attendance
            # Determine status (logic similar to single mark)
            now = timezone.now()
            event_datetime = timezone.make_aware(
                datetime.datetime.combine(event.date, event.time)
            )
            is_late = now > event_datetime + event.duration
            status_val = 'late' if is_late else 'present'
            
            record, created = AttendanceRecord.objects.get_or_create(
                student=student,
                event=event,
                date=today,
                defaults={
                    'status': status_val,
                    'confidence_score': confidence,
                    'time': datetime.datetime.now().time(),
                }
            )
            
            results.append({
                "student": student.username,
                "status": "marked" if created else "already_marked",
                "time": record.time.strftime("%I:%M %p"),
                "confidence": round(confidence, 2)
            })
            
        return Response({
            "matches_count": len(results),
            "results": results
        })

    @action(detail=False, methods=['post'])
    def mark_live(self, request):
        event_id = request.data.get('event_id')
        image_data = request.data.get('image') # Base64 string
        
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
             return Response({"status": "error", "message": "Event not found"}, status=404)

        # Check if user is enrolled in the event
        user = request.user
        if not Enrollment.objects.filter(student=user, event=event).exists():
            return Response({
                "status": "error",
                "message": "You are not enrolled in this event. Please join using the event code first."
            }, status=403)

        # Check if user has enrolled their face
        if not user.face_embedding:
            return Response({
                "status": "error",
                "message": "Face not enrolled. Please enroll your face first."
            }, status=400)
        
        # Validate event timing
        now = timezone.now()
        event_datetime = timezone.make_aware(
            datetime.datetime.combine(event.date, event.time)
        )
        event_end = event_datetime + event.duration
        grace_end = event_end + datetime.timedelta(minutes=event.grace_period)
        
        if now < event_datetime:
            return Response({
                "status": "error",
                "message": f"Event has not started yet. It begins at {event.time.strftime('%I:%M %p')} on {event.date.strftime('%B %d, %Y')}."
            }, status=400)
        
        if now > grace_end:
            return Response({
                "status": "error",
                "message": "Event has ended. The grace period has expired."
            }, status=400)

        # Encode face from current image
        try:
            current_face_encoding = encode_face_from_base64(image_data)
            
            if current_face_encoding is None:
                return Response({
                    "status": "failed",
                    "message": "No face detected in image. Please ensure your face is clearly visible."
                }, status=400)
            
            # Compare with enrolled face
            is_match, confidence = compare_faces(user.face_embedding, current_face_encoding, tolerance=0.6)
            
            logger.info(f"Face comparison for user {user.username}: match={is_match}, confidence={confidence:.2f}")
            
        except Exception as e:
            logger.error(f"Error during face recognition: {str(e)}")
            return Response({
                "status": "error",
                "message": "Error processing face recognition",
                "error": str(e)
            }, status=400)
        
        if is_match:
            # Determine status: present or late
            now = timezone.now()
            event_datetime = timezone.make_aware(
                datetime.datetime.combine(event.date, event.time)
            )
            is_late = now > event_datetime + event.duration
            attendance_status = 'late' if is_late else 'present'
            
            # Check if already marked for today/session
            today = datetime.date.today()
            try:
                record, created = AttendanceRecord.objects.get_or_create(
                    student=user,
                    event=event,
                    date=today,
                    defaults={
                        'status': attendance_status,
                        'confidence_score': confidence,
                        'time': datetime.datetime.now().time(),
                    }
                )
            except Exception as e:
                logger.error(f"Error creating attendance record: {str(e)}")
                return Response({"status": "error", "message": "Could not mark attendance"}, status=400)

            if not created:
                 return Response({
                     "status": "already_marked", 
                     "student": user.username,
                     "time": record.time.strftime("%I:%M %p")
                 })

            return Response({
                "status": "marked", 
                "student": user.username,
                "time": record.time.strftime("%I:%M %p"),
                "confidence": round(confidence, 2)
            })
        else:
             return Response({
                 "status": "failed",
                 "message": "Face not recognized. Please ensure you are the enrolled user.",
                 "confidence": round(confidence, 2)
             }, status=400)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own profile unless admin
        if self.request.user.role == 'admin':
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def enroll_face(self, request):
        # We use detail=False to use /users/enroll_face/ (acting on current user)
        # Or detail=True for /users/<id>/enroll_face/
        # Let's use detail=False and rely on request.user which is simpler for the frontend
        
        user = request.user
        image_data = request.data.get('image')
        
        if not image_data:
            return Response({"message": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Encode face from image
        try:
            face_encoding = encode_face_from_base64(image_data)
            
            if face_encoding is None:
                return Response({
                    "message": "No face detected in image. Please ensure your face is clearly visible.",
                    "error": "NO_FACE_DETECTED"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Convert encoding to bytes for database storage
            encoding_bytes = face_encoding_to_bytes(face_encoding)
            user.face_embedding = encoding_bytes
            user.save(update_fields=["face_embedding"])
            
            logger.info(f"Face enrolled successfully for user {user.username}")
            
        except Exception as exc:
            logger.error(f"Error enrolling face: {str(exc)}")
            return Response({
                "message": "Failed to process image",
                "error": str(exc)
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Face enrolled successfully"})
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password"""
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response({"error": "Both old and new passwords are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify old password
        if not user.check_password(old_password):
            return Response({"error": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate new password length
        if len(new_password) < 8:
            return Response({"error": "New password must be at least 8 characters"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        logger.info(f"Password changed successfully for user {user.username}")
        return Response({"message": "Password changed successfully"})
    
    @action(detail=False, methods=['post'])
    def reset_face(self, request):
        """Reset user's face enrollment"""
        user = request.user
        
        if not user.face_embedding:
            return Response({"error": "No face data to reset"}, status=status.HTTP_400_BAD_REQUEST)
        
        user.face_embedding = None
        user.save(update_fields=["face_embedding"])
        
        logger.info(f"Face data reset for user {user.username}")
        return Response({"message": "Face data reset successfully"})


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user)
