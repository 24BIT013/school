from rest_framework import serializers
from django.contrib.auth import get_user_model
from courses.models import CourseRegistration
from .models import Result

User = get_user_model()


GRADE_SCALE = [
    (70, 'A', 5.0),
    (60, 'B', 4.0),
    (50, 'C', 3.0),
    (45, 'D', 2.0),
    (40, 'E', 1.0),
    (0, 'F', 0.0),
]


def compute_grade(score):
    for minimum, grade, point in GRADE_SCALE:
        if score >= minimum:
            return grade, point
    return 'F', 0.0


class ResultSerializer(serializers.ModelSerializer):
    student_login_id = serializers.CharField(write_only=True, required=False)
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    student_email = serializers.EmailField(source='student.email', read_only=True)
    course_id = serializers.IntegerField(source='course.id', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_name = serializers.CharField(source='course.title', read_only=True)
    course_unit = serializers.IntegerField(source='course.unit', read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = Result
        fields = (
            'id', 'student', 'student_login_id', 'student_id', 'student_email', 'course', 'course_id',
            'course_code', 'course_name', 'course_unit', 'score', 'grade', 'grade_point', 'status',
            'published', 'published_at', 'created_at'
        )
        read_only_fields = ('id', 'grade', 'grade_point', 'published_at', 'created_at')
        extra_kwargs = {
            'student': {'required': False},
        }

    def to_internal_value(self, data):
        if hasattr(data, 'copy'):
            data = data.copy()
        else:
            data = dict(data)

        student_login_id = data.get('student_login_id')
        if student_login_id and not data.get('student'):
            student = User.objects.filter(student_id__iexact=str(student_login_id).strip()).first()
            if student:
                data['student'] = student.pk

        return super().to_internal_value(data)

    def validate(self, attrs):
        student_login_id = attrs.pop('student_login_id', None)
        student = attrs.get('student')

        if not student and student_login_id:
            student = User.objects.filter(student_id__iexact=student_login_id).first()
            if not student:
                raise serializers.ValidationError({'student_login_id': 'Student with this Student ID was not found.'})
            attrs['student'] = student

        if not student and self.instance is None:
            raise serializers.ValidationError({'student_login_id': 'Provide student_login_id when creating a result.'})

        student = attrs.get('student', self.instance.student if self.instance else None)
        course = attrs.get('course', self.instance.course if self.instance else None)

        if student and student.role != User.Role.STUDENT:
            raise serializers.ValidationError({'student_login_id': 'Selected account is not a student.'})

        approved_registration_exists = CourseRegistration.objects.filter(
            student=student,
            course=course,
            status=CourseRegistration.Status.APPROVED,
        ).exists()
        if not approved_registration_exists:
            raise serializers.ValidationError('Student does not have an approved registration for this course.')

        duplicate_qs = Result.objects.filter(student=student, course=course)
        if self.instance:
            duplicate_qs = duplicate_qs.exclude(pk=self.instance.pk)
        if duplicate_qs.exists():
            raise serializers.ValidationError(
                'Result for this student and course already exists. Please edit the existing result.'
            )

        score = attrs.get('score', self.instance.score if self.instance else None)
        if score is None:
            raise serializers.ValidationError({'score': 'This field is required.'})
        if score < 0 or score > 100:
            raise serializers.ValidationError('Score must be between 0 and 100.')

        return attrs

    def get_status(self, obj):
        return 'Fail' if obj.grade == 'F' else 'Pass'

    def create(self, validated_data):
        grade, base_point = compute_grade(validated_data['score'])
        unit = validated_data['course'].unit
        validated_data['grade'] = grade
        validated_data['grade_point'] = base_point * unit
        return super().create(validated_data)

    def update(self, instance, validated_data):
        score = validated_data.get('score', instance.score)
        grade, base_point = compute_grade(score)
        unit = validated_data.get('course', instance.course).unit
        validated_data['grade'] = grade
        validated_data['grade_point'] = base_point * unit
        return super().update(instance, validated_data)
