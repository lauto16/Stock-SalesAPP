from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=200, primary_key=True)
    description = models.TextField(blank=True, null=True, default='-')
