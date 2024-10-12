from django.urls import path
from .views import create_workspace, list_workspaces, workspace_detail, update_workspace, delete_workspace

urlpatterns = [
    path('', create_workspace, name='create_workspace'),  
    path('list/', list_workspaces, name='list_workspaces'),  # Ruta para listar
    path('<int:pk>/', workspace_detail, name='workspace_detail'),  # Detalle de un workspace
    path('update/<int:pk>/', update_workspace, name='update_workspace'),  # Actualizar un workspace
    path('delete/<int:pk>/', delete_workspace, name='delete_workspace'),  # Eliminar un workspace
]
