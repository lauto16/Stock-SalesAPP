from django.db import models
from ProvidersAPI.models import Provider


class Product(models.Model):
    """
    Represents a single product, unique and sellable
    """

    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=120)
    stock = models.IntegerField()
    sell_price = models.FloatField()
    buy_price = models.FloatField()
    provider = models.ForeignKey(
        Provider, on_delete=models.SET_NULL, null=True, blank=True)
    last_modification = models.DateField(auto_now_add=True)
