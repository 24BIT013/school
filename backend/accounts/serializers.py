from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'student_id', 'password', 'first_name', 'last_name', 'role')
        read_only_fields = ('id',)

    def validate_role(self, value):
        if value not in [User.Role.ADMIN, User.Role.STUDENT]:
            raise serializers.ValidationError('Invalid role')
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        role = attrs.get('role')
        student_id = attrs.get('student_id')
        if role == User.Role.STUDENT and not student_id:
            raise serializers.ValidationError({'student_id': 'Student ID is required for students.'})
        if role == User.Role.ADMIN:
            attrs['student_id'] = None
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'student_id', 'first_name', 'last_name', 'role')


class AdminStudentSerializer(serializers.ModelSerializer):
    registrations_count = serializers.IntegerField(read_only=True)
    results_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'student_id',
            'first_name',
            'last_name',
            'email',
            'role',
            'is_active',
            'date_joined',
            'registrations_count',
            'results_count',
        )


class AdminStudentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'student_id', 'first_name', 'last_name', 'email', 'is_active')
        read_only_fields = ('id',)


class StudentIdTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'student_id'
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        student_id = attrs.get('student_id')
        password = attrs.get('password')

        try:
            user_by_id = User.objects.get(student_id__iexact=student_id)
        except User.DoesNotExist:
            try:
                user_by_id = User.objects.get(email__iexact=student_id)
            except User.DoesNotExist as exc:
                raise AuthenticationFailed(self.error_messages['no_active_account'], 'no_active_account') from exc

        self.user = authenticate(
            request=self.context.get('request'),
            email=user_by_id.email,
            password=password,
        )

        if not api_settings.USER_AUTHENTICATION_RULE(self.user):
            raise AuthenticationFailed(self.error_messages['no_active_account'], 'no_active_account')

        refresh = self.get_token(self.user)
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

        if api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, self.user)

        return data
