# Biometric Faceprint Attendance System

A secure, role-based biometric attendance tracking system built with **Django** and **Streamlit**.  
Allows hosts and attendees to track attendance using facial recognition with high security and privacy.

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Security Design](#security-design)
- [Contributing](#contributing)
- [License](#license)

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
- **Security**: Fernet Encryption for biometric data, JWT for API Auth

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/abrahamopm/biometric-attendance-system.git
cd biometric-attendance-system
2. Create and Activate Virtual Environment
bash
Copy code
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
3. Install Dependencies
bash
Copy code
pip install -r requirements.txt
4. Database Initialization
bash
Copy code
cd backend
python manage.py makemigrations
python manage.py migrate
5. Start Backend Server
bash
Copy code
python manage.py runserver
6. Start Frontend (Streamlit)
In a new terminal:

bash
Copy code
cd frontend
streamlit run app.py
7. Access the Application
Open your browser and go to http://localhost:8501 for Streamlit frontend.
Backend API is accessible at http://127.0.0.1:8000.

Usage
Register new users (Attendees or Hosts)

Hosts can enroll facial data for attendees

Live attendance tracking via webcam

Export attendance reports (CSV / PDF)

Hosts can manually adjust attendance

Folder Structure
perl
Copy code
/biometric-attendance-system
│
├── backend/                # Django backend
│   ├── manage.py
│   └── ...
├── frontend/               # Streamlit frontend
│   └── app.py
├── dataset/                # Temporary facial images for enrollment
├── requirements.txt
└── README.md
Security Design
Facial embeddings stored as encrypted binary blobs (Fernet encryption)

No raw images stored on the server

JWT tokens handle authentication and session management

Audit logs track all critical actions (Login, Enrollment, Attendance)
```
