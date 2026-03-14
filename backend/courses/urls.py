from django.urls import path
from .views import (
    CourseListCreateView,
    CourseDetailUpdateView,
    StudentCourseRegistrationCreateView,
    StudentRegistrationListView,
    PendingRegistrationListView,
    ApproveRegistrationView,
    DropRegistrationView,
)

urlpatterns = [
    path('', CourseListCreateView.as_view(), name='courses-list-create'),
    path('<int:pk>/', CourseDetailUpdateView.as_view(), name='course-detail-update'),
    path('registrations/', StudentCourseRegistrationCreateView.as_view(), name='student-register-course'),
    path('registrations/me/', StudentRegistrationListView.as_view(), name='student-registrations'),
    path('registrations/pending/', PendingRegistrationListView.as_view(), name='pending-registrations'),
    path('registrations/<int:registration_id>/approve/', ApproveRegistrationView.as_view(), name='approve-registration'),
    path('registrations/<int:registration_id>/drop/', DropRegistrationView.as_view(), name='drop-registration'),
]
