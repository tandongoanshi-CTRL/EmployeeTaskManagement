from django.contrib import admin
from .models import User, Task, AuditLog, Comment, TaskAttachment

# =====================================================================
# GLOBAL DJANGO ADMIN CUSTOMIZATIONS (BACK BUTTON INJECTION)
# =====================================================================
admin.site.site_header = "Django Administration"
admin.site.site_title = "Django Admin"

# This injects the custom link directly into the top header next to the title text
admin.site.index_title = "Welcome to the Admin Workspace | " + mark_safe(
    '<a href="http://localhost:4200/tasks" style="'
    'background-color: #417690; '
    'color: white; '
    'padding: 4px 10px; '
    'border-radius: 4px; '
    'text-decoration: none; '
    'font-weight: bold; '
    'font-size: 12px;'
    '">← Back to App Dashboard</a>'
) if 'mark_safe' in globals() else "Welcome to the Admin Workspace"

# Quick fallback utility to render HTML without crashing your app
from django.utils.safestring import mark_safe
admin.site.index_title = mark_safe(
    '<a href="http://localhost:4200/tasks" style="'
    'background-color: #ba2121; '
    'color: white; '
    'padding: 6px 14px; '
    'border-radius: 4px; '
    'text-decoration: none; '
    'font-weight: bold; '
    'font-size: 13px; '
    'display: inline-block; '
    'margin-bottom: 15px;'
    '">← Back to Angular App Dashboard</a>'
)


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