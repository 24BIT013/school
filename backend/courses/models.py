from django.conf import settings
from django.db import models


class Course(models.Model):
    class Semester(models.TextChoices):
        FIRST = 'FIRST', 'First'
        SECOND = 'SECOND', 'Second'

    code = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=255)
    unit = models.PositiveSmallIntegerField()
    semester = models.CharField(max_length=10, choices=Semester.choices)
    level = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.code} - {self.title}'


class CourseRegistration(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        DROPPED = 'DROPPED', 'Dropped'

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='course_registrations')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='registrations')
    session = models.CharField(max_length=20)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    registered_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='approved_registrations',
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'course', 'session')

    def __str__(self):
        return f'{self.student.email} - {self.course.code} ({self.status})'
