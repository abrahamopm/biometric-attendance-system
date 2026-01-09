"""
Automated tests for attendance marking logic.

Tests cover:
- Time validation (future events, expired events, grace periods)
- Enrollment checks
- Duplicate marking prevention
- Late status detection
"""
import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta, date, time
from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient
from rest_framework import status
import numpy as np

from api.models import Event, Enrollment, AttendanceRecord
from api.services.face_service import face_encoding_to_bytes

User = get_user_model()


@pytest.mark.django_db
class TestAttendanceLogic(TestCase):
    """Test attendance marking logic with time manipulation scenarios"""

    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create test users
        self.host = User.objects.create_user(
            username='host_user',
            password='testpass123',
            role='host'
        )
        
        self.student = User.objects.create_user(
            username='student_user',
            password='testpass123',
            role='student'
        )
        
        # Create a face embedding for student
        fake_encoding = np.random.rand(128).astype(np.float64)
        self.student.face_embedding = face_encoding_to_bytes(fake_encoding)
        self.student.save()
        
        # Create an event (starts in 1 hour, lasts 1 hour, 15 min grace)
        future_time = timezone.now() + timedelta(hours=1)
        self.event = Event.objects.create(
            host=self.host,
            name='Test Event',
            description='Test Description',
            date=future_time.date(),
            time=future_time.time(),
            duration=timedelta(hours=1),
            grace_period=15
        )
        
        # Authenticate as student
        self.client.force_authenticate(user=self.student)

    def test_future_event_rejection(self):
        """Test: Attempting to mark attendance before event starts should return 400"""
        # Event starts in 1 hour, current time is now
        # Mock time to be 30 minutes before event start
        event_start = timezone.make_aware(
            datetime.combine(self.event.date, self.event.time)
        )
        mock_now = event_start - timedelta(minutes=30)
        
        with patch('api.views.timezone.now', return_value=mock_now):
            # Create a fake face image (base64)
            fake_image = "data:image/jpeg;base64,/9j/4AAQSkZJRg=="
            
            response = self.client.post('/api/attendance/mark_live/', {
                'event_id': self.event.id,
                'image': fake_image
            }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('not started', response.data.get('message', '').lower())

    def test_expired_event_rejection(self):
        """Test: Attempting to mark attendance after grace period should return 400"""
        # Enroll student first
        Enrollment.objects.create(student=self.student, event=self.event)
        
        # Mock time to be 2 hours after event start (1 hour event + 15 min grace = 1h15m total)
        event_start = timezone.make_aware(
            datetime.combine(self.event.date, self.event.time)
        )
        event_end = event_start + self.event.duration + timedelta(minutes=self.event.grace_period)
        mock_now = event_end + timedelta(minutes=5)  # 5 minutes after grace period
        
        with patch('api.views.timezone.now', return_value=mock_now):
            fake_image = "data:image/jpeg;base64,/9j/4AAQSkZJRg=="
            
            response = self.client.post('/api/attendance/mark_live/', {
                'event_id': self.event.id,
                'image': fake_image
            }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('ended', response.data.get('message', '').lower())

    def test_late_grace_period_detection(self):
        """Test: Marking attendance during grace period should set status='late'"""
        # Enroll student
        Enrollment.objects.create(student=self.student, event=self.event)
        
        # Create event that started 5 minutes ago, duration is 1 hour, grace is 10 minutes
        # So we're 5 minutes past the 1-hour duration, but within 10-minute grace
        past_time = timezone.now() - timedelta(minutes=5)
        self.event.date = past_time.date()
        self.event.time = past_time.time()
        self.event.duration = timedelta(hours=1)
        self.event.grace_period = 10  # 10 minute grace
        self.event.save()
        
        # Mock time to be 1 hour 5 minutes after start (5 minutes into grace period)
        event_start = timezone.make_aware(
            datetime.combine(self.event.date, self.event.time)
        )
        mock_now = event_start + timedelta(hours=1, minutes=5)
        
        # Mock face recognition to return match
        with patch('api.views.timezone.now', return_value=mock_now), \
             patch('api.services.face_service.encode_face_from_base64', return_value=np.random.rand(128).astype(np.float64)), \
             patch('api.services.face_service.compare_faces', return_value=(True, 0.3)):
            
            fake_image = "data:image/jpeg;base64,/9j/4AAQSkZJRg=="
            
            response = self.client.post('/api/attendance/mark_live/', {
                'event_id': self.event.id,
                'image': fake_image
            }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('status'), 'marked')
        
        # Verify record was created with 'late' status
        record = AttendanceRecord.objects.get(student=self.student, event=self.event)
        self.assertEqual(record.status, 'late')

    def test_no_enrollment_rejection(self):
        """Test: Attempting to mark attendance without enrollment should return 403"""
        # Don't create enrollment
        
        # Create event that's currently active
        now = timezone.now()
        self.event.date = now.date()
        self.event.time = now.time()
        self.event.save()
        
        fake_image = "data:image/jpeg;base64,/9j/4AAQSkZJRg=="
        
        response = self.client.post('/api/attendance/mark_live/', {
            'event_id': self.event.id,
            'image': fake_image
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('not enrolled', response.data.get('message', '').lower())

    def test_duplicate_marking_rejection(self):
        """Test: Attempting to mark attendance twice should return 'already_marked'"""
        # Enroll student
        Enrollment.objects.create(student=self.student, event=self.event)
        
        # Create event that's currently active
        now = timezone.now()
        self.event.date = now.date()
        self.event.time = now.time()
        self.event.save()
        
        # Mock face recognition
        with patch('api.services.face_service.encode_face_from_base64', return_value=np.random.rand(128).astype(np.float64)), \
             patch('api.services.face_service.compare_faces', return_value=(True, 0.3)):
            
            fake_image = "data:image/jpeg;base64,/9j/4AAQSkZJRg=="
            
            # First marking - should succeed
            response1 = self.client.post('/api/attendance/mark_live/', {
                'event_id': self.event.id,
                'image': fake_image
            }, format='json')
            
            self.assertEqual(response1.status_code, status.HTTP_200_OK)
            self.assertEqual(response1.data.get('status'), 'marked')
            
            # Second marking - should return 'already_marked'
            response2 = self.client.post('/api/attendance/mark_live/', {
                'event_id': self.event.id,
                'image': fake_image
            }, format='json')
            
            self.assertEqual(response2.status_code, status.HTTP_200_OK)
            self.assertEqual(response2.data.get('status'), 'already_marked')

    def test_present_status_on_time(self):
        """Test: Marking attendance on time should set status='present'"""
        # Enroll student
        Enrollment.objects.create(student=self.student, event=self.event)
        
        # Create event that started 30 minutes ago (within duration)
        past_time = timezone.now() - timedelta(minutes=30)
        self.event.date = past_time.date()
        self.event.time = past_time.time()
        self.event.duration = timedelta(hours=1)
        self.event.save()
        
        # Mock time to be 30 minutes after start (within 1-hour duration)
        event_start = timezone.make_aware(
            datetime.combine(self.event.date, self.event.time)
        )
        mock_now = event_start + timedelta(minutes=30)
        
        with patch('api.views.timezone.now', return_value=mock_now), \
             patch('api.services.face_service.encode_face_from_base64', return_value=np.random.rand(128).astype(np.float64)), \
             patch('api.services.face_service.compare_faces', return_value=(True, 0.3)):
            
            fake_image = "data:image/jpeg;base64,/9j/4AAQSkZJRg=="
            
            response = self.client.post('/api/attendance/mark_live/', {
                'event_id': self.event.id,
                'image': fake_image
            }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify record was created with 'present' status
        record = AttendanceRecord.objects.get(student=self.student, event=self.event)
        self.assertEqual(record.status, 'present')

    def test_no_face_enrollment_rejection(self):
        """Test: Attempting to mark attendance without face enrollment should return 400"""
        # Remove face embedding
        self.student.face_embedding = None
        self.student.save()
        
        # Enroll student
        Enrollment.objects.create(student=self.student, event=self.event)
        
        # Create event that's currently active
        now = timezone.now()
        self.event.date = now.date()
        self.event.time = now.time()
        self.event.save()
        
        fake_image = "data:image/jpeg;base64,/9j/4AAQSkZJRg=="
        
        response = self.client.post('/api/attendance/mark_live/', {
            'event_id': self.event.id,
            'image': fake_image
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('face', response.data.get('message', '').lower())
        self.assertIn('enroll', response.data.get('message', '').lower())
