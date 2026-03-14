from rest_framework import serializers
from .models import Course, CourseRegistration


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ('id', 'code', 'title', 'unit', 'semester', 'level', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')


class CourseRegistrationSerializer(serializers.ModelSerializer):
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    student_first_name = serializers.CharField(source='student.first_name', read_only=True)
    student_last_name = serializers.CharField(source='student.last_name', read_only=True)
    student_email = serializers.EmailField(source='student.email', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_unit = serializers.IntegerField(source='course.unit', read_only=True)

    class Meta:
        model = CourseRegistration
        fields = (
            'id', 'student', 'student_id', 'student_first_name', 'student_last_name', 'student_email',
            'course', 'course_code', 'course_title', 'course_unit',
            'session', 'status', 'registered_at', 'approved_by', 'approved_at'
        )
        read_only_fields = ('id', 'registered_at', 'approved_by', 'approved_at', 'student')

    def validate(self, attrs):
        request = self.context.get('request')
        student = request.user
        course = attrs['course']
        session = attrs['session']

        if not course.is_active:
            raise serializers.ValidationError('Course is not active.')

        if CourseRegistration.objects.filter(student=student, course=course, session=session).exists():
            raise serializers.ValidationError('Course already registered for this session.')

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['student'] = request.user
        return super().create(validated_data)
