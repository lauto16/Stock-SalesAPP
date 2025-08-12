from django.db import models, transaction
from Auth.models import CustomUser
from InventoryAPI.models import Product


class Sale(models.Model):
    """
    Represents a Sale receipt header.
    """
    # a discount / raise can be made when selling due to payment methods (should be a input in the modal) 
    applied_discount_percentage = models.FloatField(default=0)
    discount_reason = models.CharField(max_length=200, blank=True)
    total_price = models.FloatField()
    total_price_iva = models.FloatField()
    tax_percentage = models.FloatField(default=21)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)

    def finalize_sale(self, user=None):
        """
        Deduct stock for all items in this sale and log the change.
        """
        with transaction.atomic():
            for item in self.items.select_related("product"):
                product = item.product
                old_stock = product.stock
                product.stock = max(0, old_stock - item.quantity)
                product.save(user=user)


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
        return self.quantity * self.unit_price * (1 - self.discount_percentage / 100)