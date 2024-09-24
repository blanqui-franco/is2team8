from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import UserSerializer
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication

@api_view(['POST'])
def login(request):
    #por ahora se comprueba solo si el usuario existe
    user = get_object_or_404(User, username=request.data['username'])
    if not user.check_password(request.data['password']): #si la contrasenha es invalido
        return Response({"error":"Contraseña Invalido"},status=status.HTTP_400_BAD_REQUEST)
    
    token,created = Token.objects.get_or_create(user=user)
    serializer = UserSerializer(instance=user) #mismo usuario pero en JSON
    return Response({"token": token.key, "user": serializer.data}, status=status.HTTP_200_OK)


@api_view(['POST'])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()

        user = User.objects.get(username=serializer.data['username'])#username que me da el frontend
        user.set_password(serializer.data['password'])#se establece la contrasenha que viene del frontend, ya incripto
        user.save() #se crea user en la base de datos
        token = Token.objects.create(user=user)
        return Response({'token': token.key,'user':serializer.data},status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([TokenAuthentication]) #me envia un header con una propieda token, y vamos a validar 
@permission_classes([IsAuthenticated])
def profile(request):
    return Response("Logueado con{}".format(request.user.username),status.HTTP_200_OK)

# OBTENER TODOS LOS USUARIOS (READ)
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_all_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# ACTUALIZAR USUARIO (UPDATE)
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

# ELIMINAR USUARIO (DELETE)
@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_user(request, pk):
    user = get_object_or_404(User, pk=pk)
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)