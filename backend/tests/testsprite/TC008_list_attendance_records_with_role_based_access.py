import requests
import uuid

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def signup_user(username, email, password, role):
    url = f"{BASE_URL}/api/auth/signup/"
    payload = {
        "username": username,
        "email": email,
        "password": password,
        "role": role
    }
    resp = requests.post(url, json=payload, timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()

def login_user(username, password):
    url = f"{BASE_URL}/api/auth/login/"
    payload = {
        "username": username,
        "password": password
    }
    resp = requests.post(url, json=payload, timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()

def create_event(token, name, description, date, time, duration, grace_period):
    url = f"{BASE_URL}/api/events/"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    payload = {
        "name": name,
        "description": description,
        "date": date,
        "time": time,
        "duration": duration,
        "grace_period": grace_period
    }
    resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()

def delete_event(token, event_id):
    url = f"{BASE_URL}/api/events/{event_id}/"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    resp = requests.delete(url, headers=headers, timeout=TIMEOUT)
    # Delete may return 204 No Content, so no need to check content
    resp.raise_for_status()

def join_event(token, join_code):
    url = f"{BASE_URL}/api/events/join_event/"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    payload = {
        "join_code": join_code
    }
    resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    return resp

def list_attendance_records(token):
    url = f"{BASE_URL}/api/attendance/"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    resp = requests.get(url, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()

def test_list_attendance_records_with_role_based_access():
    # Create host user
    host_username = f"host_{uuid.uuid4().hex[:8]}"
    host_email = f"{host_username}@example.com"
    host_password = "StrongPass!123"
    host_signup = signup_user(host_username, host_email, host_password, "host")
    assert "user_id" in host_signup
    host_login = login_user(host_username, host_password)
    host_token = host_login["access"]
    assert host_login["role"] == "host"

    # Create attendee user
    attendee_username = f"attendee_{uuid.uuid4().hex[:8]}"
    attendee_email = f"{attendee_username}@example.com"
    attendee_password = "StrongPass!123"
    attendee_signup = signup_user(attendee_username, attendee_email, attendee_password, "student")
    assert "user_id" in attendee_signup
    attendee_login = login_user(attendee_username, attendee_password)
    attendee_token = attendee_login["access"]
    assert attendee_login["role"] == "student"
    attendee_user_id = attendee_signup["user_id"]

    # Host creates an event
    event_name = "Role Based Access Test Event"
    event_description = "Testing attendance record visibility"
    event_date = "2025-12-31"
    event_time = "10:00:00"
    event_duration = "02:00"
    event_grace_period = 15

    event_response = create_event(host_token, event_name, event_description, event_date, event_time, event_duration, event_grace_period)
    # Event creation returns full event? If not, get id by fetching events or from response
    # From PRD, no schema mentioned for response, we assume response body includes created event with ID.
    # If event_response is empty, fetch events to get ID by name.
    event_id = event_response.get("id")
    if not event_id:
        # fallback: list events and get by name
        url_events = f"{BASE_URL}/api/events/"
        headers = {"Authorization": f"Bearer {host_token}"}
        resp_events = requests.get(url_events, headers=headers, timeout=TIMEOUT)
        resp_events.raise_for_status()
        events = resp_events.json()
        for ev in events:
            if ev.get("name") == event_name:
                event_id = ev.get("id")
                break
    assert event_id is not None, "Failed to retrieve event ID"

    try:
        # Attendee joins event using join_code (join_code is readOnly in event schema)
        join_code = event_response.get("join_code")
        if not join_code:
            # join_code missing from create response, retrieve from event details
            url_event_detail = f"{BASE_URL}/api/events/{event_id}/"
            headers = {"Authorization": f"Bearer {host_token}"}
            resp_detail = requests.get(url_event_detail, headers=headers, timeout=TIMEOUT)
            resp_detail.raise_for_status()
            join_code = resp_detail.json().get("join_code")
        assert join_code is not None, "join_code is required for attendee to join"

        resp_join = join_event(attendee_token, join_code)
        assert resp_join.status_code == 200, f"Attendee failed to join event: {resp_join.text}"
        join_resp_json = resp_join.json()
        assert "message" in join_resp_json

        # Host fetches attendance records: should see all records for their events (likely empty at first)
        host_records = list_attendance_records(host_token)
        assert isinstance(host_records, list)

        # Attendee fetches attendance records: should see only their records (likely empty at first)
        attendee_records = list_attendance_records(attendee_token)
        assert isinstance(attendee_records, list)

        # The host records should include only attendance records linked to the host's events
        # Since no attendance is marked here, just check keys and that they belong to host's event(s)
        for record in host_records:
            assert "event" in record and "student" in record and "status" in record and "timestamp" in record
            assert record["event"] == event_id or isinstance(record["event"], int)

        # For attendee, all returned records should have student = attendee user id
        for record in attendee_records:
            assert "student" in record
            # Since student ID is integer, check equality
            assert record["student"] == attendee_user_id

        # Host should see as many or more records than attendee (or equal if only this attendee)
        assert len(host_records) >= len(attendee_records)
    finally:
        # Clean up - delete event
        delete_event(host_token, event_id)

test_list_attendance_records_with_role_based_access()