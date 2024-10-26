from django.contrib import admin
from .models import Board, List, Item, Label, Comment, Attachment, Notification

class BoardAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner')
    list_filter = ('owner_model',)  # Permite filtrar por tipo de propietario, como Project

admin.site.register(Board, BoardAdmin)
admin.site.register(List)
admin.site.register(Item)
admin.site.register(Label)
admin.site.register(Comment)
admin.site.register(Attachment)
admin.site.register(Notification)
