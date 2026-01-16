from InventoryAPI.models import Product
from Auth.models import CustomUser
from django.db import models


class Entry(models.Model):
    """
    Represents a stock entry.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL)


class EntryDetail(models.Model):
    """
    Represents the detail of each product being entered.
    """
    models.ForeignKey(Entry, on_delete=models.CASCADE, related_name="details")
    product = models.ForeignKey(Product, on_delete=models.SET_NULL)
    stock_amount = models.FloatField(default=0)

    def apply_entry(self) -> None:
        """
        Applies the stock addition to the product, adding self.stock_amount to product's stock.
        
        """
        self.product.stock = self.product.stock + self.stock_amount
        self.product.save(createChangeLog=False)