from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularSwaggerView
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Port-agnostic OpenAPI layout specification with default roles and profile fields
def serve_swagger_yaml(request):
    yaml_content = """
openapi: 3.0.3
info:
  title: Employee Task Management API
  version: 1.0.0
  description: Complete documentation portal workspace for managing tasks and employees with validation rules.
servers:
  - url: /
    description: Current Active Host (Autodetects your running port dynamically)

security:
  - BearerAuth: []

paths:
  /api/auth/login/:
    post:
      summary: Obtain JWT Authentication Tokens (Login)
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                username:
                  type: string
                password:
                  type: string
              required:
                - username
                - password
      responses:
        '200':
          description: Success returning access and refresh tokens

  /api/register/:
    post:
      summary: Register a new system user
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                username:
                  type: string
                  minLength: 4
                password:
                  type: string
                  minLength: 8
                email:
                  type: string
                  format: email
              required:
                - username
                - password
                - email
      responses:
        '201':
          description: User registered successfully.

  /api/tasks/:
    get:
      summary: List all tasks
      responses:
        '200':
          description: Success
    post:
      summary: Create a new task
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                description:
                  type: string
                status:
                  type: string
                  enum: [pending, in_progress, completed]
                assigned_to:
                  type: integer
              required:
                - title
      responses:
        '201':
          description: Success

  /api/tasks/{id}/:
    get:
      summary: Retrieve a specific task detail
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Success
    put:
      summary: Update a specific task (Full Update)
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                  maxLength: 255
                description:
                  type: string
                status:
                  type: string
                  enum: [pending, in_progress, completed]
                assigned_to:
                  type: integer
              required:
                - title
            example:
              title: "Update task title here"
              description: "Update description details here"
              status: "in_progress"
              assigned_to: 1
      responses:
        '200':
          description: Task updated successfully.
    delete:
      summary: Delete a specific task
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '204':
          description: Success

  /api/employees/:
    get:
      summary: List all employees
      responses:
        '200':
          description: Success
    post:
      summary: Create a new employee record
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                username:
                  type: string
                  minLength: 3
                  description: "Unique login username (No spaces allowed)."
                first_name:
                  type: string
                  description: "Employee's legal first name."
                last_name:
                  type: string
                  description: "Employee's legal last name."
                email:
                  type: string
                  format: email
                  description: "Unique system email address."
                password:
                  type: string
                  minLength: 8
                  description: "Login password assigned. Minimum 8 characters."
                role:
                  type: string
                  default: "employee"
                  description: "System permission role. Defaults automatically to 'employee' if left blank."
              required:
                - username
                - email
                - password
            example:
              username: "deep_kumar"
              first_name: "Deep"
              last_name: "Kumar"
              email: "deep_kumar@example.com"
              password: "SecurePassword123!"
              role: "employee"
      responses:
        '201':
          description: Employee record created successfully.
        '400':
          description: "Bad Request. Validation failed."

  /api/employees/{id}/:
    get:
      summary: Retrieve a specific employee detail
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Success
    put:
      summary: Update a specific employee (Full Update)
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                username:
                  type: string
                first_name:
                  type: string
                last_name:
                  type: string
                email:
                  type: string
                role:
                  type: string
              required:
                - username
                - email
            example:
              username: "deep_kumar"
              first_name: "Deep"
              last_name: "Kumar"
              email: "deep_kumar@example.com"
              role: "employee"
      responses:
        '200':
          description: Success
    delete:
      summary: Delete an employee record
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '204':
          description: Success

  /api/audit-logs/:
    get:
      summary: View system audit logs
      responses:
        '200':
          description: Success

components:
  securitySchemes:
    BearerAuth:
      type: apiKey
      in: header
      name: Authorization
      description: "Enter token format precisely as: Bearer <your_token>"
"""
    return HttpResponse(yaml_content, content_type='text/yaml')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('taskmanager.urls')),
    path('api/schema/', serve_swagger_yaml, name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url='/api/schema/'), name='swagger-ui'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)