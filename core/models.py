from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    ROLE_CHOICES = (('Host', 'Host'), ('Attendee', 'Attendee'))
    
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    contact_number = models.CharField(max_length=20, blank=True)
    registration_date = models.DateTimeField(default=timezone.now)
    is_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'role']

    def __str__(self):
        return f"{self.full_name} ({self.role})"


class Subject(models.Model):
    host = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'Host'})
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=10, unique=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name


class Event(models.Model):
    STATUS_CHOICES = (('Scheduled', 'Scheduled'), ('Ongoing', 'Ongoing'), ('Completed', 'Completed'))
    
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=255)
    event_date = models.DateField()
    start_time = models.TimeField()
    venue = models.CharField(max_length=255, blank=True)
    late_threshold = models.IntegerField(default=15)  # minutes
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Scheduled')
    created_at = models.DateTimeField(default=timezone.now)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} ({self.subject.name})"


class Enrollment(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    attendee = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'Attendee'})
    facial_embedding = models.JSONField(null=True, blank=True)  # stores 512-d embedding list
    enrolled_at = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)  # privacy

    class Meta:
        unique_together = ('subject', 'attendee')


class AttendanceRecord(models.Model):
    STATUS_CHOICES = (('Present', 'Present'), ('Late', 'Late'), ('Absent', 'Absent'))
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='records')
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Absent')
    is_manual = models.BooleanField(default=False)
    recorded_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, limit_choices_to={'role': 'Host'})

    def __str__(self):
        return f"{self.enrollment.attendee} - {self.status} - {self.event}"
