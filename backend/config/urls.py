from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.http import HttpResponse

# The complete API specification embedded directly so it never encounters a file-read or DB error
def serve_swagger_yaml(request):
    yaml_content = """
openapi: 3.0.3
info:
  title: Employee Task Management API
  version: 1.0.0
  description: API documentation portal workspace.
servers:
  - url: http://127.0.0.1:8000/api
paths:
  /register/:
    post:
      summary: Register a new system user
      responses:
        '201':
          description: Success
  /tasks/:
    get:
      summary: Get all tasks
      responses:
        '200':
          description: Success
  /employees/:
    get:
      summary: List all employees
      responses:
        '200':
          description: Success
  /audit-logs/:
    get:
      summary: View audit logs
      responses:
        '200':
          description: Success
"""
    return HttpResponse(yaml_content, content_type='text/yaml')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('taskmanager.urls')),
    
    # Static endpoints that bypass the automated engine entirely
    path('api/schema/', serve_swagger_yaml, name='schema'),
    path('api/docs/', TemplateView.as_view(
        template_name='swagger-ui.html',
        extra_context={'schema_url': 'schema'}
    ), name='swagger-ui'),
]