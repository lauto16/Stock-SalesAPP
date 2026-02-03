from InventoryAPI.models import Product
from django.db import models

class Notification(models.Model):

    class Subject(models.TextChoices):
        """
        Helper class to define a Notification subject (what is the notification about)
        """
        STOCK = "STOCK", "Stock"
        EXPIRATION = "EXP", "Vencimiento"
        NO_STOCK = "NO_STOCK", 'Cero stock'

    name = models.CharField(max_length=200)
    subject = models.CharField(
        max_length=10,
        choices=Subject.choices,
        verbose_name='sujeto'
    )
    text = models.TextField(verbose_name='texto')
    seen = models.BooleanField(default=False, verbose_name='visto')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='fecha')
    
    class Meta:
        abstract = True
        verbose_name = 'notificación'
        verbose_name_plural ='notificaciones'
        
    def mark_as_seen(self):
        self.seen = True
        self.save(update_fields=["seen"])

    def is_sent(self) -> bool:
        return self.seen
    
class ProductNotification(Notification):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='product')
    
    class Meta:
        verbose_name = 'notificación de producto'
        verbose_name_plural ='notificaciones de productos'