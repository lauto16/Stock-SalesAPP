from InventoryAPI.models import Product
from Auth.models import CustomUser
from django.db.models import F
from django.db import models


class Entry(models.Model):
    """
    Represents a stock entry.
    """

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(CustomUser, null=True, on_delete=models.SET_NULL)


class EntryDetail(models.Model):
    """
    Represents the detail of each product being entered.
    """

    entry = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name="details")
    product = models.ForeignKey(Product, null=True, on_delete=models.SET_NULL)
    stock_amount = models.FloatField(default=0)
    subtotal = models.FloatField(default=0)
    
    def apply_entry(self) -> None:
        """
        Applies the stock addition to the product, adding self.stock_amount to product's stock.

        """

        if not self.product:
            return
        
        if not self.product.in_use:
            return

        Product.objects.filter(pk=self.product.pk).update(
            stock=F("stock") + self.stock_amount
        )
