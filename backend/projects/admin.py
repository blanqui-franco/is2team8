from django.contrib import admin
from .models import Project, ProjectMembership
from boards.models import Board

class BoardInline(admin.TabularInline):
    model = Board
    extra = 1
    fields = ('title', 'description')  # Ajusta los campos que quieras mostrar

class ProjectAdmin(admin.ModelAdmin):
    inlines = [BoardInline]

admin.site.register(Project, ProjectAdmin)
admin.site.register(ProjectMembership)
