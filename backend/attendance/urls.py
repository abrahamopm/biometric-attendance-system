from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    SignupView, LoginView, ProfileView,
    SubjectCreateView, SubjectListView,
    EventCreateView, EventListView,
    FaceEnrollmentView, AttendanceScanView,
    ReportGenerationView, DeleteFaceDataView,
    ManualOverrideView
)

urlpatterns = [
    # Auth
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    
    # Subjects & Events
    path('subjects/', SubjectListView.as_view(), name='subject_list'),
    path('subjects/create/', SubjectCreateView.as_view(), name='subject_create'),
    path('events/', EventListView.as_view(), name='event_list'),
    path('events/create/', EventCreateView.as_view(), name='event_create'),
    
    # Biometric
    path('enroll/', FaceEnrollmentView.as_view(), name='face_enroll'),
    path('scan/', AttendanceScanView.as_view(), name='attendance_scan'),
    path('delete-biometric/', DeleteFaceDataView.as_view(), name='delete_biometric'),
    
    # Reports
    path('reports/', ReportGenerationView.as_view(), name='report_gen'),
    path('manual-override/', ManualOverrideView.as_view(), name='manual_override'),
]
