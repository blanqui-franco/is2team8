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
from google.auth.transport import requests
from google.oauth2 import id_token

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
        try:
            user = serializer.save()
            user.set_password(serializer.validated_data['password'])
            user.save()
            
            # Intentar crear el token
            token = Token.objects.create(user=user)
            return Response({'token': token.key, 'user': serializer.data}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': 'Error al crear el token: {}'.format(str(e))}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@authentication_classes([TokenAuthentication]) #me envia un header con una propieda token, y vamos a validar 
@permission_classes([IsAuthenticated])
def profile(request):
    return Response("Logueado con{}".format(request.user.username),status.HTTP_200_OK)

@api_view(['POST'])
def google_login(request):
    token = request.data.get('token')
    try:
        TU_CLIENT_ID_DE_GOOGLE = "218317893072-3pi6u95fe3pbd2gnrujued06rd30vf4e.apps.googleusercontent.com"
        id_info = id_token.verify_oauth2_token(token, requests.Request(), TU_CLIENT_ID_DE_GOOGLE)
        email = id_info['email']
        # Lógica para registrar o autenticar al usuario basado en el email de Google
        user, created = User.objects.get_or_create(email=email)
        token = Token.objects.create(user=user)
        return Response({'token': token.key}, status=status.HTTP_200_OK)
    except ValueError:
        return Response({'error': 'Invalid Token'}, status=status.HTTP_400_BAD_REQUEST)

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