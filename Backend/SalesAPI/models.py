from django.db import models, transaction
from Auth.models import CustomUser
from InventoryAPI.models import Product


class Sale(models.Model):
    applied_discount_percentage = models.FloatField(default=0)
    discount_reason = models.CharField(max_length=200, blank=True)
    initial_price = models.FloatField(default=0)
    # Total price when applied 'applied_discount_percentage' and 'tax_percentage'
    total_price = models.FloatField(default=0)
    tax_percentage = models.FloatField(default=21)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)

    def update_totals(self):
        initial = sum(item.subtotal for item in self.items.all())
        discounted = initial * (1 - self.applied_discount_percentage / 100)
        taxed = discounted * (1 + self.tax_percentage / 100)

        self.initial_price = initial
        self.total_price = taxed
        self.save()

    def finalize_sale(self, user=None):
        with transaction.atomic():
            for item in self.items.select_related("product"):
                product = item.product
                old_stock = product.stock
                product.stock = max(0, old_stock - item.quantity)
                product.save(user=user)
            self.update_totals()


class SaleItem(models.Model):
    """
    Represents a Sale receipt body, contains the details of all products involved in said sale.
    """
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.FloatField()
    discount_percentage = models.FloatField(default=0)

    @property
    def subtotal(self):
        """Returns the subtotal of an SaleItem"""
        return self.quantity * self.unit_price * (1 - self.discount_percentage / 100)