from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, SubjectViewSet, EventViewSet, EnrollmentViewSet, AttendanceRecordViewSet
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import UserViewSet, SubjectViewSet, EventViewSet, EnrollmentViewSet, AttendanceRecordViewSet


router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'events', EventViewSet, basename='event')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'attendance', AttendanceRecordViewSet, basename='attendance')


urlpatterns = [
    path('', include(router.urls)),
]
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'events', EventViewSet, basename='event')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'attendances', AttendanceRecordViewSet, basename='attendance')

urlpatterns = [
    path('', include(router.urls)),
]