import requests
import uuid
import time

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_user_signup_with_email_verification_and_role_assignment():
    signup_url = f"{BASE_URL}/api/auth/signup/"
    verify_email_url = f"{BASE_URL}/api/auth/verify-email/"
    headers = {"Content-Type": "application/json"}
    
    # Generate a unique username and email for the test
    unique_suffix = str(uuid.uuid4())[:8]
    username = f"testuser_{unique_suffix}"
    email = f"{username}@example.com"
    password = "TestPass123!"
    role = "host"  # testing role assignment with 'host'; can also try 'student' or 'admin'
    
    signup_payload = {
        "username": username,
        "email": email,
        "password": password,
        "role": role
    }
    
    # Step 1: Signup the user
    try:
        signup_resp = requests.post(signup_url, json=signup_payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Signup request failed: {e}"
    
    # Assert status code 201 Created
    assert signup_resp.status_code == 201, f"Expected 201 on signup, got {signup_resp.status_code}, response: {signup_resp.text}"
    
    signup_data = signup_resp.json()
    assert "message" in signup_data and "user_id" in signup_data, f"Signup response missing expected keys, got: {signup_data}"
    user_id = signup_data["user_id"]
    
    # Since email verification token is sent via email, typically would require reading the email.
    # Here for test, assume token retrieval endpoint or mock. As not provided, try to simulate:
    # Hypothetical that system stores token under /api/auth/generate-verification-token/ (not in PRD)
    # Since no endpoint to get token is specified, we simulate as below:
    # For demonstration, assume token is returned in signup message or can be extracted.
    # If no token, test cannot proceed - we assert failure.
    
    # Attempt to find token in message (not standard, but no other option)
    # If not found, we will skip verification, but indicate test incomplete.
    
    # Example: message: "User created successfully. Verification token: <token>"
    token = None
    msg = signup_data.get("message", "")
    if "Verification token:" in msg:
        token = msg.split("Verification token:")[1].strip()
    else:
        # We do not have a way to retrieve verification token; so we cannot proceed to verify email properly.
        # This part will assert failure stating manual intervention needed or token retrieval logic missing.
        assert False, "Email verification token not found in signup response message, cannot verify email."
    
    verify_payload = {"token": token}
    
    # Step 2: Verify email using token
    try:
        verify_resp = requests.post(verify_email_url, json=verify_payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Email verification request failed: {e}"
    
    assert verify_resp.status_code == 200, f"Expected 200 on email verification, got {verify_resp.status_code}, response: {verify_resp.text}"
    verify_data = verify_resp.json()
    assert "message" in verify_data, f"Email verification response missing message, got: {verify_data}"
    
    # Additional: Verify role assignment by logging in and checking role
    login_url = f"{BASE_URL}/api/auth/login/"
    login_payload = {"username": username, "password": password}
    
    try:
        login_resp = requests.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"
    
    assert login_resp.status_code == 200, f"Expected 200 on login, got {login_resp.status_code}, response: {login_resp.text}"
    login_data = login_resp.json()
    assert "access" in login_data and "refresh" in login_data and "role" in login_data, f"Login response missing tokens or role, got: {login_data}"
    assert login_data["role"] == role, f"Expected role '{role}', got '{login_data['role']}'"

test_user_signup_with_email_verification_and_role_assignment()
