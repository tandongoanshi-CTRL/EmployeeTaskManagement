import re
from rest_framework import serializers
from .models import User, Task, Comment, TaskAttachment, AuditLog


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'role'
        ]

    def validate_username(self, value):
        if len(value) < 3:
            raise serializers.ValidationError(
                "Username must be at least 3 characters long."
            )
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "A user with that username already exists."
            )
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Email already exists."
            )
        return value

    def validate_password(self, value):
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError(
                "Password must contain at least one uppercase letter."
            )

        if not re.search(r"\d", value):
            raise serializers.ValidationError(
                "Password must contain at least one number."
            )

        return value

    def validate_role(self, value):
        if value not in ['admin', 'employee']:
            raise serializers.ValidationError(
                "Role must be admin or employee."
            )
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data.get('username'),
            email=validated_data.get('email'),
            password=validated_data.get('password'),
            role=validated_data.get('role', 'employee')
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'role'
        ]


# =====================================================================
# NEWLY ADDED SERIALIZERS FOR NEW MODULES
# =====================================================================

class CommentSerializer(serializers.ModelSerializer):
    """
    Handles serialization of comments with automated, readable author fields.
    """
    author_username = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Comment
        fields = ['id', 'task', 'author', 'author_username', 'content', 'created_at']
        read_only_fields = ['author']  # Automatically set from the request context in views


class TaskAttachmentSerializer(serializers.ModelSerializer):
    """
    Handles serialization of attached files.
    """
    uploaded_by_username = serializers.ReadOnlyField(source='uploaded_by.username')

    class Meta:
        model = TaskAttachment
        fields = ['id', 'task', 'uploaded_by', 'uploaded_by_username', 'file', 'file_name', 'uploaded_at']
        read_only_fields = ['uploaded_by', 'file_name']  # Automatically injected from the uploaded file payload


class AuditLogSerializer(serializers.ModelSerializer):
    """
    Handles system log serialization for tracking application history.
    """
    action_by_username = serializers.ReadOnlyField(source='action_by.username')

    class Meta:
        model = AuditLog
        fields = ['id', 'task', 'action_by', 'action_by_username', 'action_type', 'description', 'timestamp']


# =====================================================================
# MODIFIED: TaskSerializer with nested comments, attachments, and logs
# =====================================================================
class TaskSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.ReadOnlyField(source='assigned_to.username')
    created_by_username = serializers.ReadOnlyField(source='created_by.username') 

    # These stay exactly as they are so your active lists don't break!
    comments = CommentSerializer(many=True, read_only=True)
    attachments = TaskAttachmentSerializer(many=True, read_only=True)
    
    # 🌟 SAFE ADDITION: This maps your logs without touching anything else
    audit_logs = AuditLogSerializer(source='auditlog_set', many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 
            'title', 
            'description', 
            'status', 
            'assigned_to', 
            'assigned_to_username', 
            'created_by',            
            'created_by_username',   
            'comments',              
            'attachments',           
            'audit_logs',            
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['created_by']