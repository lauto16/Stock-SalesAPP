from ProvidersAPI.models import Provider
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

    def has_discount(self):
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
