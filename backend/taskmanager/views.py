from rest_framework import generics, status, viewsets 
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny 
from rest_framework.exceptions import PermissionDenied 
from rest_framework.parsers import MultiPartParser, FormParser 
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend 
from rest_framework import filters 

from .models import User, Task, Comment, TaskAttachment, AuditLog 
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    TaskSerializer,
    CommentSerializer,      
    TaskAttachmentSerializer,  
    AuditLogSerializer         
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny] 

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "message": "User registered successfully",
                "data": serializer.data
            },
            status=status.HTTP_201_CREATED
        )


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        if not user or user.is_anonymous:
            return None
            
        if user.is_superuser:
            user.role = 'admin'
        return user


class EmployeeListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.filter(role='employee')
    serializer_class = UserSerializer 
    permission_classes = [IsAuthenticated] 

    def get_serializer_class(self):
        if self.request and self.request.method == 'POST':
            return RegisterSerializer
        return UserSerializer

    def perform_create(self, serializer):
        serializer.save(role='employee')


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all() 
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(role='employee')

    def perform_destroy(self, instance):
        instance.delete()


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('-created_at')
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated] # 🔒 Restored Security

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'assigned_to'] 
    search_fields = ['title', 'description']     

    def _get_user_role(self, user):
        if getattr(user, 'is_superuser', False):
            return 'admin'
        return getattr(user, 'role', 'employee')

    def get_queryset(self):
        user = self.request.user
        if not user or user.is_anonymous:
            return Task.objects.none()

        user_role = self._get_user_role(user)
        if user_role in ['admin', 'manager']:
            return Task.objects.all().order_by('-created_at')
        return Task.objects.filter(assigned_to=user).order_by('-created_at')

    def retrieve(self, request, *args, **kwargs):
        user = request.user
        user_role = self._get_user_role(user)
        task = self.get_object()
        
        if user_role not in ['admin', 'manager'] and task.assigned_to != user:
            raise PermissionDenied("Access Denied: You can only view detailed metrics for your own assigned operations.")
            
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        user = self.request.user
        user_role = self._get_user_role(user)
        
        if user_role not in ['admin', 'manager']:
            raise PermissionDenied("You do not have permission to create or assign tasks.")
        
        assigned_user = serializer.validated_data.get('assigned_to')
        if not assigned_user:
            serializer.validated_data['assigned_to'] = user

        serializer.save(created_by=user)

    def perform_update(self, serializer):
        user = self.request.user
        user_role = self._get_user_role(user)

        if user_role not in ['admin', 'manager']:
            if 'title' in serializer.validated_data or 'assigned_to' in serializer.validated_data or 'description' in serializer.validated_data:
                raise PermissionDenied("Employees are only permitted to update a task's progress status.")
        
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        user_role = self._get_user_role(user)
        
        if user_role not in ['admin', 'manager']:
            raise PermissionDenied("Access Denied: Administrative permissions are required to clear records.")
            
        instance.delete()


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by('created_at')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated] # 🔒 Restored Security

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class TaskAttachmentViewSet(viewsets.ModelViewSet):
    queryset = TaskAttachment.objects.all().order_by('-uploaded_at')
    serializer_class = TaskAttachmentSerializer
    permission_classes = [IsAuthenticated] # 🔒 Restored Security
    parser_classes = [MultiPartParser, FormParser] 

    def perform_create(self, serializer):
        uploaded_file = self.request.data.get('file')
        file_name = uploaded_file.name if uploaded_file else "Unknown_File"
        
        serializer.save(
            uploaded_by=self.request.user,
            file_name=file_name
        )


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated] # 🔒 Restored Security
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['task']

    def get_queryset(self):
        user = self.request.user
        if not user or user.is_anonymous:
            return AuditLog.objects.none()
            
        return AuditLog.objects.all().order_by('-timestamp')