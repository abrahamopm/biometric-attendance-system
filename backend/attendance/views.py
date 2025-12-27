from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import User, Subject, Event, Enrollment, AttendanceRecord, AuditLog
from .serializers import UserSerializer, SignupSerializer, SubjectSerializer, EventSerializer, AttendanceRecordSerializer
from .utils import extract_embedding, encrypt_embedding, decrypt_embedding, compare_embeddings
import random
import string
import os

class SignupView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = SignupSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Log action
            AuditLog.objects.create(user=user, action="Signup", ip_address=request.META.get('REMOTE_ADDR'))
            # In a real app, send verification email here
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(username=email, password=password)
        
        if user:
            if not user.is_verified:
                return Response({'error': 'Account not verified. Please check your email.'}, status=status.HTTP_403_FORBIDDEN)
                
            refresh = RefreshToken.for_user(user)
            AuditLog.objects.create(user=user, action="Login Success", ip_address=request.META.get('REMOTE_ADDR'))
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        
        # Log failed attempt if user exists
        try:
            u = User.objects.get(email=email)
            AuditLog.objects.create(user=u, action="Login Failed", ip_address=request.META.get('REMOTE_ADDR'))
        except User.DoesNotExist:
            pass
            
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    def get_object(self):
        return self.request.user

class SubjectCreateView(generics.CreateAPIView):
    serializer_class = SubjectSerializer
    def perform_create(self, serializer):
        # Generate 6-char unique code
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        while Subject.objects.filter(subject_code=code).exists():
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        serializer.save(host=self.request.user, subject_code=code)

class SubjectListView(generics.ListAPIView):
    serializer_class = SubjectSerializer
    def get_queryset(self):
        if self.request.user.role == 'Host':
            return Subject.objects.filter(host=self.request.user)
        return Subject.objects.filter(enrollments__attendee=self.request.user)

from django.core.mail import send_mail
from django.conf import settings

class EventCreateView(generics.CreateAPIView):
    serializer_class = EventSerializer
    def perform_create(self, serializer):
        event = serializer.save()
        # Fetch all enrolled attendees for the subject
        enrollments = Enrollment.objects.filter(subject=event.subject, is_active=True)
        attendee_emails = [e.attendee.email for e in enrollments]
        
        if attendee_emails:
            send_mail(
                subject=f"New Event Scheduled: {event.title}",
                message=f"Hi,\n\nA new event '{event.title}' has been scheduled for {event.subject.subject_name}.\nDate: {event.event_date}\nTime: {event.start_time}\nVenue: {event.venue}\n\nPlease be on time.",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=attendee_emails,
                fail_silently=True,
            )

class EventListView(generics.ListAPIView):
    serializer_class = EventSerializer
    def get_queryset(self):
        subject_id = self.request.query_params.get('subject_id')
        if subject_id:
            return Event.objects.filter(subject_id=subject_id)
        return Event.objects.none()

