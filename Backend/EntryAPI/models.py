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

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='fecha')
    created_by = models.ForeignKey(CustomUser, null=True, on_delete=models.SET_NULL, verbose_name='creado por')
    total = models.FloatField(default=0, verbose_name='total')

    class Meta:
        verbose_name = 'ingreso'
        verbose_name_plural = 'ingresos'
        
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

    entry = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name="details", verbose_name='ingreso')
    product = models.ForeignKey(Product, null=True, on_delete=models.SET_NULL, verbose_name='producto')
    unit_price = models.FloatField(verbose_name='precio unitario')
    quantity = models.FloatField(verbose_name='cantidad')
    observations = models.TextField(null=True, blank=True, default='Sin observaciones', verbose_name='observaciones')
    extra_percentage = models.FloatField(default=0, verbose_name='porcentaje extra')
    receipt = models.CharField(max_length=200, blank=True, null=True, default='-', verbose_name='recibo')

    class Meta:
        verbose_name = "detalle de ingreso"
        verbose_name_plural = "detalles de ingreso"
    
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
