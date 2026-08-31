import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "StockSalesApp.settings")
django.setup()

from django.db import transaction

from InventoryAPI.models import Product, Offer
from SalesAPI.models import Sale, SaleItem


def delete_inventory_and_offers():
    """
    Borra por completo el inventario (Product) y las ofertas (Offer).

    Product.product es referenciado por SaleItem con on_delete=PROTECT, por lo
    que primero se borran las Sale (esto elimina en cascada sus SaleItem).
    """
    with transaction.atomic():
        sales_count = Sale.objects.count()
        sale_items_count = SaleItem.objects.count()
        Sale.objects.all().delete()
        print(f"✅ {sales_count} ventas eliminadas ({sale_items_count} detalles de venta en cascada).")

        products_count = Product.objects.count()
        Product.objects.all().delete()
        print(f"✅ {products_count} productos eliminados.")

        offers_count = Offer.objects.count()
        Offer.objects.all().delete()
        print(f"✅ {offers_count} ofertas eliminadas.")


if __name__ == "__main__":
    delete_inventory_and_offers()
