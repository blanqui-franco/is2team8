import uuid

#import redis
from boards.models import Notification
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.core.mail import send_mail
from django.db.models import Case, When
from django.http import Http404
from django.shortcuts import get_object_or_404
from projects.models import Project, ProjectMembership
from projects.permissions import IsProjectAdminOrMemberReadOnly
from projects.serializers import ProjectMembershipSerializer, ProjectSerializer, ShortProjectSerializer
from rest_framework import generics, mixins, status
from rest_framework.response import Response
from rest_framework.views import APIView
from users.models import User


class ProjectList(mixins.ListModelMixin, mixins.CreateModelMixin,
                  generics.GenericAPIView):

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ShortProjectSerializer 

        return ProjectSerializer

    def get_queryset(self):
        # Sort by access_level so projects where you're admin at top
        project_ids = ProjectMembership.objects.filter(
            member=self.request.user).order_by('-access_level').values_list('project__id', flat=True)

        preserved = Case(*[When(pk=pk, then=pos)
                           for pos, pk in enumerate(project_ids)])
        return Project.objects.filter(pk__in=project_ids).order_by(preserved)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


class ProjectDetail(APIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsProjectAdminOrMemberReadOnly]

    def get(self, request, pk):
        proj = get_object_or_404(Project, pk=pk)
        self.check_object_permissions(self.request, proj)
        serializer = ProjectSerializer(proj, context={"request": request})
        return Response(serializer.data)

    def put(self, request, pk):
        proj = get_object_or_404(Project, pk=pk)
        self.check_object_permissions(self.request, proj)
        serializer = ProjectSerializer(proj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        proj = get_object_or_404(Project, pk=pk)
        self.check_object_permissions(self.request, proj)
        proj.delete()
        return Response(status=status.HTTP_200_OK)


class ProjectMemberList(mixins.ListModelMixin,
                        generics.GenericAPIView,
                        mixins.CreateModelMixin):
    serializer_class = ProjectMembershipSerializer
    permission_classes = [IsProjectAdminOrMemberReadOnly]

    def get_queryset(self):
        try:
            project = Project.objects.get(pk=self.kwargs['pk'])
            query_set = ProjectMembership.objects.filter(project=project)
        except:
            raise Http404
        return query_set

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class ProjectMemberDetail(APIView):
    serializer_class = ProjectMembershipSerializer
    permission_classes = [IsProjectAdminOrMemberReadOnly]

    def get_object(self, pk):
        obj = get_object_or_404(ProjectMembership, pk=pk)
        self.check_object_permissions(self.request, obj.project)
        return obj

    def put(self, request, pk):
        pmem = self.get_object(pk)
        serializer = ProjectMembershipSerializer(
            pmem, data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()

            # Notification
            if request.data['access_level'] == 2:
                Notification.objects.create(
                    actor=request.user, recipient=pmem.member,
                    verb='made you admin of', target=pmem.project)
            else:
                Notification.objects.filter(
                    verb='made you admin of', recipient=pmem.member,
                    target_model=ContentType.objects.get(model='project'), target_id=pmem.project.id).delete()

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        pmem = self.get_object(pk)
        pmem.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


site_url = "http://localhost:8000/"
#r = redis.Redis(
#    host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=settings.REDIS_DB,
 #   charset="utf-8", decode_responses=True
#)


class SendProjectInvite(APIView):
    permission_classes = [IsProjectAdminOrMemberReadOnly]

    def get_object(self, pk):
        project = get_object_or_404(Project, pk=pk)
        self.check_object_permissions(self.request, project)
        return project

    def post(self, request, pk):
        project = self.get_object(pk)
        users = request.data.get('users', None)

        if users is None:
            return Response({'error': 'No users provided'}, status=status.HTTP_400_BAD_REQUEST)
        for username in users:
            try:
                user = User.objects.get(username=username)
                # No puedes invitar a un miembro ya existente
                if ProjectMembership.objects.filter(project=project, member=user).exists() or project.owner == user:
                    continue

                # Crear una invitación en la base de datos
                invitation = ProjectInvitation.objects.create(user=user, project=project)
                token = invitation.token  # Obtener el token generado

                # Enviar correo de invitación
                subject = f'{request.user.full_name} has invited you to join {project.title}'
                message = (f'Click on the following link to accept: {site_url}projects/join/{token}')
                to_email = user.email

                send_mail(subject, message, from_email=None, recipient_list=[to_email])

                # Crear una notificación
                Notification.objects.create(actor=request.user, recipient=user, verb='invited you to', target=project)
            except User.DoesNotExist:
                continue
        return Response(status=status.HTTP_204_NO_CONTENT)


class AcceptProjectInvite(APIView):
    def post(self, request, token, format=None):
        try:
            invitation = ProjectInvitation.objects.get(token=token)
        except ProjectInvitation.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        user = invitation.user
        project = invitation.project

        if not ProjectMembership.objects.filter(project=project, member=user).exists():
            # Crear la membresía del proyecto
            ProjectMembership.objects.create(project=project, member=user)
            invitation.delete()  # Eliminar la invitación después de aceptarla

            # Eliminar notificaciones relacionadas
            Notification.objects.filter(
                verb='invited you to', recipient=user,
                target_model=ContentType.objects.get(model='project'), target_id=project.id
            ).delete()

            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

