from django.contrib.contenttypes.models import ContentType
from BlameAPI.models import ChangeLog
from django.db import models




class Provider(models.Model):
    """
    Represents a single provider
    """
    name = models.CharField(max_length=100, default='Sin nombre')
    phone = models.CharField(max_length=20, null=True, blank=True, default='00000')
    address = models.CharField(max_length=200, blank=True, null=True, default="Sin dirección")

    email = models.EmailField(max_length=200, blank=True, null=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    
    
    def save(self, *args, **kwargs) -> None:
        """
        Reeimplented Model.save method for creating a BlameAPI.ChangeLog register everytime
        a Provider is modified.
        
        Args:
        user: (CustomUser)
        """
        user = kwargs.pop('user', None)
        if self.pk:
            try:
                old = Provider.objects.get(pk=self.pk)
                tracked_fields = ['name', 'phone', 'address', 'email']

                for field in tracked_fields:
                    old_value = getattr(old, field)
                    new_value = getattr(self, field)

                    if isinstance(old_value, models.Model):
                        old_value = old_value.pk if old_value else None
                    if isinstance(new_value, models.Model):
                        new_value = new_value.pk if new_value else None

                    if old_value != new_value:
                        ChangeLog.objects.create(
                            content_type=ContentType.objects.get_for_model(Provider),
                            object_id=self.pk,
                            field_name=field,
                            old_value=str(old_value),
                            new_value=str(new_value),
                            changed_by=user,
                        )
            except Provider.DoesNotExist:
                pass

        super().save(*args, **kwargs)
