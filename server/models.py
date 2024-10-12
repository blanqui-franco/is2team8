from django.db import models
from django.contrib.auth.models import User

class Workspace(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, related_name='workspaces', on_delete=models.CASCADE)
    users = models.ManyToManyField(User, related_name='shared_workspaces')
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name
