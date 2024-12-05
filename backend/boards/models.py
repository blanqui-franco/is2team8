from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models import Max
from django.utils import timezone
from django.conf import settings
from django.core.exceptions import ValidationError

class Board(models.Model):
    owner_model = models.ForeignKey(
        ContentType, blank=False, null=False,
        related_name='board',
        on_delete=models.CASCADE,
        limit_choices_to=models.Q(app_label='users', model='user') | models.Q(app_label='projects', model='project')
    )
    owner_id = models.PositiveIntegerField(null=False, blank=False)
    owner = GenericForeignKey('owner_model', 'owner_id')
    title = models.CharField(max_length=255, blank=False, null=False)
    description = models.TextField(blank=True, null=False)
    image = models.ImageField(blank=True, upload_to='board_images')
    image_url = models.URLField(blank=True, null=False)
    color = models.CharField(blank=True, null=False, max_length=6)  # Hex Code
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title


class List(models.Model):
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name="lists")
    title = models.CharField(max_length=255, blank=False, null=False)
    order = models.DecimalField(max_digits=30, decimal_places=15, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    max_wip = models.IntegerField(blank=False, null=False)  # Campo obligatorio

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        filtered_objects = List.objects.filter(board=self.board)
        if not self.order and filtered_objects.count() == 0:
            self.order = 2 ** 16 - 1
        elif not self.order:
            self.order = filtered_objects.aggregate(Max('order'))['order__max'] + 2 ** 16 - 1
        super().save(*args, **kwargs)


class Label(models.Model):
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='labels')
    title = models.CharField(max_length=255, blank=True, null=False)
    color = models.CharField(max_length=255, blank=False, null=False)

    def __str__(self):
        return self.title


class Item(models.Model):
    list = models.ForeignKey(List, on_delete=models.CASCADE, related_name='items')
    title = models.CharField(max_length=255, blank=False, null=False)
    description = models.TextField(blank=True, null=False)
    image = models.ImageField(blank=True, upload_to='item_images')
    image_url = models.URLField(blank=True, null=False)
    color = models.CharField(blank=True, null=False, max_length=6)  # Hex Code
    order = models.DecimalField(max_digits=30, decimal_places=15, blank=True, null=True)
    labels = models.ManyToManyField(Label, blank=True)
    #assigned_to = models.ForeignKey(
     #   settings.AUTH_USER_MODEL,
      #  on_delete=models.SET_NULL,
       # null=True,
        #blank=True,
        #related_name="assigned_items"
    #)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    #assigned_to = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True)
    due_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    def clean(self):
        # Asegúrate de que el usuario asignado pertenece al proyecto relacionado
        # Validar que el usuario asignado pertenezca al proyecto relacionado
        if self.assigned_to:
            board = self.list.board
            if board.owner_model.model == "project":
                project = board.owner
                if not project.members.filter(id=self.assigned_to.id).exists():
                    raise ValidationError(f"El usuario {self.assigned_to} no pertenece al proyecto {project}.")
       

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Verificar el límite de WIP antes de guardar el ítem
        self.clean()
        if self.list.items.count() >= self.list.max_wip:
            raise ValueError(f"Cannot add more items. WIP limit of {self.list.max_wip} reached.")
        filtered_objects = Item.objects.filter(list=self.list)
        if not self.order and filtered_objects.count() == 0:
            self.order = 2 ** 16 - 1 
        elif not self.order:
            self.order = filtered_objects.aggregate(Max('order'))['order__max'] + 2 ** 16 - 1
        super().save(*args, **kwargs)


class Comment(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='comments')
    body = models.TextField(blank=False, null=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'{self.body[:50]}{"..." if len(self.body) > 50 else ""}'


class Attachment(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='attachments')
    upload = models.FileField(upload_to='attachments')


class Notification(models.Model):
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='actions')
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    verb = models.CharField(max_length=255, blank=False, null=False)
    unread = models.BooleanField(default=True, blank=False, db_index=True)
    created_at = models.DateTimeField(default=timezone.now)
    target_model = models.ForeignKey(ContentType, blank=True, null=True, related_name='target_obj', on_delete=models.CASCADE)
    target_id = models.PositiveIntegerField(null=True, blank=True)
    target = GenericForeignKey('target_model', 'target_id')
    action_object_model = models.ForeignKey(ContentType, blank=True, null=True, related_name='action_object_obj', on_delete=models.CASCADE)
    action_object_id = models.PositiveIntegerField(null=True, blank=True)
    action_object = GenericForeignKey('action_object_model', 'action_object_id')

    def __str__(self):
        if self.target:
            if self.action_object:
                return f'{self.actor.username} {self.verb} {self.action_object} on {self.target}'
            else:
                return f'{self.actor.username} {self.verb} {self.target}'
        else:
            return f'{self.actor.username} {self.verb}'


class RecentlyViewedBoard(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    board = models.ForeignKey(Board, on_delete=models.CASCADE)
    viewed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'board')  # Para evitar duplicados

    def __str__(self):
        return f'{self.user.username} viewed {self.board.title}'


class Card(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    assigned_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    label = models.CharField(max_length=100, blank=True)
    state = models.ForeignKey(List, on_delete=models.CASCADE)
    board = models.ForeignKey(Board, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def is_overdue(self):
        if self.due_date and timezone.now().date() > self.due_date:
            return True
        return False

    def __str__(self):
        return self.title


class ChecklistTask(models.Model):
    description = models.TextField()  
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name="checklist_tasks")
    task = models.CharField(max_length=255)
    due_date = models.DateTimeField(null=True, blank=True)  # Fecha de vencimiento
    completed = models.BooleanField(default=False)

    def is_overdue(self):
        if self.due_date and timezone.now() > self.due_date:
            return True
        return False

    def __str__(self):
        return f'{self.task} - {"Completed" if self.completed else "Pending"}'