class FaceEnrollmentView(APIView):
    def post(self, request):
        subject_code = request.data.get('subject_code')
        image = request.FILES.get('image')
        
        if not subject_code or not image:
            return Response({'error': 'Subject code and image are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        subject = get_object_or_404(Subject, subject_code=subject_code)
        
        # Save temp image
        temp_path = f"temp_{request.user.id}.jpg"
        with open(temp_path, 'wb+') as destination:
            for chunk in image.chunks():
                destination.write(chunk)
        
        try:
            embedding, error = extract_embedding(temp_path)
            if error:
                return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)
            
            encrypted_emb = encrypt_embedding(embedding)
            
            # Save or Update enrollment
            enrollment, created = Enrollment.objects.get_or_create(
                subject=subject,
                attendee=request.user,
                defaults={'facial_embedding': encrypted_emb}
            )
            if not created:
                enrollment.facial_embedding = encrypted_emb
                enrollment.save()
            
            AuditLog.objects.create(user=request.user, action=f"Face Enrolled in {subject.subject_name}")
            return Response({'message': 'Face enrolled successfully'}, status=status.HTTP_201_CREATED)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

class AttendanceScanView(APIView):
    def post(self, request):
        event_id = request.data.get('event_id')
        image = request.FILES.get('image')
        
        if not event_id or not image:
            return Response({'error': 'Event ID and image are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        event = get_object_or_404(Event, event_id=event_id)
        
        # Save temp image
        temp_path = f"scan_{event_id}.jpg"
        with open(temp_path, 'wb+') as destination:
            for chunk in image.chunks():
                destination.write(chunk)
        
        try:
            live_embedding, error = extract_embedding(temp_path)
            if error:
                return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)
            
            # Match against all enrolled students for this subject
            enrollments = Enrollment.objects.filter(subject=event.subject, is_active=True)
            matched_enrollment = None
            
            for enrollment in enrollments:
                stored_emb = decrypt_embedding(enrollment.facial_embedding)
                match, score = compare_embeddings(live_embedding, stored_emb)
                if match:
                    matched_enrollment = enrollment
                    break
            
            if matched_enrollment:
                # Calculate status (Present/Late)
                now = timezone.now()
                # Dummy logic for time comparison (should compare event.start_time)
                # For brevity, let's say if it matches, it's Present or Late based on threshold
                # In real scenario, convert event.start_time to datetime
                status_str = 'Present'
                
                AttendanceRecord.objects.get_or_create(
                    event=event,
                    enrollment=matched_enrollment,
                    defaults={'status': status_str}
                )
                return Response({
                    'message': f'Attendance marked for {matched_enrollment.attendee.full_name}',
                    'attendee': matched_enrollment.attendee.full_name,
                    'status': status_str
                })
            else:
                return Response({'error': 'No matching face found among enrolled students'}, status=status.HTTP_404_NOT_FOUND)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

import csv
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

class ReportGenerationView(APIView):
    def get(self, request):
        event_id = request.query_params.get('event_id')
        format_type = request.query_params.get('format', 'csv')
        
        if not event_id:
            return Response({'error': 'Event ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        event = get_object_or_404(Event, event_id=event_id)
        records = AttendanceRecord.objects.filter(event=event).select_related('enrollment__attendee')
        
        if format_type == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="report_{event_id}.csv"'
            
            writer = csv.writer(response)
            writer.writerow(['Attendee Name', 'Email', 'Status', 'Timestamp'])
            for record in records:
                writer.writerow([
                    record.enrollment.attendee.full_name,
                    record.enrollment.attendee.email,
                    record.status,
                    record.timestamp
                ])
            return response
            
        elif format_type == 'pdf':
            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="report_{event_id}.pdf"'
            
            p = canvas.Canvas(response, pagesize=letter)
            p.drawString(100, 750, f"Attendance Report: {event.title}")
            p.drawString(100, 735, f"Subject: {event.subject.subject_name}")
            p.drawString(100, 720, f"Date: {event.event_date}")
            
            y = 680
            p.drawString(100, y, "Attendee Name")
            p.drawString(300, y, "Status")
            p.drawString(400, y, "Time")
            y -= 20
            
            for record in records:
                p.drawString(100, y, record.enrollment.attendee.full_name)
                p.drawString(300, y, record.status)
                p.drawString(400, y, str(record.timestamp.time()))
                y -= 20
                if y < 50:
                    p.showPage()
                    y = 750
                    
            p.save()
            return response
            
        return Response({'error': 'Invalid format'}, status=status.HTTP_400_BAD_REQUEST)

class DeleteFaceDataView(APIView):
    def delete(self, request):
        Enrollment.objects.filter(attendee=request.user).delete()
        AuditLog.objects.create(user=request.user, action="Deleted Biometric Data")
        return Response({'message': 'Biometric data deleted successfully'})

class ManualOverrideView(APIView):
    def post(self, request):
        if request.user.role != 'Host':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        record_id = request.data.get('attendance_id')
        new_status = request.data.get('status')
        
        record = get_object_or_404(AttendanceRecord, attendance_id=record_id)
        record.status = new_status
        record.is_manual_override = True
        record.recorded_by = request.user
        record.save()
        
        AuditLog.objects.create(user=request.user, action=f"Manual Override for {record_id} to {new_status}")
        return Response({'message': 'Status updated successfully'})
