import csv
from django.db.models import Sum
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.permissions import IsAdminRole, IsStudentRole
from .models import Result
from .serializers import ResultSerializer


class ResultListCreateView(generics.ListCreateAPIView):
    queryset = Result.objects.select_related('student', 'course').all().order_by('-created_at')
    serializer_class = ResultSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdminRole()]
        return [IsAuthenticated(), IsAdminRole()]


class ResultDetailUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Result.objects.select_related('student', 'course').all()
    serializer_class = ResultSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


class PublishResultView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request, result_id):
        try:
            result = Result.objects.get(id=result_id)
        except Result.DoesNotExist:
            return Response({'detail': 'Result not found.'}, status=status.HTTP_404_NOT_FOUND)

        result.published = True
        result.published_at = timezone.now()
        result.save(update_fields=['published', 'published_at'])
        return Response(ResultSerializer(result).data)


class StudentResultListView(generics.ListAPIView):
    serializer_class = ResultSerializer
    permission_classes = [IsAuthenticated, IsStudentRole]

    def get_queryset(self):
        return Result.objects.filter(student=self.request.user, published=True).select_related('course').order_by('course__code')


class StudentGPAView(APIView):
    permission_classes = [IsAuthenticated, IsStudentRole]

    def get(self, request):
        results = Result.objects.filter(student=request.user, published=True).select_related('course')
        total_grade_points = results.aggregate(total=Sum('grade_point'))['total'] or 0
        total_units = sum(r.course.unit for r in results)

        gpa = round(total_grade_points / total_units, 2) if total_units > 0 else 0.0
        return Response({
            'student': request.user.email,
            'total_courses': results.count(),
            'total_units': total_units,
            'total_grade_points': total_grade_points,
            'gpa': gpa,
        })


class StudentResultDownloadView(APIView):
    permission_classes = [IsAuthenticated, IsStudentRole]

    def get(self, request):
        results = Result.objects.filter(student=request.user, published=True).select_related('course').order_by('course__code')

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="results.csv"'

        writer = csv.writer(response)
        writer.writerow(['Course Code', 'Course Title', 'Unit', 'Score', 'Grade', 'Grade Point'])
        for result in results:
            writer.writerow([
                result.course.code,
                result.course.title,
                result.course.unit,
                result.score,
                result.grade,
                result.grade_point,
            ])

        return response


class StudentResultPdfDownloadView(APIView):
    permission_classes = [IsAuthenticated, IsStudentRole]

    def get(self, request):
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.pdfgen import canvas
        except ImportError:
            return Response(
                {'detail': 'PDF support is not installed. Install reportlab to enable PDF downloads.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        results = Result.objects.filter(student=request.user, published=True).select_related('course').order_by('course__code')
        total_grade_points = results.aggregate(total=Sum('grade_point'))['total'] or 0
        total_units = sum(r.course.unit for r in results)
        gpa = round(total_grade_points / total_units, 2) if total_units > 0 else 0.0

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="results.pdf"'

        p = canvas.Canvas(response, pagesize=A4)
        width, height = A4
        y = height - 50

        p.setFont('Helvetica-Bold', 14)
        p.drawString(40, y, 'Student Results')
        y -= 20

        p.setFont('Helvetica', 10)
        p.drawString(40, y, f'Student ID: {request.user.student_id or "-"}')
        y -= 14
        p.drawString(40, y, f'Name: {request.user.first_name} {request.user.last_name}'.strip())
        y -= 14
        p.drawString(40, y, f'Email: {request.user.email}')
        y -= 24

        p.setFont('Helvetica-Bold', 9)
        p.drawString(40, y, 'Code')
        p.drawString(100, y, 'Course')
        p.drawString(300, y, 'Unit')
        p.drawString(340, y, 'Score')
        p.drawString(390, y, 'Grade')
        p.drawString(440, y, 'Point')
        y -= 12
        p.line(40, y, 550, y)
        y -= 10

        p.setFont('Helvetica', 9)
        for result in results:
            if y < 80:
                p.showPage()
                y = height - 50
                p.setFont('Helvetica-Bold', 9)
                p.drawString(40, y, 'Code')
                p.drawString(100, y, 'Course')
                p.drawString(300, y, 'Unit')
                p.drawString(340, y, 'Score')
                p.drawString(390, y, 'Grade')
                p.drawString(440, y, 'Point')
                y -= 12
                p.line(40, y, 550, y)
                y -= 10
                p.setFont('Helvetica', 9)

            course_name = result.course.title if len(result.course.title) <= 34 else f'{result.course.title[:31]}...'
            p.drawString(40, y, str(result.course.code))
            p.drawString(100, y, course_name)
            p.drawString(300, y, str(result.course.unit))
            p.drawString(340, y, str(result.score))
            p.drawString(390, y, str(result.grade))
            p.drawString(440, y, str(result.grade_point))
            y -= 14

        y -= 8
        p.line(40, y, 550, y)
        y -= 16
        p.setFont('Helvetica-Bold', 10)
        p.drawString(40, y, f'Total Units: {total_units}')
        p.drawString(180, y, f'Total Grade Points: {total_grade_points}')
        p.drawString(380, y, f'GPA: {gpa}')

        p.save()
        return response
