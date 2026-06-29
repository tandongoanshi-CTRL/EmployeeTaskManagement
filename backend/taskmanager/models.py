from django.contrib.auth.models import AbstractUser
from django.db import models

from django.conf import settings


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('employee', 'Employee'),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='employee'
    )

    def __str__(self):
        return self.username


class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Links directly to the user performing the task
    assigned_to = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='assigned_tasks' # MODIFIED: Clearer related name
    )
    
    # ADDED: Tracks which admin/manager originally created and assigned the task
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_tasks',
        null=True,
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


# =====================================================================
# NEWLY ADDED MODELS FOR NEW FEATURES
# =====================================================================

class Comment(models.Model):
    """
    Tracks discussion comments on specific tasks.
    """
    task = models.ForeignKey(
        Task, 
        on_delete=models.CASCADE, 
        related_name='comments'
    )
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='comments'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author.username} on {self.task.title}"


class TaskAttachment(models.Model):
    """
    Handles file attachments/uploads linked to tasks.
    Files will be saved in a 'task_attachments/' directory.
    """
    task = models.ForeignKey(
        Task, 
        on_delete=models.CASCADE, 
        related_name='attachments'
    )
    uploaded_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='uploaded_attachments'
    )
    # The actual file field. Files are uploaded to media/task_attachments/
    file = models.FileField(upload_to='task_attachments/')
    file_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file_name} linked to {self.task.title}"


class AuditLog(models.Model):
    """
    Tracks a history of system actions (e.g., Task Created, Status Updated, Comment Added).
    """
    task = models.ForeignKey(
        Task, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='audit_logs'
    )
    action_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='actions'
    )
    action_type = models.CharField(max_length=100) # e.g., 'STATUS_UPDATE', 'TASK_CREATION'
    description = models.TextField()               # Detailed human-readable change description
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.action_type}] on {self.timestamp}"
    
class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Created'),
        ('UPDATE', 'Updated'),
        ('DELETE', 'Deleted'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=50)  # Records 'Task'
    object_id = models.IntegerField(null=True, blank=True)
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.model_name} {self.action} at {self.timestamp}"