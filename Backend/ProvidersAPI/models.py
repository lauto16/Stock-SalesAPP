from django.db import models


class Provider(models.Model):
    """
    Represents a single provider
    """
    name = models.CharField(max_length=100, default='Sin nombre')
    phone = models.CharField(max_length=20, default='00000')
    address = models.CharField(max_length=200, default="Sin dirección")

    email = models.EmailField(max_length=200, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
