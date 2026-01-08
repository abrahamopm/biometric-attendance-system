import requests
import uuid
import datetime

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

# Test credentials and user info for host user
HOST_USERNAME = f"host_tc004_{uuid.uuid4().hex[:8]}"
HOST_EMAIL = f"{HOST_USERNAME}@example.com"
HOST_PASSWORD = "StrongPass!234"
HOST_ROLE = "host"

def test_event_management_create_read_update_delete_operations():
    session = requests.Session()
    try:
        # 1. Signup as host user
        signup_resp = session.post(
            f"{BASE_URL}/api/auth/signup/",
            json={
                "username": HOST_USERNAME,
                "email": HOST_EMAIL,
                "password": HOST_PASSWORD,
                "role": HOST_ROLE
            },
            timeout=TIMEOUT
        )
        assert signup_resp.status_code == 201, f"Signup failed: {signup_resp.text}"
        signup_json = signup_resp.json()
        assert "user_id" in signup_json

        # NOTE: In a real scenario, here we would fetch the verification token from email or DB
        # For test, we simulate email verification with a dummy token returned or test server disables email validation.
        # Since no token provided or method to fetch, we skip email verification step assuming testing env allows it.
        # Otherwise the test cannot proceed. If needed, implement token fetch here.
        
        # 2. Login as the host user
        login_resp = session.post(
            f"{BASE_URL}/api/auth/login/",
            json={
                "username": HOST_USERNAME,
                "password": HOST_PASSWORD
            },
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_json = login_resp.json()
        access_token = login_json.get("access")
        assert access_token, "Access token missing in login response"
        assert login_json.get("role") == HOST_ROLE

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        # Prepare event data to create
        event_name = f"Test Event {uuid.uuid4().hex[:6]}"
        event_date = (datetime.date.today() + datetime.timedelta(days=1)).isoformat()  # tomorrow
        event_time = "10:00:00"  # 10 AM
        event_duration = "01:30"  # 1 hour 30 minutes
        event_grace_period = 15

        # 3. Create event (POST /api/events/)
        create_resp = session.post(
            f"{BASE_URL}/api/events/",
            headers=headers,
            json={
                "name": event_name,
                "description": "Automated test event description",
                "date": event_date,
                "time": event_time,
                "duration": event_duration,
                "grace_period": event_grace_period
            },
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 201, f"Create event failed: {create_resp.text}"

        # 4. Retrieve list of events (GET /api/events/)
        list_resp = session.get(
            f"{BASE_URL}/api/events/",
            headers=headers,
            timeout=TIMEOUT
        )
        assert list_resp.status_code == 200, f"List events failed: {list_resp.text}"
        events_list = list_resp.json()
        assert isinstance(events_list, list)
        # Find the created event id in the list by matching name & date
        created_event = None
        for ev in events_list:
            if ev.get("name") == event_name and ev.get("date") == event_date:
                created_event = ev
                break
        assert created_event is not None, "Created event not found in event list"
        event_id = created_event.get("id")
        assert isinstance(event_id, int)

        # 5. Retrieve event details (GET /api/events/{id}/)
        detail_resp = session.get(
            f"{BASE_URL}/api/events/{event_id}/",
            headers=headers,
            timeout=TIMEOUT
        )
        assert detail_resp.status_code == 200, f"Get event detail failed: {detail_resp.text}"
        event_detail = detail_resp.json()
        # Check a few fields to match
        assert event_detail.get("name") == event_name
        assert event_detail.get("date") == event_date
        assert event_detail.get("time") == event_time

        # 6. Update event (PUT /api/events/{id}/)
        updated_event_name = event_name + " Updated"
        updated_description = "Updated event description by automated test"
        update_resp = session.put(
            f"{BASE_URL}/api/events/{event_id}/",
            headers=headers,
            json={
                "name": updated_event_name,
                "description": updated_description,
                "date": event_date,
                "time": event_time,
                "duration": event_duration,
                "grace_period": event_grace_period
            },
            timeout=TIMEOUT
        )
        assert update_resp.status_code == 200, f"Update event failed: {update_resp.text}"
        updated_event = update_resp.json()
        assert updated_event.get("name") == updated_event_name
        assert updated_event.get("description") == updated_description

        # 7. Delete event (DELETE /api/events/{id}/)
        delete_resp = session.delete(
            f"{BASE_URL}/api/events/{event_id}/",
            headers=headers,
            timeout=TIMEOUT
        )
        assert delete_resp.status_code == 204, f"Delete event failed: {delete_resp.text}"

        # 8. Verify deletion (GET /api/events/{id}/) should return 404
        verify_delete_resp = session.get(
            f"{BASE_URL}/api/events/{event_id}/",
            headers=headers,
            timeout=TIMEOUT
        )
        assert verify_delete_resp.status_code == 404, "Deleted event still accessible"

    finally:
        # Cleanup: no additional cleanup needed for this test case as event deleted
        pass


test_event_management_create_read_update_delete_operations()
