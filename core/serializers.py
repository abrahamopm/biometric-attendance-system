from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import User, Subject, Event, Enrollment, AttendanceRecord


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'role', 'contact_number',
            'registration_date', 'is_verified', 'is_staff', 'is_superuser'
        ]
        read_only_fields = ['id', 'registration_date', 'is_staff', 'is_superuser']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['email', 'full_name', 'role', 'contact_number', 'password']

    def create(self, validated_data):
        email = validated_data['email']
        user = User.objects.create_user(
            username=email,
            email=email,
            full_name=validated_data['full_name'],
            role=validated_data['role'],
            contact_number=validated_data.get('contact_number', ''),
            password=validated_data['password'],
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        if not user.is_active:
            raise serializers.ValidationError('Account disabled')
        attrs['user'] = user
        return attrs


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'host', 'created_at']
        read_only_fields = ['id', 'created_at']


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'id', 'subject', 'title', 'event_date', 'start_time', 'venue',
            'late_threshold', 'status', 'created_at', 'started_at', 'ended_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'started_at', 'ended_at']


class EnrollmentSerializer(serializers.ModelSerializer):
    attendee_name = serializers.CharField(source='attendee.full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id', 'subject', 'subject_name', 'attendee', 'attendee_name',
            'facial_embedding', 'enrolled_at', 'is_active', 'is_deleted'
        ]
        read_only_fields = ['id', 'facial_embedding', 'enrolled_at']


class AttendanceRecordSerializer(serializers.ModelSerializer):
    attendee_name = serializers.CharField(source='enrollment.attendee.full_name', read_only=True)
    subject_name = serializers.CharField(source='event.subject.name', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'event', 'event_title', 'subject_name', 'enrollment', 'attendee_name',
            'timestamp', 'status', 'is_manual', 'recorded_by'
        ]
        read_only_fields = ['id', 'timestamp']
