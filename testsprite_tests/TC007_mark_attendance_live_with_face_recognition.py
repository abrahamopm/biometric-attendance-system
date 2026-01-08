import requests
import base64
import time

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

# Helpers for user signup, login, event creation, face enrollment, and cleanup

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
    return resp.json()["user_id"]

def login_user(username, password):
    url = f"{BASE_URL}/api/auth/login/"
    payload = {
        "username": username,
        "password": password
    }
    resp = requests.post(url, json=payload, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    return data["access"], data["role"]

def create_event(access_token, event_data):
    url = f"{BASE_URL}/api/events/"
    headers = {"Authorization": f"Bearer {access_token}"}
    resp = requests.post(url, json=event_data, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()

def delete_event(access_token, event_id):
    url = f"{BASE_URL}/api/events/{event_id}/"
    headers = {"Authorization": f"Bearer {access_token}"}
    resp = requests.delete(url, headers=headers, timeout=TIMEOUT)
    if resp.status_code not in [204, 404]:
        resp.raise_for_status()

def enroll_face(access_token, image_b64):
    url = f"{BASE_URL}/api/users/enroll_face/"
    headers = {"Authorization": f"Bearer {access_token}"}
    payload = {"image": image_b64}
    resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()

def mark_attendance_live(access_token, event_id, image_b64):
    url = f"{BASE_URL}/api/attendance/mark_live/"
    headers = {"Authorization": f"Bearer {access_token}"}
    payload = {"event_id": event_id, "image": image_b64}
    return requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)

def test_TC007_mark_attendance_live_with_face_recognition():
    # Create host user and login
    host_username = "host_for_tc007"
    host_email = "host_tc007@example.com"
    host_password = "StrongPass!123"
    host_role = "host"

    host_user_id = signup_user(host_username, host_email, host_password, host_role)
    host_token, host_user_role = login_user(host_username, host_password)
    assert host_user_role == host_role

    # Create an event as host
    event_payload = {
        "name": "TC007 Test Event",
        "description": "Event to test live attendance marking",
        "date": time.strftime("%Y-%m-%d"),
        "time": time.strftime("%H:%M:%S"),
        "duration": "01:00:00",
        "grace_period": 5
    }
    event_resp = create_event(host_token, event_payload)
    event_id = event_resp.get("id")
    assert event_id is not None

    # Create attendee user and login
    attendee_username = "attendee_tc007"
    attendee_email = "attendee_tc007@example.com"
    attendee_password = "StrongPass!123"
    attendee_role = "student"
    attendee_user_id = signup_user(attendee_username, attendee_email, attendee_password, attendee_role)
    attendee_token, attendee_user_role = login_user(attendee_username, attendee_password)
    assert attendee_user_role == attendee_role

    # Enroll attendee face (simulated base64 image string)
    sample_face_image_b64 = base64.b64encode(b"fake_face_image_data_for_testing").decode("utf-8")
    enroll_resp = enroll_face(attendee_token, sample_face_image_b64)
    assert "message" in enroll_resp and "success" in enroll_resp["message"].lower()

    try:
        # 1. Mark attendance with recognized face (should succeed)
        resp1 = mark_attendance_live(attendee_token, event_id, sample_face_image_b64)
        assert resp1.status_code == 200
        data1 = resp1.json()
        assert "status" in data1
        assert data1["status"] in ["present", "late", "absent"]
        assert data1.get("student") == attendee_username or isinstance(data1.get("student"), str)
        assert "time" in data1

        # 2. Mark attendance again with same face (should fail due to duplicate)
        resp2 = mark_attendance_live(attendee_token, event_id, sample_face_image_b64)
        assert resp2.status_code == 400
        err_msg = resp2.json().get("detail","") or resp2.json().get("message", "")
        assert "already marked" in err_msg.lower() or "duplicate" in err_msg.lower()

        # 3. Mark attendance with unrecognized face image (should fail 400)
        unrecognized_face_b64 = base64.b64encode(b"unrecognized_face_image_data").decode("utf-8")
        resp3 = mark_attendance_live(attendee_token, event_id, unrecognized_face_b64)
        # Accept 400 response and check error message about face not recognized
        assert resp3.status_code == 400
        err_msg3 = resp3.json().get("detail","") or resp3.json().get("message", "")
        assert "not recognized" in err_msg3.lower() or "unrecognized" in err_msg3.lower()

        # 4. Mark attendance with invalid event_id (should return 404)
        resp4 = mark_attendance_live(attendee_token, 99999999, sample_face_image_b64)
        assert resp4.status_code == 404

    finally:
        # Cleanup - delete created event
        delete_event(host_token, event_id)

test_TC007_mark_attendance_live_with_face_recognition()
