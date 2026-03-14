from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('id', 'email', 'student_id', 'role', 'is_active', 'is_staff')
    list_filter = ('role', 'is_active', 'is_staff')
    ordering = ('id',)
    search_fields = ('email', 'student_id', 'first_name', 'last_name')
    fieldsets = (
        (None, {'fields': ('email', 'student_id', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name',)}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'student_id', 'password1', 'password2', 'role', 'is_staff', 'is_superuser'),
        }),
    )
