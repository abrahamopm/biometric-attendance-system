import requests
import uuid
import datetime

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_join_event_using_valid_and_invalid_join_codes():
    # Helper function to signup user
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

    # Helper function to login user
    def login_user(username, password):
        url = f"{BASE_URL}/api/auth/login/"
        payload = {
            "username": username,
            "password": password
        }
        resp = requests.post(url, json=payload, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.json()

    # Helper function to create event (as host)
    def create_event(token, name, description, date, time, duration, grace_period):
        url = f"{BASE_URL}/api/events/"
        headers = {"Authorization": f"Bearer {token}"}
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

    # Helper function to delete event (clean up)
    def delete_event(token, event_id):
        url = f"{BASE_URL}/api/events/{event_id}/"
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.delete(url, headers=headers, timeout=TIMEOUT)
        if resp.status_code not in (204, 404):
            resp.raise_for_status()

    # 1. Create a host user and login
    host_username = f"hostuser_{uuid.uuid4().hex[:8]}"
    host_email = f"{host_username}@example.com"
    host_password = "HostPass123!"
    signup_resp = signup_user(host_username, host_email, host_password, "host")
    assert "user_id" in signup_resp

    login_resp = login_user(host_username, host_password)
    host_token = login_resp.get("access")
    assert host_token is not None
    assert login_resp.get("role") == "host"

    # 2. Create an event as host to get a valid join_code
    today = datetime.date.today()
    event_name = f"Test Event {uuid.uuid4().hex[:5]}"
    event_description = "Test event for join code"
    event_date = today.isoformat()
    event_time = "12:00:00"
    event_duration = "01:00:00"
    event_grace_period = 5

    event_data = create_event(
        host_token,
        event_name,
        event_description,
        event_date,
        event_time,
        event_duration,
        event_grace_period,
    )
    event_id = event_data.get("id")
    # Join code is readOnly on event creation so may be included on response or not; we fetch event details to get join_code
    assert event_id is not None

    # Get event details to fetch join_code
    url_event_detail = f"{BASE_URL}/api/events/{event_id}/"
    headers = {"Authorization": f"Bearer {host_token}"}
    resp_event = requests.get(url_event_detail, headers=headers, timeout=TIMEOUT)
    resp_event.raise_for_status()
    event_detail = resp_event.json()
    join_code = event_detail.get("join_code")
    assert join_code and isinstance(join_code, str) and len(join_code) > 0

    # 3. Create an attendee user and login
    attendee_username = f"attendee_{uuid.uuid4().hex[:8]}"
    attendee_email = f"{attendee_username}@example.com"
    attendee_password = "AttendeePass123!"
    signup_resp_attendee = signup_user(attendee_username, attendee_email, attendee_password, "student")
    assert "user_id" in signup_resp_attendee

    login_resp_attendee = login_user(attendee_username, attendee_password)
    attendee_token = login_resp_attendee.get("access")
    assert attendee_token is not None
    assert login_resp_attendee.get("role") == "student"

    # Authorization header for attendee
    headers_attendee = {"Authorization": f"Bearer {attendee_token}"}

    # 4. Try joining event with valid join_code
    url_join = f"{BASE_URL}/api/events/join_event/"
    payload_valid = {"join_code": join_code}
    resp_join_valid = requests.post(url_join, json=payload_valid, headers=headers_attendee, timeout=TIMEOUT)
    assert resp_join_valid.status_code == 200
    resp_data_valid = resp_join_valid.json()
    assert "message" in resp_data_valid and isinstance(resp_data_valid["message"], str)

    # 5. Try joining event with invalid join_code
    invalid_code = "INVALIDCODE123"
    payload_invalid = {"join_code": invalid_code}
    resp_join_invalid = requests.post(url_join, json=payload_invalid, headers=headers_attendee, timeout=TIMEOUT)
    assert resp_join_invalid.status_code == 404
    try:
        resp_join_invalid.json()
    except Exception:
        # Response might not be JSON, but we expect it to be JSON. If not, pass as test expects error code.
        pass

    # Cleanup: delete created event
    delete_event(host_token, event_id)

test_join_event_using_valid_and_invalid_join_codes()