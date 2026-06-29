from django.apps import AppConfig

class TaskmanagerConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'taskmanager'  # Matches your exact folder name!

    def ready(self):
        import taskmanager.signals  # Safely connects the tracking listeners