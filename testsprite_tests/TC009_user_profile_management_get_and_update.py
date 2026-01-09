import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_user_profile_management_get_and_update():
    # Step 1: Signup a new user to test profile management
    signup_url = f"{BASE_URL}/api/auth/signup/"
    user_data = {
        "username": "testuser_profile",
        "email": "testuser_profile@example.com",
        "password": "StrongPass!123",
        "role": "student",
        "phone": "1234567890"
    }
    signup_resp = requests.post(signup_url, json=user_data, timeout=TIMEOUT)
    assert signup_resp.status_code == 201, f"Signup failed: {signup_resp.text}"
    user_id = signup_resp.json().get("user_id")
    assert user_id is not None, "User ID not returned on signup"
    
    # Step 2: Login to get JWT tokens
    login_url = f"{BASE_URL}/api/auth/login/"
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    login_resp = requests.post(login_url, json=login_data, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    login_json = login_resp.json()
    access_token = login_json.get("access")
    assert access_token is not None, "Access token not returned on login"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    try:
        # Step 3: Retrieve user profile details (GET /api/users/{id}/)
        user_get_url = f"{BASE_URL}/api/users/{user_id}/"
        get_resp = requests.get(user_get_url, headers=headers, timeout=TIMEOUT)
        assert get_resp.status_code == 200, f"Get user profile failed: {get_resp.text}"
        profile = get_resp.json()
        # Check keys indicating profile details (except biometric)
        assert "username" in profile and profile["username"] == user_data["username"], "Username mismatch"
        assert "email" in profile and profile["email"] == user_data["email"], "Email mismatch"
        # We do not expect biometric data in profile as per PRD
        
        # Step 4: Update user profile except biometric data (PUT /api/users/{id}/)
        updated_profile_data = {
            "username": "updated_testuser_profile",
            "email": "updated_testuser_profile@example.com",
            "phone": "0987654321"
        }
        # Send PUT request to update user profile
        put_resp = requests.put(user_get_url, json=updated_profile_data, headers=headers, timeout=TIMEOUT)
        assert put_resp.status_code == 200, f"Update user profile failed: {put_resp.text}"
        updated_profile = put_resp.json()
        # Validate response reflects updated data (username, email, phone)
        assert updated_profile.get("username") == updated_profile_data["username"], "Username not updated"
        assert updated_profile.get("email") == updated_profile_data["email"], "Email not updated"
        assert updated_profile.get("phone") == updated_profile_data["phone"], "Phone not updated"
        
        # Step 5: Retrieve again to confirm persisted updates
        get_resp_after_update = requests.get(user_get_url, headers=headers, timeout=TIMEOUT)
        assert get_resp_after_update.status_code == 200, f"Get after update failed: {get_resp_after_update.text}"
        profile_after_update = get_resp_after_update.json()
        assert profile_after_update.get("username") == updated_profile_data["username"], "Username update not persisted"
        assert profile_after_update.get("email") == updated_profile_data["email"], "Email update not persisted"
        assert profile_after_update.get("phone") == updated_profile_data["phone"], "Phone update not persisted"

    finally:
        # Cleanup: Delete the created user
        # Assuming DELETE /api/users/{id}/ is allowed (not documented explicitly)
        # If not allowed, this block can be omitted or modified as per actual API
        delete_url = f"{BASE_URL}/api/users/{user_id}/"
        # Attempt delete with auth - ignoring failures as cleanup
        try:
            requests.delete(delete_url, headers=headers, timeout=TIMEOUT)
        except Exception:
            pass

test_user_profile_management_get_and_update()