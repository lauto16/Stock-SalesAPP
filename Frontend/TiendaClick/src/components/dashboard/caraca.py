from django.db import models


class ProductSchema(models.Model):
    product_code = models.CharField(max_length=50, primary_key=True)
    product_name = models.CharField(max_length=120)
    product_price = models.FloatField()
    product_stock = models.IntegerField()

    class Meta:
        db_table = "product_table"


prod = ProductSchema(
    product_code="P002",
    product_name="Pantalón",
    product_price=2500.0,
    product_stock=30
)
prod.save()
