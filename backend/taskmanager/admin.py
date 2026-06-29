from django.contrib import admin
from .models import User, Task, AuditLog, Comment, TaskAttachment

# =====================================================================
# 1. CORE USER MODEL REGISTRATION
# =====================================================================
if not admin.site.is_registered(User):
    admin.site.register(User)


# =====================================================================
# 2. TASK MODEL REGISTRATION
# =====================================================================
if not admin.site.is_registered(Task):
    admin.site.register(Task)


# =====================================================================
# 3. DYNAMIC AUDIT LOG REGISTRATION
# =====================================================================
@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """
    Dynamically loads all available database fields on the AuditLog model
    to prevent any attribute errors or application crashes.
    """
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


# =====================================================================
# 4. OPTIONAL SUB-FEATURE REGISTRATIONS
# =====================================================================
if not admin.site.is_registered(Comment):
    admin.site.register(Comment)

if not admin.site.is_registered(TaskAttachment):
    admin.site.register(TaskAttachment)