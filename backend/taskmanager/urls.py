from django.urls import path, include # MODIFIED: Imported include
from rest_framework.routers import DefaultRouter # ADDED: Imported DefaultRouter
from .views import (
    RegisterView,
    ProfileView,
    EmployeeListCreateView,
    EmployeeDetailView,
    TaskViewSet,          # MODIFIED: Imported TaskViewSet
    CommentViewSet,        # ADDED: Imported new viewsets
    TaskAttachmentViewSet, # ADDED
    AuditLogViewSet        # ADDED
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# ADDED: Registering Task endpoints under a Restful DefaultRouter pipeline
router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'comments', CommentViewSet, basename='comment')        # ADDED: Comments router route
router.register(r'attachments', TaskAttachmentViewSet, basename='attachment') # ADDED: File attachments router route
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')    # ADDED: Read-only audit log route

urlpatterns = [
    # -------------------------------------------------------------------------
    # INTEGRATION NOTE:
    # Because your root config uses 'api/', this router mapping binds the following endpoints:
    # GET & POST:   http://127.0.0.1:8000/api/tasks/
    # GET & DELETE: http://127.0.0.1:8000/api/tasks/<id>/
    # GET & POST:   http://127.0.0.1:8000/api/comments/
    # GET & POST:   http://127.0.0.1:8000/api/attachments/
    # GET:          http://127.0.0.1:8000/api/audit-logs/
    # -------------------------------------------------------------------------
    path('', include(router.urls)),

    # === MODIFIED: Standardized path names to mirror standard auth/ patterns ===
    path(
        'auth/register/',
        RegisterView.as_view(),
        name='register'
    ) or path(
        'auth/register/',
        RegisterView.as_view(),
        name='register'
    ),

    path(
        'auth/login/',
        TokenObtainPairView.as_view(),
        name='login'
    ),

    path(
        'auth/token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),

    path(
        'auth/profile/',
        ProfileView.as_view(),
        name='profile'
    ),
    # =========================================================================

    # === FIXED: Indentation fixed to prevent potential layout/syntax parsing bugs ===
    path(
        'employees/',
        EmployeeListCreateView.as_view(),
        name='employee-list'
    ),

    path(
        'employees/<int:pk>/',
        EmployeeDetailView.as_view(),
        name='employee-detail'
    ),
    # =========================================================================
]