import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_face_enrollment_with_valid_image_upload():
    # First, signup a test user
    signup_url = f"{BASE_URL}/api/auth/signup/"
    login_url = f"{BASE_URL}/api/auth/login/"
    enroll_face_url = f"{BASE_URL}/api/users/enroll_face/"
    
    test_user = {
        "username": "testfaceuser",
        "email": "testfaceuser@example.com",
        "password": "StrongPassw0rd!",
        "role": "student"
    }
    
    headers = {"Content-Type": "application/json"}
    
    # Signup user or ignore if already exists
    signup_resp = requests.post(signup_url, json=test_user, headers=headers, timeout=TIMEOUT)
    if signup_resp.status_code == 400:
        resp_json = signup_resp.json()
        if "username" in resp_json and any("already exists" in msg for msg in resp_json["username"]):
            # User already exists, proceed
            pass
        else:
            assert False, f"Signup failed with status {signup_resp.status_code}: {signup_resp.text}"
    else:
        assert signup_resp.status_code == 201, f"Signup failed with status {signup_resp.status_code}: {signup_resp.text}"
    
    # Login user to get JWT token
    login_payload = {
        "username": test_user["username"],
        "password": test_user["password"]
    }
    login_resp = requests.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}: {login_resp.text}"
    login_data = login_resp.json()
    assert "access" in login_data, "Access token missing in login response"
    
    access_token = login_data["access"]
    auth_headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Prepare a valid base64 encoded image string (a simple 1x1 px PNG base64)
    valid_base64_image = (
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+XItcAAAAASUVORK5CYII="
    )
    
    enroll_payload = {
        "image": valid_base64_image
    }
    
    enroll_resp = requests.post(enroll_face_url, json=enroll_payload, headers=auth_headers, timeout=TIMEOUT)
    assert enroll_resp.status_code == 200, f"Face enrollment failed with status {enroll_resp.status_code}: {enroll_resp.text}"
    enroll_resp_json = enroll_resp.json()
    assert "message" in enroll_resp_json, "Response missing 'message' field"
    assert enroll_resp_json["message"].lower().find("success") >= 0, "Enrollment success message not found"

test_face_enrollment_with_valid_image_upload()
