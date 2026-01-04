import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_register_login(role, email, password):
    print(f"Testing {role}...")
    
    # Register
    register_url = f"{BASE_URL}/users/register/"
    register_data = {
        "email": email,
        "password": password,
        "full_name": f"Test {role}",
        "role": role
    }
    
    try:
        print(f"Registering {email}...")
        response = requests.post(register_url, json=register_data)
        print(f"Register Status: {response.status_code}")
        print(f"Register Response: {response.text}")
        
        if response.status_code == 400 and "already exists" in response.text:
            print("User already exists, proceeding to login.")
        elif response.status_code != 201:
            print("Registration failed.")
            # return
    except Exception as e:
        print(f"Registration Exception: {e}")
        return

    # Login
    login_url = f"{BASE_URL}/users/login/"
    login_data = {
        "email": email,
        "password": password
    }
    
    try:
        print(f"Logging in {email}...")
        response = requests.post(login_url, json=login_data)
        print(f"Login Status: {response.status_code}")
        print(f"Login Response: {response.text}")
    except Exception as e:
        print(f"Login Exception: {e}")

if __name__ == "__main__":
    test_register_login("Host", "host_test@example.com", "password123")
    print("-" * 20)
    test_register_login("Attendee", "student_test@example.com", "password123")
