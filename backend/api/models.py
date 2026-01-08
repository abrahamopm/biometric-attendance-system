from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta
import random
import string

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('host', 'Host'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=20, blank=True)
    face_embedding = models.BinaryField(null=True, blank=True, help_text="Numpy array bytes")
    is_email_verified = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=32, blank=True)
    
    def __str__(self):
        return f"{self.username} ({self.role})"

class Event(models.Model):
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hosted_events')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.DateField()
    time = models.TimeField()
    duration = models.DurationField(help_text="Duration of the session")
    grace_period = models.IntegerField(default=15, help_text="Minutes allowed for late entry")
    is_live = models.BooleanField(default=False, help_text="Is the session currently live for attendance?")
    join_code = models.CharField(max_length=6, unique=True, editable=False)
    
    def save(self, *args, **kwargs):
        if not self.join_code:
            self.join_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.join_code})"

class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('student', 'event')

class AttendanceRecord(models.Model):
    STATUS_CHOICES = (
        ('present', 'Present'),
        ('late', 'Late'),
        ('absent', 'Absent'),
    )
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attendance_records')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_records')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    date = models.DateField(auto_now_add=True)  # Added date field
    time = models.TimeField(auto_now_add=True)  # Added time field
    confidence_score = models.FloatField(help_text="Face recognition confidence")

    class Meta:
        unique_together = ('event', 'student', 'date')

    def __str__(self):
        return f"{self.student.username} - {self.event.name} - {self.status}"


def default_expiry():
    return timezone.now() + timedelta(hours=48)


class EmailVerificationToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_tokens')
    token = models.CharField(max_length=128, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=default_expiry)
    used = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Token for {self.user.username} (used={self.used})"
