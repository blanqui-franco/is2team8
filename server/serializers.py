from rest_framework import serializers
from django.contrib.auth.models import User

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
