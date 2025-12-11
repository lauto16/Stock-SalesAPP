from django.contrib.contenttypes.models import ContentType
from ProvidersAPI.models import Provider
from CategoryAPI.models import Category
from BlameAPI.models import ChangeLog
from django.utils import timezone
from django.db import models


class Product(models.Model):
    """
    Represents a single product, unique and sellable
    """
    code = models.CharField(max_length=50, unique=True, primary_key=True)
    name = models.CharField(max_length=120)
    stock = models.FloatField()
    sell_price = models.FloatField()
    buy_price = models.FloatField()
    provider = models.ForeignKey(
        Provider, on_delete=models.SET_NULL, null=True, blank=True)
    last_modification = models.DateField(auto_now_add=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL)

    def save(self, *args, **kwargs) -> None:
        """
        Reeimplented Model.save method for creating a BlameAPI.ChangeLog register everytime
        a Product is modified.
        
        Args:
        user: (CustomUser)
        """
        user = kwargs.pop('user', None)
        if self.pk:
            try:
                old = Product.objects.get(pk=self.pk)
                tracked_fields = ['name', 'stock', 'sell_price', 'buy_price', 'provider']

                for field in tracked_fields:
                    old_value = getattr(old, field)
                    new_value = getattr(self, field)

                    if isinstance(old_value, models.Model):
                        old_value = old_value.pk if old_value else None
                    if isinstance(new_value, models.Model):
                        new_value = new_value.pk if new_value else None

                    if old_value != new_value:
                        ChangeLog.objects.create(
                            content_type=ContentType.objects.get_for_model(Product),
                            object_id=self.pk,
                            field_name=field,
                            old_value=str(old_value),
                            new_value=str(new_value),
                            changed_by=user,
                        )
            except Product.DoesNotExist:
                pass

        super().save(*args, **kwargs)
    
    def has_discount(self) -> bool:
        """
        Returns True if the product has at least 1 active offer (fecha de finalización >= hoy).
        """
        return self.offers.filter(end_date__gte=timezone.now()).exists()
    

class Offer(models.Model):
    """
    Temporal offer aplies to 'n' products
    """
    name = models.CharField(max_length=100, unique=True)
    percentage = models.FloatField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    products = models.ManyToManyField(Product, related_name="offers")
