import requests
import uuid
import time

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_list_enrollments_for_students():
    # Helper function to create a new student user
    def create_user(username, email, password, role="student"):
        url = f"{BASE_URL}/api/auth/signup/"
        payload = {
            "username": username,
            "email": email,
            "password": password,
            "role": role
        }
        resp = requests.post(url, json=payload, timeout=TIMEOUT)
        resp.raise_for_status()
        json_resp = resp.json()
        assert "user_id" in json_resp
        return json_resp["user_id"]

    # Helper function to login user and get access token
    def login_user(username, password):
        url = f"{BASE_URL}/api/auth/login/"
        payload = {"username": username, "password": password}
        resp = requests.post(url, json=payload, timeout=TIMEOUT)
        resp.raise_for_status()
        json_resp = resp.json()
        access_token = json_resp.get("access")
        role = json_resp.get("role")
        assert access_token and role == "student"
        return access_token

    # Helper function to create an event (as host)
    def create_event(token, name, date, time_str, duration="1h", grace_period=5):
        url = f"{BASE_URL}/api/events/"
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "name": name,
            "description": "Test Event for Enrollment",
            "date": date,
            "time": time_str,
            "duration": duration,
            "grace_period": grace_period
        }
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        json_resp = resp.json()
        assert resp.status_code == 201 or resp.status_code == 200
        # The created resource ID should be in response or fetch event list to find it
        if "id" in json_resp:
            return json_resp["id"]
        else:
            # fallback: get event list and find event by name
            events_resp = requests.get(url, headers=headers, timeout=TIMEOUT)
            events_resp.raise_for_status()
            for event in events_resp.json():
                if event.get("name") == name:
                    return event["id"]
        raise Exception("Event creation failed or event ID not found.")

    # Helper function to delete event (as host)
    def delete_event(token, event_id):
        url = f"{BASE_URL}/api/events/{event_id}/"
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.delete(url, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 204

    # Helper function to join event (as student)
    def join_event(token, join_code):
        url = f"{BASE_URL}/api/events/join_event/"
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"join_code": join_code}
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        json_resp = resp.json()
        assert "message" in json_resp
        return True

    # Helper function to get enrollments (as student)
    def get_enrollments(token):
        url = f"{BASE_URL}/api/enrollments/"
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(url, headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.json()

    # Create unique usernames and emails for student and host
    unique_suffix = str(uuid.uuid4())[:8]
    student_username = f"student_{unique_suffix}"
    student_email = f"{student_username}@example.com"
    student_password = "TestPass123!"

    host_username = f"host_{unique_suffix}"
    host_email = f"{host_username}@example.com"
    host_password = "HostPass123!"

    # Create host user and login to create event
    host_user_id = create_user(host_username, host_email, host_password, role="host")
    host_token = login_user(host_username, host_password)

    # Create student user and login
    student_user_id = create_user(student_username, student_email, student_password, role="student")
    student_token = login_user(student_username, student_password)

    # Create event as host
    event_name = f"Test Event {unique_suffix}"
    # Using date and time in ISO format (date: yyyy-mm-dd, time: HH:MM:SS)
    event_date = time.strftime("%Y-%m-%d")
    event_time = "12:00:00"
    event_id = None

    try:
        event_id = create_event(host_token, event_name, event_date, event_time)
        assert event_id is not None

        # Retrieve the event details to get join_code for the student to join
        event_detail_url = f"{BASE_URL}/api/events/{event_id}/"
        headers_host = {"Authorization": f"Bearer {host_token}"}
        resp = requests.get(event_detail_url, headers=headers_host, timeout=TIMEOUT)
        resp.raise_for_status()
        event_data = resp.json()
        join_code = event_data.get("join_code")
        assert join_code is not None

        # Student joins the event using join code
        join_event(student_token, join_code)

        # Get list of enrollments for the student and verify
        enrollments = get_enrollments(student_token)
        assert isinstance(enrollments, list)
        # Filter enrollments related to current student and event
        enrollment_found = False
        for enrollment in enrollments:
            if (enrollment.get("student") == student_user_id
                and enrollment.get("event")
                and isinstance(enrollment["event"], dict)
                and enrollment["event"].get("id") == event_id):
                enrollment_found = True
                # Validate enrollment fields
                assert "id" in enrollment
                assert "enrolled_at" in enrollment
                assert isinstance(enrollment["enrolled_at"], str)
                break

        assert enrollment_found, "Enrollment for the student in the event was not found in the list."

    finally:
        # Clean up: delete the event
        if event_id:
            delete_event(host_token, event_id)

test_list_enrollments_for_students()