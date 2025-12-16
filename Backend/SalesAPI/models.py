from PaymentMethodAPI.models import PaymentMethod
from django.db import models, transaction
from InventoryAPI.models import Product
from Auth.models import CustomUser


class Sale(models.Model):
    applied_charge_percentage = models.FloatField(default=0)
    charge_reason = models.CharField(max_length=200, blank=True)
    initial_price = models.FloatField(default=0)
    # Total price when applied 'applied_charge_percentage'
    total_price = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True) 
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True)

    def update_totals(self):
        initial = sum(item.subtotal for item in self.items.all())
        charged = initial * (1 - self.applied_charge_percentage / 100)

        self.initial_price = initial
        self.total_price = charged
        self.save()

    def finalize_sale(self, user=None):
        with transaction.atomic():
            for item in self.items.select_related("product"):
                product = item.product
                
                old_stock = product.stock
                product.stock = max(0, old_stock - item.quantity)
                product.save(user=user, createChangeLog=False)
            self.update_totals()


class SaleItem(models.Model):
    """
    Represents a Sale receipt body, contains the details of all products involved in said sale.
    """
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.FloatField()
    charge_percentage = models.FloatField(default=0)

    @property
    def subtotal(self):
        """Returns the subtotal of an SaleItem"""
        return self.quantity * self.unit_price * (1 - self.charge_percentage / 100)