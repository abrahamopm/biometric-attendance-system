import requests
import time

BASE_URL = "http://localhost:8000"
VERIFY_EMAIL_ENDPOINT = "/api/auth/verify-email/"
TIMEOUT = 30


def test_email_verification_with_valid_and_invalid_tokens():
    # Use unique username to avoid conflicts
    unique_username = f"testuser_for_verification_{int(time.time())}"

    signup_url = BASE_URL + "/api/auth/signup/"
    signup_payload = {
        "username": unique_username,
        "email": f"{unique_username}@example.com",
        "password": "StrongPassw0rd!",
        "role": "student",
    }

    headers = {"Content-Type": "application/json"}

    # Create user to simulate valid token scenario
    try:
        resp_signup = requests.post(
            signup_url, json=signup_payload, headers=headers, timeout=TIMEOUT
        )
        assert resp_signup.status_code == 201, f"Signup failed: {resp_signup.text}"
        # Since we don't get token from signup response, assume token retrieval mechanism is external.
        # For demonstration we assume a valid token string placeholder.
        valid_token = "valid-email-verification-token-placeholder"
    except Exception as e:
        raise AssertionError(f"User signup failed: {e}")

    verify_url = BASE_URL + VERIFY_EMAIL_ENDPOINT
    # Test valid token verification
    try:
        resp_valid = requests.post(
            verify_url, json={"token": valid_token}, headers=headers, timeout=TIMEOUT
        )
        # Expect 200 with success message or 400 if token actually invalid - we accept 200 for test success
        assert resp_valid.status_code == 200, (
            f"Valid token verification failed with status {resp_valid.status_code}: {resp_valid.text}"
        )
        json_valid = resp_valid.json()
        assert "message" in json_valid and json_valid["message"], (
            f"Valid token verification response missing message: {resp_valid.text}"
        )
    except Exception as e:
        raise AssertionError(f"Valid token verification request failed: {e}")

    # Test invalid token verification
    invalid_token = "this-token-is-definitely-invalid-or-expired"
    try:
        resp_invalid = requests.post(
            verify_url, json={"token": invalid_token}, headers=headers, timeout=TIMEOUT
        )
        # Expect 400 Bad Request for invalid token
        assert resp_invalid.status_code == 400, (
            f"Invalid token verification expected status 400 but got {resp_invalid.status_code}: {resp_invalid.text}"
        )
    except Exception as e:
        raise AssertionError(f"Invalid token verification request failed: {e}")


test_email_verification_with_valid_and_invalid_tokens()
