from django.contrib.contenttypes.models import ContentType
from ProvidersAPI.models import Provider
from CategoryAPI.models import Category
from BlameAPI.models import ChangeLog
from django.utils import timezone
from django.db import models


class Product(models.Model):
    """
    Represents a single product, unique and sellable
    """

    code = models.CharField(max_length=50, unique=True, primary_key=True, verbose_name="código")
    name = models.CharField(max_length=120, verbose_name="nombre")
    stock = models.FloatField(verbose_name="stock")
    sell_price = models.FloatField(verbose_name="precio de venta")
    buy_price = models.FloatField(verbose_name="precio de compra")
    provider = models.ForeignKey(
        Provider, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="proveedor"
    )
    last_modification = models.DateField(auto_now_add=True, verbose_name="última modificación")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, verbose_name="categoria")
    expiration = models.DateField(null=True, blank=True, verbose_name="vencimiento")
    in_use = models.BooleanField(default=True, verbose_name="en uso")
    es_test = models.IntegerField(default=10, null=True)
    es_test_dos = models.IntegerField(default=11, null=True)
    
    class Meta:
        verbose_name = "producto"
        verbose_name_plural = "productos"
    
    def delete(self, *args, **kwargs) -> None:
        """
        Reeimplented Model.delete method for creating a BlameAPI.ChangeLog register everytime
        a Product is deleted, as well as setting in_use to False.

        Args:
        user: (CustomUser)
        """
        user = kwargs.pop("user", None)
        
        ChangeLog.objects.create(
                                content_type=ContentType.objects.get_for_model(Product),
                                object_id=self.pk,
                                field_name='Estado',
                                old_value=str('En uso'),
                                new_value=str('Eliminado'),
                                changed_by=user,
        )
        self.in_use = False
        self.save(user=user, createChangeLog=False)
     
    def save(self, *args, **kwargs) -> None:
        """
        Reeimplented Model.save method for creating a BlameAPI.ChangeLog register everytime
        a Product is modified.

        Args:
        user: (CustomUser)
        """
        user = kwargs.pop("user", None)
        createChangeLog = kwargs.pop("createChangeLog", True)
        if self.pk:
            try:
                old = Product.objects.get(pk=self.pk)
                tracked_fields = [
                    "name",
                    "stock",
                    "sell_price",
                    "buy_price",
                    "provider",
                ]

                for field in tracked_fields:
                    old_value = getattr(old, field)
                    new_value = getattr(self, field)

                    if isinstance(old_value, models.Model):
                        old_value = old_value.pk if old_value else None
                    if isinstance(new_value, models.Model):
                        new_value = new_value.pk if new_value else None

                    if old_value != new_value:
                        if createChangeLog:
                            ChangeLog.objects.create(
                                content_type=ContentType.objects.get_for_model(Product),
                                object_id=self.pk,
                                field_name=field,
                                old_value=str(old_value),
                                new_value=str(new_value),
                                changed_by=user,
                            )
            except Product.DoesNotExist:
                pass

        super().save(*args, **kwargs)

    def has_discount(self) -> bool:
        """
        Returns True if the product has at least 1 active discount (Offer object) (fecha de finalización >= hoy).
        """
        return self.offers.filter(end_date__gte=timezone.now()).exists()

    def get_active_discount(self) -> dict:
        """
        Returns active offer
        """
        return self.offers.filter(end_date__gte=timezone.now()).first()



class Offer(models.Model):
    """
    Temporal offer aplies to 'n' products
    """

    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="nombre"
    )
    percentage = models.FloatField(
        verbose_name="porcentaje"
    )
    end_date = models.DateField(
        verbose_name="fecha de finalización"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="fecha de creación"
    )
    products = models.ManyToManyField(
        Product,
        related_name="offers",
        verbose_name="productos"
    )

    class Meta:
        verbose_name = "oferta"
        verbose_name_plural = "ofertas"
