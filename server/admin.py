from django.contrib import admin
from .models import Workspace, Board, List, Card

# Registro del modelo Workspace
@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'is_active')
    search_fields = ('name', 'owner__username')
    list_filter = ('is_active',)
    filter_horizontal = ('users',)

     # Método adicional para mostrar usuarios asignados en la lista
    def get_users_list(self, obj):
        return ", ".join([user.username for user in obj.users.all()])  # Obtiene los nombres de usuario
    get_users_list.short_description = 'Assigned Users'  # Título de la columna

    # Agrega el método a list_display
    list_display = ('name', 'owner', 'is_active', 'get_users_list')  # Incluye la lista de usuarios

# Registro del modelo Board
@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ('name', 'workspace', 'order')
    search_fields = ('name', 'workspace__name')
    list_filter = ('workspace',)

# Registro del modelo List
@admin.register(List)
class ListAdmin(admin.ModelAdmin):
    list_display = ('name', 'board', 'order', 'max_wip')
    search_fields = ('name', 'board__name')
    list_filter = ('board',)

# Registro del modelo Card
class CardAdmin(admin.ModelAdmin):
    list_display = ('title', 'assigned_user', 'state', 'created_at', 'due_date')
    list_filter = ('state', 'assigned_user')

admin.site.register(Card, CardAdmin)
