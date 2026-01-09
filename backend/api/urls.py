from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuthViewSet, EventViewSet, AttendanceViewSet, UserViewSet, EnrollmentViewSet

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='events')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'users', UserViewSet, basename='users')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollments')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/signup/', AuthViewSet.as_view({'post': 'signup'})),
    path('auth/login/', AuthViewSet.as_view({'post': 'login'})),
    path('auth/verify-email/', AuthViewSet.as_view({'post': 'verify_email'})),
    path('auth/2fa/', AuthViewSet.as_view({'post': 'verify_2fa'})),
]
