import streamlit as st
import requests
import pandas as pd
import cv2
import time
from datetime import datetime
import io

# Configuration
API_URL = "http://localhost:8000/api"

# Page config
st.set_page_config(page_title="BioAttend - Biometric Attendance System", layout="wide")

# Custom CSS for Premium Look
st.markdown("""
    <style>
    .main {
        background-color: #0e1117;
        color: #ffffff;
    }
    .stButton>button {
        width: 100%;
        border-radius: 5px;
        height: 3em;
        background-color: #4CAF50;
        color: white;
    }
    .stTextInput>div>div>input {
        border-radius: 5px;
    }
    .stTable {
        background-color: #1e2130;
        border-radius: 10px;
    }
    .card {
        padding: 20px;
        border-radius: 10px;
        background-color: #262730;
        margin-bottom: 15px;
        border: 1px solid #4CAF50;
    }
    .status-present { color: #4CAF50; font-weight: bold; }
    .status-late { color: #FFC107; font-weight: bold; }
    .status-absent { color: #F44336; font-weight: bold; }
    </style>
    """, unsafe_allow_html=True)

# Session State Initialization
if 'token' not in st.session_state:
    st.session_state.token = None
if 'user' not in st.session_state:
    st.session_state.user = None

def get_headers():
    return {"Authorization": f"Bearer {st.session_state.token}"}

def login(email, password):
    try:
        response = requests.post(f"{API_URL}/login/", json={"email": email, "password": password})
        if response.status_code == 200:
            data = response.json()
            st.session_state.token = data['access']
            st.session_state.user = data['user']
            st.rerun()
        else:
            st.error("Invalid credentials")
    except Exception as e:
        st.error(f"Connection error: {e}")

def signup(email, password, full_name, role, contact):
    try:
        response = requests.post(f"{API_URL}/signup/", json={
            "email": email, "password": password, "full_name": full_name, "role": role, "contact_number": contact
        })
        if response.status_code == 201:
            st.success("Account created! Please login.")
            return True
        else:
            st.error(f"Error: {response.text}")
            return False
    except Exception as e:
        st.error(f"Connection error: {e}")
        return False

# Main Navigation
if st.session_state.token is None:
    tab1, tab2 = st.tabs(["Login", "Signup"])
    
    with tab1:
        st.header("Login to BioAttend")
        email = st.text_input("Email", key="login_email")
        password = st.text_input("Password", type="password", key="login_pass")
        if st.button("Login"):
            login(email, password)
            
    with tab2:
        st.header("Create an Account")
        new_name = st.text_input("Full Name")
        new_email = st.text_input("Email")
        new_pass = st.text_input("Password", type="password")
        new_role = st.selectbox("Role", ["Host", "Attendee"])
        new_contact = st.text_input("Contact Number")
        if st.button("Signup"):
            signup(new_email, new_pass, new_name, new_role, new_contact)

