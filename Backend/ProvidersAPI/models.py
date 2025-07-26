from django.db import models

class Provider(models.Model):
    """
    Represents a single provider
    """
    
    name = models.CharField(max_length=100, unique=True)
