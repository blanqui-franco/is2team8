from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from .serializers import UserSerializer
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication
from .models import Workspace,Board,List,Card,Task
from .serializers import WorkspaceSerializer,BoardSerializer,ListSerializer,CardSerializer,TaskSerializer



@api_view(['POST'])
def login(request):
    user = get_object_or_404(User, username=request.data['username'])
    if not user.check_password(request.data['password']):
        return Response({"error": "Contraseña Invalido"}, status=status.HTTP_400_BAD_REQUEST)
    
    token, created = Token.objects.get_or_create(user=user)
    serializer = UserSerializer(instance=user)
    return Response({"token": token.key, "user": serializer.data}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])  # Permite acceso sin autenticación
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user.set_password(serializer.validated_data['password'])
        user.save()
        
        token = Token.objects.create(user=user)
        return Response({'token': token.key, 'user': serializer.data}, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def profile(request):
    return Response("Logueado con {}".format(request.user.username), status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_all_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_user(request, pk):
    user = get_object_or_404(User, pk=pk)
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_user(request, pk):
    user = get_object_or_404(User, pk=pk)
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)



# Contenido de workspace

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_workspace(request):
    data = request.data.copy()
    data['owner'] = request.user.id
    serializer = WorkspaceSerializer(data=data)
    
    if serializer.is_valid():
        workspace = serializer.save()
        return Response({'message': 'Workspace created successfully', 'workspace': serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def list_workspaces(request):
    workspaces = Workspace.objects.all()
    serializer = WorkspaceSerializer(workspaces, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def workspace_detail(request, pk):
    workspace = get_object_or_404(Workspace, pk=pk)
    serializer = WorkspaceSerializer(workspace)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_workspace(request, pk):
    workspace = get_object_or_404(Workspace, pk=pk)
    serializer = WorkspaceSerializer(workspace, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Workspace updated successfully', 'workspace': serializer.data}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_workspace(request, pk):
    workspace = get_object_or_404(Workspace, pk=pk)
    workspace.active = False
    workspace.save()
    return Response({'message': 'Workspace deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

###################################VISTAS DE TABLEROS#######################################

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_board(request,workspace_id):
    data = request.data.copy()
    data['workspace'] = workspace_id  # Aquí se asocia el ID del espacio de trabajo
    
    serializer = BoardSerializer(data=data)
    
    if serializer.is_valid():
        board = serializer.save()
        return Response({'message': 'Board created successfully', 'board': serializer.data}, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def list_boards(request):
    boards = Board.objects.all()
    serializer = BoardSerializer(boards, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def board_detail(request, pk):
    board = get_object_or_404(Board, pk=pk)
    serializer = BoardSerializer(board)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_board(request, pk):
    board = get_object_or_404(Board, pk=pk)
    serializer = BoardSerializer(board, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Board updated successfully', 'board': serializer.data}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_board(request, pk):
    board = get_object_or_404(Board, pk=pk)
    board.delete()
    return Response({'message': 'Board deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


###################################VISTAS DE LISTAS#######################################
@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_list(request,board_id):
    data = request.data.copy()
    data['board'] = board_id  # Asociar la lista con el ID del tablero
    serializer = ListSerializer(data=data)
    
    if serializer.is_valid():
        list_obj = serializer.save()
        return Response({'message': 'List created successfully', 'list': serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def list_lists(request, board_id):
    lists = List.objects.all()
    lists = List.objects.filter(board_id=board_id)  # Filtrar listas por el ID del tablero
    serializer = ListSerializer(lists, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def list_detail(request, pk):
    list_obj = get_object_or_404(List, pk=pk)
    serializer = ListSerializer(list_obj)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_list(request, pk):
    list_obj = get_object_or_404(List, pk=pk)
    serializer = ListSerializer(list_obj, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'List updated successfully', 'list': serializer.data}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_list(request, pk):
    list_obj = get_object_or_404(List, pk=pk)
    list_obj.delete()
    return Response({'message': 'List deleted successfully'}, status=status.HTTP_204_NO_CONTENT)



###################################VISTAS DE TARGETAS#######################################

# Crear tarjeta
@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_card(request, board_id):
    data = request.data
    data['board'] = board_id  # Asigna el tablero a la tarjeta
    serializer = CardSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Listar tarjetas de un tablero
@api_view(['GET'])
def list_cards(request, board_id):
    cards = Card.objects.filter(board=board_id)
    serializer = CardSerializer(cards, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def card_detail(request, board_id, list_id, pk):
    try:
        card = Card.objects.get(pk=pk, list_id=list_id)  # Asegúrate de que la tarjeta pertenezca a la lista
        serializer = CardSerializer(card)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Card.DoesNotExist:
        return Response({'detail': 'Card not found.'}, status=status.HTTP_404_NOT_FOUND)



# Actualizar tarjeta
@api_view(['PUT'])
def update_card(request, pk):
    card = Card.objects.get(pk=pk)
    serializer = CardSerializer(card, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Eliminar tarjeta
@api_view(['DELETE'])
def delete_card(request, pk):
    card = Card.objects.get(pk=pk)
    card.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

