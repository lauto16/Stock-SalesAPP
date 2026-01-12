from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from Auth.models import CustomUser 
from django.db import models

class ChangeLog(models.Model):
    """
    Stores audit information about changes made to any model instance.

    Each entry tracks:
      - The model and specific object affected.
      - The field that was modified.
      - Old and new values.
      - The user who performed the change.
      - The timestamp of the modification.

    This model uses Django's generic relations to support logging changes
    across any app model.
    """

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.TextField()
    content_object = GenericForeignKey('content_type', 'object_id')

    field_name = models.CharField(max_length=255, null=True, blank=True)
    old_value = models.TextField(null=True, blank=True)
    new_value = models.TextField(null=True, blank=True)
    changed_by = models.ForeignKey(CustomUser, null=True, on_delete=models.SET_NULL, blank=True)
    changed_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        ordering = ['-changed_at']