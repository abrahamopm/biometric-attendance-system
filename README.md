# Biometric Attendance System

A full-stack web application for biometric attendance tracking using face recognition technology.

## Overview

This system allows hosts to create events and track attendee attendance through facial recognition. Attendees can enroll their faces and check in/out of events automatically.

## Architecture

### Backend (BackEnd/)
- **Framework**: Django 5.0+ with Django REST Framework
- **Authentication**: JWT tokens via djangorestframework-simplejwt
- **Database**: PostgreSQL (configured for production)
- **Face Recognition**: InsightFace with ArcFace model (buffalo_l)
- **Async Processing**: Celery with Redis for background tasks
- **API**: RESTful API for frontend communication

### Frontend (FrontENd/)
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn/ui components with Tailwind CSS
- **State Management**: React Context
- **API Client**: Axios for backend communication

## Features

### For Hosts
- Create and manage events
- View live attendance dashboards
- Generate attendance reports (CSV)
- Manage subjects and attendees

### For Attendees
- Face enrollment for recognition
- View attendance history
- Privacy settings management
- Real-time check-in/out

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL
- Redis
- Git

### Backend Setup (SQLite default)
1. Navigate to `BackEnd/` directory
2. Create virtual environment: `python -m venv .venv`
3. Activate: `.venv\Scripts\activate` (Windows) or `source .venv/bin/activate` (Linux/Mac)
4. Install dependencies: `pip install -r requirements.txt`
5. Apply migrations to create the SQLite database (`db.sqlite3` is created in `BackEnd/` by default): `python manage.py migrate`
6. Create a superuser (optional but recommended): `python manage.py createsuperuser`
7. Run the API: `python manage.py runserver 0.0.0.0:8000`

Celery/Redis are optional for local development; the code guards against missing workers. For production, configure PostgreSQL/Redis in `biometric_attendance_system/settings.py` and run a Celery worker: `celery -A biometric_attendance_system worker --loglevel=info`.

### Frontend Setup
1. Navigate to `FrontENd/Biometricattendancedashboard-main/` directory
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## API Documentation

The backend provides REST API endpoints for:
- User authentication
- Event management
- Face enrollment and recognition
- Attendance tracking
- Report generation

## Face Recognition

Uses InsightFace library with ArcFace model for accurate facial recognition. Supports:
- Face detection and alignment
- Feature extraction
- Similarity matching
- Batch processing

## Security

- JWT-based authentication
- Face data privacy controls
- Secure API endpoints
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License.