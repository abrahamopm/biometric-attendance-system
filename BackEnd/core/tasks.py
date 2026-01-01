from celery import shared_task
from django.core.mail import send_mail

from .models import Event, User


@shared_task
def send_session_reminder(event_id):
    try:
        event = Event.objects.get(id=event_id)
        subject = f"Reminder: {event.title} starts soon"
        message = (
            f"Your session '{event.title}' on {event.event_date} at {event.start_time} "
            "will begin shortly."
        )
        send_mail(subject, message, None, [event.subject.host.email])
        return True
    except Exception:
        return False


@shared_task
def send_absence_notification(attendee_id, event_id):
    try:
        attendee = User.objects.get(id=attendee_id)
        event = Event.objects.get(id=event_id)
        subject = f"Absence Notice - {event.title}"
        message = f"You were marked absent for '{event.title}' on {event.event_date}."
        send_mail(subject, message, None, [attendee.email])
        return True
    except Exception:
        return False
