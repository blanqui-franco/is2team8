from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from .models import Workspace
from .serializers import WorkspaceSerializer

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
