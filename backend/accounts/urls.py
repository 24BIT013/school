from django.urls import path
from .views import RegisterView, LoginView, RefreshView, MeView, AdminStudentListView, AdminStudentDetailUpdateView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', RefreshView.as_view(), name='refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('students/', AdminStudentListView.as_view(), name='students-list'),
    path('students/<int:pk>/', AdminStudentDetailUpdateView.as_view(), name='students-detail-update'),
]
