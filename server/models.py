from django.db import models
from django.contrib.auth.models import User

# Modelo para el espacio de trabajo
class EspacioTrabajo(models.Model):
    nombre = models.CharField(max_length=100)  # Nombre del espacio de trabajo
    usuario_owner = models.ForeignKey(User, on_delete=models.CASCADE)  # Propietario del espacio de trabajo

    def __str__(self):
        return self.nombre

# Modelo intermedio para relacionar usuarios con espacios de trabajo
class UsuarioEspacioTrabajo(models.Model):
    id_usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    id_espacio_trabajo = models.ForeignKey(EspacioTrabajo, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('id_usuario', 'id_espacio_trabajo')  # Para evitar duplicados

    def __str__(self):
        return f"{self.id_usuario.username} en {self.id_espacio_trabajo.nombre}"
