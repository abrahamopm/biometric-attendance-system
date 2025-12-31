import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'biometric_attendance_system.settings')

app = Celery('biometric_attendance_system')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()