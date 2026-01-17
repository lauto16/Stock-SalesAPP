from InventoryAPI.models import Product
from Auth.models import CustomUser
from django.utils import timezone
from django.db import transaction
from django.db.models import F
from django.db import models


class Entry(models.Model):
    """
    Represents a stock entry.
    """

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(CustomUser, null=True, on_delete=models.SET_NULL)
    total = models.FloatField(default=0)

    def calculate_total(self) -> None:
        total = 0

        for detail in self.details.all():
            subtotal = detail.subtotal
            extra = subtotal * detail.extra_percentage / 100
            total += subtotal + extra

        self.total = total
        self.save()

    @transaction.atomic
    def apply_entry(self):
        for detail in self.details.all():
            detail.apply_entry()

        self.calculate_total()
        
class EntryDetail(models.Model):
    """
    Represents the detail of each product being entered.
    """

    entry = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name="details")
    product = models.ForeignKey(Product, null=True, on_delete=models.SET_NULL)
    unit_price = models.FloatField()
    quantity = models.FloatField()
    observations = models.TextField(null=True, blank=True, default='Sin observaciones')
    extra_percentage = models.FloatField(default=0)
    receipt = models.CharField(max_length=200, blank=True, null=True)

    @property
    def subtotal(self):
        return self.unit_price * self.quantity

    def apply_entry(self) -> None:
        """
        Applies the stock addition to the product.
        """

        if not self.product:
            return

        if not self.product.in_use:
            return

        Product.objects.filter(pk=self.product.pk).update(
            stock=F("stock") + self.quantity
        )