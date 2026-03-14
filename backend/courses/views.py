from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import User
from accounts.permissions import IsAdminRole, IsStudentRole
from .models import Course, CourseRegistration
from .serializers import CourseSerializer, CourseRegistrationSerializer


class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all().order_by('code')
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdminRole()]
        return [IsAuthenticated()]


class CourseDetailUpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


class StudentCourseRegistrationCreateView(generics.CreateAPIView):
    serializer_class = CourseRegistrationSerializer
    permission_classes = [IsAuthenticated, IsStudentRole]


class StudentRegistrationListView(generics.ListAPIView):
    serializer_class = CourseRegistrationSerializer
    permission_classes = [IsAuthenticated, IsStudentRole]

    def get_queryset(self):
        return CourseRegistration.objects.filter(student=self.request.user).select_related('course').order_by('-registered_at')


class PendingRegistrationListView(generics.ListAPIView):
    serializer_class = CourseRegistrationSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        return CourseRegistration.objects.filter(status=CourseRegistration.Status.PENDING).select_related('course', 'student')


class ApproveRegistrationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request, registration_id):
        try:
            registration = CourseRegistration.objects.get(id=registration_id)
        except CourseRegistration.DoesNotExist:
            return Response({'detail': 'Registration not found.'}, status=status.HTTP_404_NOT_FOUND)

        if registration.status != CourseRegistration.Status.PENDING:
            return Response({'detail': 'Only pending registrations can be approved.'}, status=status.HTTP_400_BAD_REQUEST)

        registration.status = CourseRegistration.Status.APPROVED
        registration.approved_by = request.user
        registration.approved_at = timezone.now()
        registration.save(update_fields=['status', 'approved_by', 'approved_at'])

        return Response(CourseRegistrationSerializer(registration).data)


class DropRegistrationView(APIView):
    permission_classes = [IsAuthenticated, IsStudentRole]

    def patch(self, request, registration_id):
        try:
            registration = CourseRegistration.objects.get(id=registration_id, student=request.user)
        except CourseRegistration.DoesNotExist:
            return Response({'detail': 'Registration not found.'}, status=status.HTTP_404_NOT_FOUND)

        if registration.status != CourseRegistration.Status.PENDING:
            return Response({'detail': 'Only pending registrations can be dropped.'}, status=status.HTTP_400_BAD_REQUEST)

        registration.status = CourseRegistration.Status.DROPPED
        registration.save(update_fields=['status'])
        return Response(CourseRegistrationSerializer(registration).data)