else:
    # Sidebar
    st.sidebar.title(f"BioAttend")
    st.sidebar.subheader(f"{st.session_state.user['full_name']}")
    st.sidebar.info(f"Role: {st.session_state.user['role']}")
    
    menu = ["Dashboard", "Profile"]
    if st.session_state.user['role'] == "Host":
        menu += ["Manage Subjects", "Events", "Start Attendance", "Reports"]
    else:
        menu += ["Enroll in Subject", "My Attendance"]
    
    choice = st.sidebar.selectbox("Menu", menu)
    
    if st.sidebar.button("Logout"):
        st.session_state.token = None
        st.session_state.user = None
        st.rerun()

    # Dashboard
    if choice == "Dashboard":
        st.title("🚀 Dashboard")
        col1, col2, col3 = st.columns(3)
        
        # This would usually fetch stats from API
        col1.metric("Enrolled Subjects", "5")
        col2.metric("Attendance Rate", "92%")
        col3.metric("Last Action", "Logged In")
        
        st.write("---")
        st.subheader("Recent Activity")
        # Placeholder for dynamic activity logs
        st.info("No recent activities to show.")

    # Profile
    elif choice == "Profile":
        st.title("👤 User Profile")
        with st.form("profile_form"):
            st.write("Edit your personal information")
            name = st.text_input("Full Name", value=st.session_state.user['full_name'])
            email = st.text_input("Email", value=st.session_state.user['email'], disabled=True)
            contact = st.text_input("Contact Number", value=st.session_state.user.get('contact_number', ''))
            photo = st.file_uploader("Upload Profile Photo (Non-Biometric, <2MB)", type=['jpg', 'jpeg', 'png'])
            
            if st.form_submit_button("Update Profile"):
                st.success("Profile updated successfully (Mock)")

        if st.session_state.user['role'] == "Attendee":
            st.write("---")
            st.subheader("Data Privacy")
            if st.button("Delete My Biometric Faceprint", type="primary"):
                res = requests.delete(f"{API_URL}/delete-biometric/", headers=get_headers())
                if res.status_code == 200:
                    st.success("Biometric data deleted. You will need to re-enroll to take attendance.")

    # Manage Subjects (Host)
    elif choice == "Manage Subjects":
        st.title("📚 Subject Management")
        with st.expander("➕ Create New Subject"):
            sub_name = st.text_input("Subject Name")
            if st.button("Create"):
                res = requests.post(f"{API_URL}/subjects/create/", json={"subject_name": sub_name}, headers=get_headers())
                if res.status_code == 201:
                    st.success("Subject created!")
                    st.rerun()
        
        res = requests.get(f"{API_URL}/subjects/", headers=get_headers())
        if res.status_code == 200:
            subjects = res.json()
            if subjects:
                df = pd.DataFrame(subjects)
                st.table(df[['subject_name', 'subject_code', 'created_at']])
            else:
                st.warning("No subjects found.")

    # Events (Host)
    elif choice == "Events":
        st.title("📅 Event Scheduling")
        res = requests.get(f"{API_URL}/subjects/", headers=get_headers())
        if res.status_code == 200:
            subjects = res.json()
            if not subjects:
                st.warning("Create a subject first.")
            else:
                sub_option = st.selectbox("Select Subject", subjects, format_func=lambda x: x['subject_name'])
                
                with st.form("event_form"):
                    title = st.text_input("Event Title")
                    date = st.date_input("Event Date")
                    time_val = st.time_input("Start Time")
                    venue = st.text_input("Venue")
                    threshold = st.number_input("Late Threshold (min)", value=15)
                    
                    if st.form_submit_button("Schedule Event"):
                        data = {
                            "subject": sub_option['subject_id'],
                            "title": title,
                            "event_date": str(date),
                            "start_time": str(time_val),
                            "venue": venue,
                            "late_threshold": threshold
                        }
                        res = requests.post(f"{API_URL}/events/create/", json=data, headers=get_headers())
                        if res.status_code == 201:
                            st.success("Event Scheduled!")
                        else:
                            st.error(f"Error: {res.text}")

    # Enrollment (Attendee)
    elif choice == "Enroll in Subject":
        st.title("📸 Facial Enrollment")
        st.write("Enroll your face for a specific subject using the code provided by your host.")
        code = st.text_input("Subject Code (6 Characters)")
        img_file = st.camera_input("Take a clear frontal photo")
        
        if img_file and code:
            if st.button("Submit Enrollment"):
                with st.spinner("Analyzing face..."):
                    files = {'image': img_file.getvalue()}
                    data = {'subject_code': code}
                    res = requests.post(f"{API_URL}/enroll/", headers=get_headers(), files=files, data=data)
                    if res.status_code == 201:
                        st.balloons()
                        st.success("Securely Enrolled! Faceprint has been encrypted and stored.")
                    else:
                        st.error(res.json().get('error', 'Enrollment failed'))

    # Start Attendance (Host)
    elif choice == "Start Attendance":
        st.title("🔍 Biometric Scanning")
        # Fetch Events
        res = requests.get(f"{API_URL}/subjects/", headers=get_headers())
        if res.status_code == 200:
            subjects = res.json()
            sub_option = st.selectbox("Select Subject", subjects, format_func=lambda x: x['subject_name'])
            
            # Fetch events for this subject
            e_res = requests.get(f"{API_URL}/events/?subject_id={sub_option['subject_id']}", headers=get_headers())
            if e_res.status_code == 200:
                events = e_res.json()
                if not events:
                    st.warning("No events scheduled for this subject.")
                else:
                    event_option = st.selectbox("Select Event", events, format_func=lambda x: f"{x['title']} ({x['event_date']})")
                    
                    st.write(f"---")
                    st.subheader(f"Session: {event_option['title']}")
                    img_file = st.camera_input("Scanning Camera")
                    
                    if img_file:
                        with st.spinner("Identifying..."):
                            files = {'image': img_file.getvalue()}
                            data = {'event_id': event_option['event_id']}
                            res = requests.post(f"{API_URL}/scan/", headers=get_headers(), files=files, data=data)
                            if res.status_code == 200:
                                result = res.json()
                                st.success(f"MATCH FOUND: {result['attendee']} marked as {result['status']}")
                                st.toast(f"Present: {result['attendee']}", icon="✅")
                            else:
                                st.error(res.json().get('error', 'No match found'))

    # Reports (Host)
    elif choice == "Reports":
        st.title("📊 Attendance Reports")
        res = requests.get(f"{API_URL}/subjects/", headers=get_headers())
        if res.status_code == 200:
            subjects = res.json()
            sub_option = st.selectbox("Select Subject", subjects, format_func=lambda x: x['subject_name'])
            
            e_res = requests.get(f"{API_URL}/events/?subject_id={sub_option['subject_id']}", headers=get_headers())
            if e_res.status_code == 200:
                events = e_res.json()
                if events:
                    event_option = st.selectbox("Select Event", events, format_func=lambda x: f"{x['title']} ({x['event_date']})")
                    
                    col1, col2 = st.columns(2)
                    with col1:
                        if st.button("Download CSV Report"):
                            res = requests.get(f"{API_URL}/reports/?event_id={event_option['event_id']}&format=csv", headers=get_headers())
                            st.download_button("Click here to download CSV", data=res.content, file_name=f"report_{event_option['title']}.csv")
                    with col2:
                        if st.button("Download PDF Report"):
                            res = requests.get(f"{API_URL}/reports/?event_id={event_option['event_id']}&format=pdf", headers=get_headers())
                            st.download_button("Click here to download PDF", data=res.content, file_name=f"report_{event_option['title']}.pdf")
                    
                    # Also show manual override table here
                    st.write("---")
                    st.subheader("Manual Record Management")
                    # In a real app, fetch records and show a table with "Override" buttons
                    st.info("Manual override controls are available in the administrative panel.")
                else:
                    st.warning("No events found.")

    # My Attendance (Attendee)
    elif choice == "My Attendance":
        st.title("📅 My Attendance Record")
        st.info("This section shows your attendance progress across all subjects.")
        # Fetch personal records from API (Need a personal record view in Django)
