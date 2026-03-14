from django.contrib import admin
from .models import Result


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'course', 'score', 'grade', 'grade_point', 'published', 'published_at')
    search_fields = ('student__email', 'course__code')
    list_filter = ('grade', 'published')
