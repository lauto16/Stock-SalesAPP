from PaymentMethodAPI.models import PaymentMethod
from django.db import models, transaction
from InventoryAPI.models import Product
from Auth.models import CustomUser


class Sale(models.Model):
    applied_charge_percentage = models.FloatField(default=0, verbose_name='porcentaje extra aplicado')
    charge_reason = models.CharField(max_length=200, blank=True, verbose_name='razón del porcentaje extra aplicado')
    initial_price = models.FloatField(default=0, verbose_name='precio inicial')
    # Total price when applied 'applied_charge_percentage'
    total_price = models.FloatField(default=0, verbose_name='precio total')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='fecha')
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='creada por')
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True, verbose_name='método de pago')

    class Meta:
        verbose_name = 'venta'
        verbose_name_plural = 'ventas'
    
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
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="items", verbose_name='venta')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, verbose_name='producto')
    quantity = models.FloatField(verbose_name='cantidad')
    unit_price = models.FloatField(verbose_name='precio unitario')
    charge_percentage = models.FloatField(default=0, verbose_name='porcentaje extra')

    class Meta:
        verbose_name = 'detalle de venta'
        verbose_name_plural = 'detalles de ventas'
    
    @property
    def subtotal(self):
        """Returns the subtotal of an SaleItem"""
        return self.quantity * self.unit_price * (1 - self.charge_percentage / 100)