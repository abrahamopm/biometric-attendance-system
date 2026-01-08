"""
Test biometric failure scenarios with low tolerance.

This test verifies:
1. System handles "No Match" without crashing
2. Backend logs distance_score for debugging
3. Frontend receives appropriate error messages
"""
import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient
from rest_framework import status
import numpy as np
import logging

from api.models import Event, Enrollment
from api.services.face_service import face_encoding_to_bytes

User = get_user_model()


@pytest.mark.django_db
class TestBiometricFailure(TestCase):
    """Test biometric failure scenarios"""

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
        
        # Create a face embedding for student (enrolled face)
        enrolled_encoding = np.random.rand(128).astype(np.float64)
        self.student.face_embedding = face_encoding_to_bytes(enrolled_encoding)
        self.student.save()
        
        # Create an event
        now = timezone.now()
        self.event = Event.objects.create(
            host=self.host,
            name='Test Event',
            description='Test Description',
            date=now.date(),
            time=now.time(),
            duration=timedelta(hours=1),
            grace_period=15
        )
        
        # Enroll student
        Enrollment.objects.create(student=self.student, event=self.event)
        
        # Authenticate as student
        self.client.force_authenticate(user=self.student)

    def test_low_tolerance_no_match(self):
        """Test: Low tolerance (0.1) should reject even similar faces"""
        # Create a different face encoding (imposter)
        imposter_encoding = np.random.rand(128).astype(np.float64)
        
        # Mock face recognition to return no match with low tolerance
        with patch('api.services.face_service.encode_face_from_base64', return_value=imposter_encoding), \
             patch('api.services.face_service.compare_faces') as mock_compare:
            
            # Set tolerance to 0.1 (very strict)
            # Simulate a match that fails due to low tolerance
            mock_compare.return_value = (False, 0.15)  # Distance 0.15 > tolerance 0.1
            
            # Capture logs
            with self.assertLogs('api.views', level='INFO') as log:
                fake_image = "data:image/jpeg;base64,/9j/4AAQSkZJRg=="
                
                response = self.client.post('/api/attendance/mark_live/', {
                    'event_id': self.event.id,
                    'image': fake_image
                }, format='json')
            
            # Should return 400 with "Face not recognized" message
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertEqual(response.data.get('status'), 'failed')
            self.assertIn('not recognized', response.data.get('message', '').lower())
            
            # Verify confidence score is returned
            self.assertIn('confidence', response.data)
            
            # Verify logging occurred
            self.assertTrue(any('Face comparison' in log_msg for log_msg in log.output))

    def test_very_different_face_rejection(self):
        """Test: Completely different face should be rejected"""
        # Create a very different encoding
        different_encoding = np.ones(128).astype(np.float64)  # All ones vs random
        
        with patch('api.services.face_service.encode_face_from_base64', return_value=different_encoding), \
             patch('api.services.face_service.compare_faces', return_value=(False, 0.8)):  # High distance
            
            fake_image = "data:image/jpeg;base64,/9j/4AAQSkZJRg=="
            
            response = self.client.post('/api/attendance/mark_live/', {
                'event_id': self.event.id,
                'image': fake_image
            }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get('status'), 'failed')
        self.assertIn('confidence', response.data)

    def test_no_face_detected_handling(self):
        """Test: Image with no face should return appropriate error"""
        with patch('api.services.face_service.encode_face_from_base64', return_value=None):
            fake_image = "data:image/jpeg;base64,/9j/4AAQSkZJRg=="
            
            response = self.client.post('/api/attendance/mark_live/', {
                'event_id': self.event.id,
                'image': fake_image
            }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get('status'), 'failed')
        self.assertIn('no face detected', response.data.get('message', '').lower())

    def test_face_recognition_exception_handling(self):
        """Test: Exception during face recognition should be caught gracefully"""
        with patch('api.services.face_service.encode_face_from_base64', side_effect=Exception("Face recognition error")):
            fake_image = "data:image/jpeg;base64,/9j/4AAQSkZJRg=="
            
            response = self.client.post('/api/attendance/mark_live/', {
                'event_id': self.event.id,
                'image': fake_image
            }, format='json')
        
        # Should return 400, not 500
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get('status'), 'error')
        self.assertIn('error', response.data.get('message', '').lower())
