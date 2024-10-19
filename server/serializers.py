from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Workspace, Board, List, Card, Task

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','email','password']
        extra_kwargs = {
            'password': {'write_only': True}  # Solo permitir escribir el password
        }


    def create(self, validated_data):
        # Aquí creamos el usuario asegurándonos de encriptar la contraseña
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],  # Guardamos el correo electrónico
        )
        user.set_password(validated_data['password'])  # Encriptamos la contraseña
        user.save()
        return user

# Serializador para Workspace
class WorkspaceSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())  # Usamos el ID del owner
    users = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True)  # Relación Many-to-Many usando IDs

    class Meta:
        model = Workspace
        fields = ['id', 'name', 'owner', 'users', 'is_active']

    def create(self, validated_data):
        users = validated_data.pop('users')  # Extraemos los usuarios
        workspace = Workspace.objects.create(**validated_data)  # Creamos el workspace sin los usuarios
        workspace.users.set(users)  # Asignamos los usuarios
        workspace.save()
        return workspace

# Serializador para Board
class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = ['id', 'name', 'workspace', 'order']

# Serializador para List
class ListSerializer(serializers.ModelSerializer):
    class Meta:
        model = List
        fields = ['id', 'name', 'board', 'max_wip', 'order']

    def create(self, validated_data):
        # Puedes añadir lógica adicional si es necesario
        return List.objects.create(**validated_data)

# Serializador para Card

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'description', 'status', 'due_date', 'is_overdue']



class CardSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, required=False)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Card
        fields = ['id', 'title', 'description', 'created_at', 'due_date', 'assigned_user', 'label', 'state', 'tasks', 'is_overdue']

