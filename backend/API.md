# School Management API

Base URL: `http://127.0.0.1:8000/api`

Use header for protected routes:

`Authorization: Bearer <access_token>`

## Auth

1. `POST /auth/register/`

```json
{
  "student_id": "STU001",
  "email": "student1@example.com",
  "password": "StrongPass123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "STUDENT"
}
```

2. `POST /auth/login/`

```json
{
  "student_id": "STU001",
  "password": "StrongPass123"
}
```

Returns:

```json
{
  "refresh": "...",
  "access": "..."
}
```

3. `POST /auth/refresh/`

```json
{
  "refresh": "..."
}
```

4. `GET /auth/me/`
5. `GET /auth/students/` (admin only)
6. `PATCH /auth/students/{id}/` (admin only; edit student profile)
7. `DELETE /auth/students/{id}/` (admin only; delete student)

## Courses

1. `GET /courses/` (admin/student)
2. `POST /courses/` (admin)

```json
{
  "code": "CSC101",
  "title": "Intro to Computer Science",
  "unit": 3,
  "semester": "FIRST",
  "level": "100",
  "is_active": true
}
```

3. `POST /courses/registrations/` (student)

```json
{
  "course": 1,
  "session": "2025/2026"
}
```

4. `GET /courses/registrations/me/` (student)
5. `GET /courses/registrations/pending/` (admin)
6. `PATCH /courses/registrations/{id}/approve/` (admin)
7. `PATCH /courses/registrations/{id}/drop/` (student, pending only)
8. `PATCH /courses/{id}/` (admin; edit course)
9. `DELETE /courses/{id}/` (admin; delete course)

## Results

1. `GET /results/` (admin)
2. `POST /results/` (admin)

```json
{
  "student_login_id": "STD001",
  "course": 1,
  "score": 76
}
```

3. `PATCH /results/{id}/` (admin; edit course and/or score)
4. `PATCH /results/{id}/publish/` (admin)
5. `GET /results/me/` (student)
6. `GET /results/me/gpa/` (student)
7. `GET /results/me/download/` (student, CSV file)
