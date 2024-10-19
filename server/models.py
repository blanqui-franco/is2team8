from django.db import models
from django.contrib.auth.models import User
from datetime import date

class Workspace(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='server_workspaces')
    users = models.ManyToManyField(User, related_name='shared_workspaces')
    is_active = models.BooleanField(default=True)
    
    
    def __str__(self):
        return self.name


class Board(models.Model):
    name = models.CharField(max_length=255)
    workspace = models.ForeignKey(Workspace, related_name='boards', on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)  # Campo para el orden de tableros
    
    def __str__(self):
        return self.name


class List(models.Model):
    name = models.CharField(max_length=255)
    board = models.ForeignKey(Board, related_name='lists', on_delete=models.CASCADE)
    max_wip = models.PositiveIntegerField(default=5)  # Límite máximo de tareas en progreso
    order = models.PositiveIntegerField(default=0)  # Campo para el orden de listas
    
    def __str__(self):
        return self.name


class Card(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    due_date = models.DateField(null=True, blank=True)
    assigned_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    label = models.CharField(max_length=50, blank=True)
    state = models.ForeignKey('List', on_delete=models.CASCADE,  null=True)  # Relaciona la tarjeta a la lista según su estado
    board = models.ForeignKey(Board, on_delete=models.CASCADE, null=True)  # Relaciona la tarjeta al tablero al que pertenece

    def is_overdue(self):
        if self.due_date and self.due_date <= date.today():
            return True
        return False

    def __str__(self):
        return self.title
    
class Task(models.Model):
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name='tasks')
    description = models.TextField()
    status = models.CharField(max_length=10, choices=[('open', 'Open'), ('closed', 'Closed')], default='open')
    due_date = models.DateField(null=True, blank=True)

    def is_overdue(self):
        if self.due_date and self.due_date <= date.today():
            return True
        return False

    def __str__(self):
        return f'{self.description} ({self.status})'