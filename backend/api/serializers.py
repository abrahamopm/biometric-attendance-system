from rest_framework import serializers
from .models import User, Event, AttendanceRecord, Enrollment

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    has_face_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'phone', 'has_face_enrolled', 'is_email_verified')

    def get_has_face_enrolled(self, obj):
        return obj.face_embedding is not None and len(obj.face_embedding) > 0

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ('host', 'join_code')

class AttendanceSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='student.username', read_only=True)
    event_name = serializers.CharField(source='event.name', read_only=True)
    
    class Meta:
        model = AttendanceRecord
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)  # Nested representation for easy frontend consumption
    
    class Meta:
        model = Enrollment
        fields = ('id', 'student', 'event', 'enrolled_at')

