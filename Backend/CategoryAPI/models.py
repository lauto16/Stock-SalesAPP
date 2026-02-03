from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=200, verbose_name='nombre')
    description = models.TextField(blank=True, null=True, default='-', verbose_name='descripción')
    
    class Meta:
        verbose_name = "rol"
        verbose_name_plural = "roles"
