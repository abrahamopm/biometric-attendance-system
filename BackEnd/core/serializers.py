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
        fields = ['id', 'name', 'code', 'description', 'host', 'created_at']
        read_only_fields = ['id', 'created_at', 'host']


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
    subject_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Enrollment
        fields = [
            'id', 'subject', 'subject_name', 'attendee', 'attendee_name',
            'subject_id', 'facial_embedding', 'enrolled_at', 'is_active', 'is_deleted'
        ]
        read_only_fields = ['id', 'facial_embedding', 'enrolled_at', 'attendee']

    def create(self, validated_data):
        # Support subject lookup by "subject_id" or nested subject
        subject = validated_data.pop('subject', None)
        subject_id = validated_data.pop('subject_id', None)
        if not subject and subject_id:
            subject = Subject.objects.get(id=subject_id)

        request = self.context.get('request')
        attendee = request.user if request else None

        if not subject:
            raise serializers.ValidationError({'subject': 'Subject is required'})
        if not attendee:
            raise serializers.ValidationError({'attendee': 'Authentication required'})

        enrollment, _ = Enrollment.objects.update_or_create(
            subject=subject,
            attendee=attendee,
            defaults={
                'facial_embedding': validated_data.get('facial_embedding'),
                'is_active': validated_data.get('is_active', True),
                'is_deleted': validated_data.get('is_deleted', False),
            }
        )
        return enrollment


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
