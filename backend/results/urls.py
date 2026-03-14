from django.urls import path
from .views import (
    ResultListCreateView,
    ResultDetailUpdateView,
    PublishResultView,
    StudentResultListView,
    StudentGPAView,
    StudentResultDownloadView,
)

urlpatterns = [
    path('', ResultListCreateView.as_view(), name='results-list-create'),
    path('<int:pk>/', ResultDetailUpdateView.as_view(), name='result-detail-update'),
    path('<int:result_id>/publish/', PublishResultView.as_view(), name='publish-result'),
    path('me/', StudentResultListView.as_view(), name='student-results'),
    path('me/gpa/', StudentGPAView.as_view(), name='student-gpa'),
    path('me/download/', StudentResultDownloadView.as_view(), name='student-results-download'),
]
