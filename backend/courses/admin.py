from django.contrib import admin
from .models import Course, CourseRegistration


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('id', 'code', 'title', 'unit', 'semester', 'level', 'is_active')
    search_fields = ('code', 'title')
    list_filter = ('semester', 'level', 'is_active')


@admin.register(CourseRegistration)
class CourseRegistrationAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'course', 'session', 'status', 'registered_at', 'approved_by')
    search_fields = ('student__email', 'course__code', 'session')
    list_filter = ('status', 'session')
