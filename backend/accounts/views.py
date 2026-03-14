from rest_framework import generics, permissions
from django.db.models import Count
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import User
from .permissions import IsAdminRole
from .serializers import (
    AdminStudentSerializer,
    AdminStudentUpdateSerializer,
    RegisterSerializer,
    StudentIdTokenObtainPairSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = StudentIdTokenObtainPairSerializer


class RefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class AdminStudentListView(generics.ListAPIView):
    serializer_class = AdminStudentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        return (
            User.objects.filter(role=User.Role.STUDENT)
            .annotate(
                registrations_count=Count('course_registrations', distinct=True),
                results_count=Count('results', distinct=True),
            )
            .order_by('-date_joined')
        )


class AdminStudentDetailUpdateView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminStudentUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        return User.objects.filter(role=User.Role.STUDENT).order_by('-date_joined')
