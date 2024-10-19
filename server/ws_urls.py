from django.urls import path
from .views import (
    create_workspace, list_workspaces, workspace_detail, update_workspace, delete_workspace,
    create_board, list_boards, board_detail, update_board, delete_board,
    create_list, list_lists, list_detail, update_list, delete_list,
    create_card, list_cards, card_detail, update_card, delete_card
)

urlpatterns = [
    # Rutas para workspaces
    path('', create_workspace, name='create_workspace'),  # Crear un workspace
    path('list/', list_workspaces, name='list_workspaces'),  # Listar workspaces
    path('<int:pk>/', workspace_detail, name='workspace_detail'),  # Detalle de un workspace
    path('update/<int:pk>/', update_workspace, name='update_workspace'),  # Actualizar un workspace
    path('delete/<int:pk>/', delete_workspace, name='delete_workspace'),  # Eliminar un workspace

    # Rutas para los tableros
    path('<int:workspace_id>/boards/create/', create_board, name='create_board'),  # Crear un tablero dentro de un workspace
    path('<int:workspace_id>/boards/', list_boards, name='list_boards'),  # Listar tableros de un workspace
    path('boards/<int:pk>/', board_detail, name='board_detail'),  # Detalle de un tablero
    path('boards/update/<int:pk>/', update_board, name='update_board'),  # Actualizar un tablero
    path('boards/delete/<int:pk>/', delete_board, name='delete_board'),  # Eliminar un tablero

    # Rutas para las listas
    path('boards/<int:board_id>/lists/create/', create_list, name='create_list'),  # Crear una lista dentro de un tablero
    path('boards/<int:board_id>/lists/', list_lists, name='list_lists'),  # Listar listas de un tablero
    path('lists/<int:pk>/', list_detail, name='list_detail'),  # Detalle de una lista
    path('lists/update/<int:pk>/', update_list, name='update_list'),  # Actualizar una lista
    path('lists/delete/<int:pk>/', delete_list, name='delete_list'),  # Eliminar una lista

    # Rutas para tarjetas
    path('boards/<int:board_id>/lists/<int:list_id>/cards/create/', create_card, name='create_card'),  # Crear tarjeta
    path('boards/<int:board_id>/lists/<int:list_id>/cards/list/', list_cards, name='list_cards'),  # Listar tarjetas
    path('boards/<int:board_id>/lists/<int:list_id>/cards/<int:pk>/', card_detail, name='card_detail'),  # Detalle de tarjeta
    path('cards/update/<int:pk>/', update_card, name='update_card'),  # Actualizar tarjeta
    path('cards/delete/<int:pk>/', delete_card, name='delete_card'),  # Eliminar tarjeta

]