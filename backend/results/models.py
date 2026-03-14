from django.conf import settings
from django.db import models
from courses.models import Course


class Result(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='results')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='results')
    score = models.PositiveSmallIntegerField()
    grade = models.CharField(max_length=2)
    grade_point = models.FloatField()
    published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f'{self.student.email} - {self.course.code}: {self.grade}'
