from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from django.test import override_settings
from django.core import mail
from .models import Event, Enrollment, AttendanceRecord, EmailVerificationToken
import datetime

User = get_user_model()

class TestAuthAndAttendance(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(username="host1", password="pass1234", role="host")
        self.student = User.objects.create_user(username="student1", password="pass1234", role="student")
        self.client = APIClient()

    def auth(self, user):
        self.client.force_authenticate(user=user)

    def test_signup_and_login(self):
        resp = self.client.post('/api/auth/signup/', {
            "username": "newuser",
            "password": "pass1234",
            "email": "a@example.com"
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        # login via API should return tokens
        resp_login = self.client.post('/api/auth/login/', {
            "username": "newuser",
            "password": "pass1234"
        })
        self.assertEqual(resp_login.status_code, status.HTTP_200_OK)
        self.assertIn('access', resp_login.data)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_email_verification_flow(self):
        resp = self.client.post('/api/auth/signup/', {
            "username": "verifyme",
            "password": "pass1234",
            "email": "verify@example.com"
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(username="verifyme")
        token = EmailVerificationToken.objects.filter(user=user).first()
        self.assertIsNotNone(token)

        # Email dispatched
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(token.token, mail.outbox[0].body)

        verify_resp = self.client.post('/api/auth/verify-email/', {"token": token.token})
        self.assertEqual(verify_resp.status_code, status.HTTP_200_OK)

        user.refresh_from_db()
        self.assertTrue(user.is_email_verified)

    def test_join_event_creates_enrollment(self):
        # host creates event
        self.auth(self.host)
        event_resp = self.client.post(reverse('events-list'), {
            "name": "Class 1",
            "description": "",
            "date": datetime.date.today(),
            "time": datetime.datetime.now().time(),
            "duration": "01:00:00",
            "grace_period": 10
        })
        self.assertEqual(event_resp.status_code, status.HTTP_201_CREATED)
        join_code = event_resp.data['join_code']

        # student joins via code
        self.auth(self.student)
        join_resp = self.client.post(reverse('events-join-event'), {"join_code": join_code})
        self.assertEqual(join_resp.status_code, status.HTTP_200_OK)
        self.assertTrue(Enrollment.objects.filter(student=self.student, event_id=event_resp.data['id']).exists())

    def test_mark_live_creates_attendance_once(self):
        # create event
        event = Event.objects.create(
            host=self.host,
            name="Session",
            description="",
            date=datetime.date.today(),
            time=datetime.datetime.now().time(),
            duration=datetime.timedelta(hours=1),
            grace_period=10,
        )
        Enrollment.objects.create(student=self.student, event=event)

        self.auth(self.student)
        resp = self.client.post(reverse('attendance-mark-live'), {
            "event_id": event.id,
            "image": "testdata"
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(AttendanceRecord.objects.filter(student=self.student, event=event).count(), 1)

        # second attempt should not create duplicate due to unique constraint
        resp2 = self.client.post(reverse('attendance-mark-live'), {
            "event_id": event.id,
            "image": "testdata"
        })
        self.assertNotEqual(resp2.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(AttendanceRecord.objects.filter(student=self.student, event=event).count(), 1)
