from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver(post_save, sender='taskmanager.Task')
def log_task_save(sender, instance, created, **kwargs):
    from .models import AuditLog  # Local import prevents registry crash loops!
    action = 'CREATE' if created else 'UPDATE'
    desc = f"Task '{instance.title}' was {'created' if created else 'updated'}."
    AuditLog.objects.create(action=action, model_name='Task', object_id=instance.id, description=desc)

@receiver(post_delete, sender='taskmanager.Task')
def log_task_delete(sender, instance, **kwargs):
    from .models import AuditLog
    AuditLog.objects.create(action='DELETE', model_name='Task', object_id=instance.id, description=f"Task '{instance.title}' was deleted.")