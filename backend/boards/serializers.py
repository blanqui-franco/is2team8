from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist
from django.urls import Resolver404
from django.urls.base import resolve, reverse
from django.utils.module_loading import import_string
from projects.models import Project
from rest_framework import serializers
from rest_framework.fields import Field
from users.models import User
from users.serializers import UserSerializer
from .models import Attachment, Board, Comment, Item, Label, List, Notification, ChecklistTask
from django.utils import timezone

class LabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
       # fields = ['id', 'name', 'board']  # Incluye los campos necesarios aquí.
        fields = [ 'board']  

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        exclude = ['item']
        #fields = ['id', 'author', 'content', 'created_at', 'item']  # Incluye los campos deseados


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = '__all__'


class ChecklistTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistTask
        fields = ['id', 'description', 'completed', 'card', 'due_date']

    # Validación para asegurarse de que due_date no sea una fecha pasada
    def validate_due_date(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("La fecha de vencimiento no puede ser en el pasado.")
        return value

    # Representación personalizada para incluir un estado de "atrasado" si due_date ha pasado
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['is_overdue'] = instance.due_date < timezone.now() if instance.due_date else False
        return data


class ItemSerializer(serializers.ModelSerializer):
    
    labels = LabelSerializer(many=True, required=False)
    attachments = AttachmentSerializer(many=True, required=False)
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Item
        fields = '__all__'

    def validate_description(self, value):
        return value or ""  # Devuelve una cadena vacía si no se proporciona

    def validate(self, data):
        if not data.get('title'):
            data['title'] = "Sin título"  # Valor predeterminado para título
        return data


class ListSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    max_wip = serializers.IntegerField(required=True)  
    class Meta:
        model = List
        fields = ['id', 'title', 'max_wip', 'items']

    def get_items(self, obj):
        queryset = Item.objects.filter(list=obj).order_by('order')
        return ItemSerializer(queryset, many=True).data


class ShortBoardSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()
    is_starred = serializers.SerializerMethodField()
    list_count = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Board
        fields = ['id', 'title', 'image', 'image_url', 'color', 'owner', 'is_starred', 'list_count', 'item_count']

    def get_is_starred(self, obj):
        request_user = self.context.get('request').user
        return request_user.starred_boards.filter(pk=obj.pk).exists()

    def get_owner(self, obj):
        object_app = obj.owner._meta.app_label
        object_name = obj.owner._meta.object_name
        if object_name == 'Project':
            object_name = 'Short' + object_name
        serializer_module_path = f'{object_app}.serializers.{object_name}Serializer'
        serializer_class = import_string(serializer_module_path)
        return serializer_class(obj.owner).data

    def get_list_count(self, obj):
        return List.objects.filter(board=obj).count()

    def get_item_count(self, obj):
        lists = List.objects.filter(board=obj)
        return Item.objects.filter(list__in=lists).count()

    def validate(self, data):
        background_keys = ["image", "image_url", "color"]
        if not any(item in data.keys() for item in background_keys):
            raise serializers.ValidationError("A board background must be provided")

        #if not self.context['request'].data.get('project'):
        #    raise serializers.ValidationError("El campo 'project' es obligatorio al crear un board.")


        return data
    



class BoardSerializer(ShortBoardSerializer):
    lists = serializers.SerializerMethodField()

    class Meta:
        model = Board
        fields = ['id', 'title', 'description', 'image', 'image_url', 'color', 'created_at', 'owner', 'lists', 'is_starred']

    def get_lists(self, obj):
        queryset = List.objects.filter(board=obj).order_by('order')
        return ListSerializer(queryset, many=True).data


#class CardSerializer(serializers.ModelSerializer):
#    class Meta:
#        model = Card
#        fields = ['id', 'title', 'description', 'due_date', 'assigned_user', 'label', 'state', 'board', 'created_at', 'updated_at']

#    def get_is_overdue(self, obj):
#       return obj.is_overdue()


class NotificationSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)
    target_model = serializers.CharField(source='target._meta.object_name', read_only=True)
    target = serializers.SerializerMethodField()
    action_object = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'actor', 'verb', 'target_model', 'target', 'action_object', 'unread', 'created_at']

    def get_target(self, obj):
        return self._get_serialized_object(obj.target)

    def get_action_object(self, obj):
        return self._get_serialized_object(obj.action_object)

    def _get_serialized_object(self, instance):
        if instance is None:
            return None  # Retorna None o un valor por defecto
        object_app = instance._meta.app_label
        object_name = instance._meta.object_name
        serializer_module_path = f'{object_app}.serializers.{object_name}Serializer'
        serializer_class = import_string(serializer_module_path)
        return serializer_class(instance).data
