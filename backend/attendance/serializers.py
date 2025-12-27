from rest_framework import serializers
from .models import User, Subject, Event, Enrollment, AttendanceRecord, AuditLog

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'role', 'contact_number', 'profile_photo', 'is_verified')
        read_only_fields = ('is_verified',)

    def validate_profile_photo(self, value):
        if value.size > 2 * 1024 * 1024:
            raise serializers.ValidationError("Photo size must be less than 2MB")
        return value

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'full_name', 'role', 'contact_number')

    def create(self, validated_data):
        full_name = validated_data.pop('full_name')
        names = full_name.split(' ', 1)
        first_name = names[0]
        last_name = names[1] if len(names) > 1 else ''
        
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
            role=validated_data['role'],
            contact_number=validated_data.get('contact_number', ''),
            is_verified=True # Auto-verify for demo
        )
        return user

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'
        read_only_fields = ('subject_code', 'host', 'created_at')

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ('created_at',)

class AttendanceRecordSerializer(serializers.ModelSerializer):
    attendee_name = serializers.CharField(source='enrollment.attendee.full_name', read_only=True)
    class Meta:
        model = AttendanceRecord
        fields = '__all__'
