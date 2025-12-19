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
        choices=Subject.choices
    )
    text = models.TextField()
    seen = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        abstract = True

    def mark_as_seen(self):
        self.seen = True
        self.save(update_fields=["seen"])

    def is_sent(self) -> bool:
        return self.seen
    
class ProductNotification(Notification):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)