from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from api.models import Event, AttendanceRecord, Enrollment
import datetime
from django.utils import timezone

User = get_user_model()

class HostStatsTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(username='host', password='password', role='host')
        self.client.force_authenticate(user=self.host)
        
        # Create students
        self.student1 = User.objects.create_user(username='student1', password='password')
        self.student2 = User.objects.create_user(username='student2', password='password')

    def test_stats_counts(self):
        # 1. Create an active session (today)
        today = datetime.date.today()
        event_today = Event.objects.create(
            host=self.host,
            name="Today Event",
            date=today,
            time=datetime.time(10, 0),
            duration=datetime.timedelta(hours=1)
        )
        
        # 2. Create a past event
        past_date = today - datetime.timedelta(days=1)
        event_past = Event.objects.create(
            host=self.host,
            name="Past Event",
            date=past_date,
            time=datetime.time(10, 0),
            duration=datetime.timedelta(hours=1)
        )
        
        # 3. Enroll students
        Enrollment.objects.create(student=self.student1, event=event_today)
        Enrollment.objects.create(student=self.student1, event=event_past)
        Enrollment.objects.create(student=self.student2, event=event_past)
        
        # 4. Mark attendance for past event
        # Student 1 present, Student 2 absent (no record)
        AttendanceRecord.objects.create(
            event=event_past,
            student=self.student1,
            status='present',
            confidence_score=0.9
        )
        
        
        # Fetch stats
        url = reverse('events-stats') # This should be /api/events/stats/
        
        response = self.client.get(url)
        
        if response.status_code != status.HTTP_200_OK:
            print(f"Failed with status {response.status_code}")
            print(f"Response data: {response.data}")
            
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data
        
        # Total Students: Should be 2 (student1 and student2)
        self.assertEqual(data['total_students'], 2, f"Expected 2 total students, got {data['total_students']}")
        
        # Active Sessions: Should be 1 (event_today)
        self.assertEqual(data['active_sessions'], 1, f"Expected 1 active session, got {data['active_sessions']}")
        
        # Avg Attendance: 
        # Past event has 2 enrollments. 1 attendance record.
        # 1/2 = 50%
        self.assertEqual(data['avg_attendance'], 50.0, f"Expected 50.0 avg attendance, got {data['avg_attendance']}")
