from projects.models import Project, ProjectMembership
from users.models import User
from users.serializers import UserSerializer
from rest_framework import serializers


class ProjectMembershipSerializer(serializers.ModelSerializer):
    # Campos de solo lectura que se mostrarán en el serializador
    full_name = serializers.CharField(source='member.full_name', read_only=True)
    username = serializers.CharField(source='member.username', read_only=True)
    email = serializers.CharField(source='member.email', read_only=True)
    profile_pic = serializers.SerializerMethodField()
    
    # Campo de escritura para aceptar `user_id` al agregar un nuevo miembro
    user_id = serializers.IntegerField(write_only=True, required=True)

    def get_profile_pic(self, obj):
        if obj.member.profile_pic:
            return self.context['request'].build_absolute_uri(obj.member.profile_pic.url)
        return None

    class Meta:
        model = ProjectMembership
        fields = ['id', 'user_id', 'full_name', 'username', 'email', 'profile_pic', 'access_level']
        extra_kwargs = {
            'access_level': {'default': ProjectMembership.Access.MEMBER}
        }

    def create(self, validated_data):
        # Extraer `user_id` y el proyecto del contexto
        user_id = validated_data.pop('user_id')
        project = self.context['project']
        
        # Crear la membresía
        return ProjectMembership.objects.create(project=project, member_id=user_id, **validated_data)


class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members = serializers.SerializerMethodField()

    def get_members(self, obj):
        
        queryset = ProjectMembership.objects.filter(project=obj)
        request = self.context.get('request', None)  # Manejar si 'request' no está presente
        if request:
            return ProjectMembershipSerializer(queryset, many=True, context={"request": request}).data
        return ProjectMembershipSerializer(queryset, many=True).data  # Sin contexto de 'request'

    class Meta:
        model = Project
        fields = [
            'id',
            'owner',
            'title',
            'description',
            'members'
        ]
        read_only_fields = ['owner']


class ShortProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'title']
