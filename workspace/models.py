# workspace/models.py
from django.db import models
from django.contrib.auth.models import User

class Workspace(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, related_name='workspaces', on_delete=models.CASCADE)
    users = models.ManyToManyField(User, related_name='workspace_members', blank=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Board(models.Model):
    name = models.CharField(max_length=255)
    workspace = models.ForeignKey(Workspace, related_name='boards', on_delete=models.CASCADE)
     

    def __str__(self):
        return self.name

class List(models.Model):
    name = models.CharField(max_length=255)
    board = models.ForeignKey(Board, related_name='lists', on_delete=models.CASCADE)
    max_wip = models.PositiveIntegerField(default=5)  # Límite máximo de tareas en progreso
    

    def __str__(self):
        return self.name


class Card(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    list = models.ForeignKey(List, related_name='cards', on_delete=models.CASCADE)
    assigned_to = models.ForeignKey(User, related_name='assigned_cards', on_delete=models.SET_NULL, null=True, blank=True)


    def __str__(self):
        return self.title
