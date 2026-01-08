from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from api.models import Event, Enrollment, AttendanceRecord
import datetime
from unittest.mock import patch, MagicMock

User = get_user_model()

class BatchAttendanceTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.host = User.objects.create_user(username='host', password='password123', role='host')
        self.student = User.objects.create_user(username='student', password='password123', role='student')
        
        # Simulate face embedding for student (dummy bytes)
        self.student.face_embedding = b'dummy_embedding'
        self.student.save()
        
        self.event = Event.objects.create(
            name='Test Event',
            date=datetime.date.today(),
            time=datetime.datetime.now().time(),
            host=self.host,
            duration=datetime.timedelta(hours=1)
        )
        
        Enrollment.objects.create(event=self.event, student=self.student)
        self.url = reverse('attendance-batch-recognize')

    @patch('api.views.recognize_faces_in_image')
    def test_batch_recognize_updates_attendance(self, mock_recognize):
        """
        Verify that if recognize_faces_in_image returns a match, 
        the system creates an AttendanceRecord.
        """
        self.client.force_authenticate(user=self.host)
        
        # Mock the service to return our student as a match
        mock_recognize.return_value = [{
            'user_id': self.student.id,
            'confidence': 0.95
        }]
        
        data = {
            'event_id': self.event.id,
            'image': 'base64_dummy_image_data'
        }
        
        response = self.client.post(self.url, data, format='json')
        
        # Assert response is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['matches_count'], 1)
        
        # Assert AttendanceRecord is created
        self.assertTrue(AttendanceRecord.objects.filter(
            event=self.event, 
            student=self.student
        ).exists())
        
        record = AttendanceRecord.objects.get(event=self.event, student=self.student)
        self.assertEqual(record.status, 'present') # Should be present as it's just started
        self.assertEqual(record.confidence_score, 0.95)

    @patch('api.views.recognize_faces_in_image')
    def test_batch_recognize_no_match(self, mock_recognize):
        """
        Verify that no record is created if no faces match.
        """
        self.client.force_authenticate(user=self.host)
        
        mock_recognize.return_value = [] # No matches
        
        data = {
            'event_id': self.event.id,
            'image': 'base64_dummy_image_data'
        }
        
        response = self.client.post(self.url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['matches_count'], 0)
        
        # Assert NO record created
        self.assertFalse(AttendanceRecord.objects.filter(
            event=self.event, 
            student=self.student
        ).exists())
