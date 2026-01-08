import requests

BASE_URL = "http://localhost:8000"
LOGIN_ENDPOINT = f"{BASE_URL}/api/auth/login/"
SIGNUP_ENDPOINT = f"{BASE_URL}/api/auth/signup/"

def test_user_login_with_jwt_authentication_and_role_retrieval():
    # Define test user credentials
    test_user = {
        "username": "testuser_tc002",
        "email": "testuser_tc002@example.com",
        "password": "TestPass123!",
        "role": "student"
    }

    # First, create the user so that login can be tested
    # Signup requires username, email, password, and optionally role; role is needed here
    signup_payload = {
        "username": test_user["username"],
        "email": test_user["email"],
        "password": test_user["password"],
        "role": test_user["role"]
    }

    try:
        # Create user
        signup_response = requests.post(
            SIGNUP_ENDPOINT,
            json=signup_payload,
            timeout=30
        )
        assert signup_response.status_code == 201, f"Signup failed: {signup_response.text}"
        signup_json = signup_response.json()
        assert "user_id" in signup_json, "Signup response missing user_id"

        # Now login with the created user's credentials
        login_payload = {
            "username": test_user["username"],
            "password": test_user["password"]
        }

        login_response = requests.post(
            LOGIN_ENDPOINT,
            json=login_payload,
            timeout=30
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"

        login_json = login_response.json()
        # Assert JWT tokens and role are present and valid
        assert "access" in login_json, "Access token missing in login response"
        assert isinstance(login_json["access"], str) and len(login_json["access"]) > 0, "Invalid access token"
        assert "refresh" in login_json, "Refresh token missing in login response"
        assert isinstance(login_json["refresh"], str) and len(login_json["refresh"]) > 0, "Invalid refresh token"
        assert "role" in login_json, "User role missing in login response"
        assert login_json["role"] == test_user["role"], f"Expected role '{test_user['role']}', got '{login_json['role']}'"

    finally:
        # Cleanup: Attempt to delete the created user if API for user deletion is available.
        # The PRD does not specify user deletion endpoint, so skipping cleanup.
        # In real scenario, implement user deletion here if supported.
        pass

test_user_login_with_jwt_authentication_and_role_retrieval()