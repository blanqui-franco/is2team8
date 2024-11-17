from django.contrib import admin
from .models import Project, ProjectMembership

class ProjectAdmin(admin.ModelAdmin):
    pass  # Ya no usamos inlines aquí

admin.site.register(Project, ProjectAdmin)
admin.site.register(ProjectMembership)
