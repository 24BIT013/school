from django.urls import path, include
from django.contrib import admin
from django.http import JsonResponse


def home(request):
    return JsonResponse(
        {
            'message': 'School Management API is running.',
            'endpoints': ['/admin/', '/api/auth/', '/api/courses/', '/api/results/'],
        }
    )


def api_root(request):
    return JsonResponse(
        {
            'auth': '/api/auth/',
            'courses': '/api/courses/',
            'results': '/api/results/',
        }
    )


def login_hint(request):
    return JsonResponse(
        {
            'message': 'Use frontend login page or auth API endpoint.',
            'frontend_login': 'http://127.0.0.1:5173/login',
            'api_login': '/api/auth/login/',
            'method': 'POST',
        }
    )


def register_hint(request):
    return JsonResponse(
        {
            'message': 'Use frontend register page or auth API endpoint.',
            'frontend_register': 'http://127.0.0.1:5173/register',
            'api_register': '/api/auth/register/',
            'method': 'POST',
        }
    )


urlpatterns = [
    path('', home, name='home'),
    path('login/', login_hint, name='login-hint'),
    path('register/', register_hint, name='register-hint'),
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('api/auth/', include('accounts.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/results/', include('results.urls')),
]
