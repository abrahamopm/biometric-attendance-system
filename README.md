# Biometric Faceprint Attendance System

This system implements a secure, role-based biometric attendance tracking system using Django and Streamlit.  
It allows hosts to manage attendance and attendees to mark attendance via face recognition in real-time.

---

## Features

- **Role-based Dashboards**: Host and Attendee specific interfaces.
- **Biometric Enrollment**: Secure extraction and encryption of 512-d facial embeddings using InsightFace (ArcFace).
- **Live Attendance**: High-speed (20-30 FPS) facial matching from webcam feed.
- **Manual Override**: Hosts can manually adjust attendance records.
- **Reporting**: Export attendance data in CSV or PDF format.
- **Privacy Core**: Immediate deletion of raw photos; encrypted storage of biometric data.

---

## Technology Stack

- **Backend**: Django & Django Rest Framework (Python 3.9+)
- **Frontend**: Streamlit
- **Face Recognition**: InsightFace (ArcFace) & OpenCV
- **Database**: PostgreSQL (configured for SQLite for demo)
- **Security**: Fernet Encryption for biometric data, JWT for API Auth.

---

## Setup Instructions

### 1. Installation

Install the required dependencies:

```bash
pip install -r requirements.txt
2. Database Initialization
Navigate to the backend folder and run migrations:

bash
Copy code
cd backend
python manage.py makemigrations
python manage.py migrate
3. Start the Backend Server
bash
Copy code
python manage.py runserver
4. Start the Frontend (Streamlit)
In a new terminal, navigate to the frontend folder:

bash
Copy code
streamlit run app.py
5. Access the Application
Open your browser and go to http://localhost:8501/ (Streamlit default port)

Log in as Host or Attendee

Enroll new attendees or mark attendance using webcam

Usage Examples
Hosts can view attendance records and export reports.

Attendees can mark attendance by showing their face to the webcam.

Manual override allows adjusting records if recognition fails.

Tip: Ensure good lighting for accurate face recognition.

Folder Structure
perl
Copy code
/biometric-attendance-system
│
├── backend/                  # Django backend
│   ├── manage.py
│   ├── attendance/           # Django app for attendance
│   └── ...
├── frontend/                 # Streamlit frontend
│   └── app.py
├── requirements.txt          # Python dependencies
├── README.md                 # Project documentation
└── dataset/                  # Temporary storage for face images (deleted after processing)
Security Design
Facial embeddings are stored as encrypted binary blobs.

No raw facial images are stored on the server.

JWT tokens handle session management.

Audit logs track all critical actions (Login, Enrollment, Attendance).

```
