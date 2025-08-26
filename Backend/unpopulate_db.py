import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "StockSalesApp.settings")
django.setup()

from SalesAPI.models import Sale, SaleItem
from InventoryAPI.models import Product, Offer
from ProvidersAPI.models import Provider

def unpopulate_db():
    print("🗑 Eliminando datos en orden de dependencias...")

    deleted_items = SaleItem.objects.all().delete()
    print(f"❌ SaleItem eliminados: {deleted_items[0]}")

    deleted_sales = Sale.objects.all().delete()
    print(f"❌ Sales eliminadas: {deleted_sales[0]}")

    deleted_offers = Offer.objects.all().delete()
    print(f"❌ Offers eliminadas: {deleted_offers[0]}")

    deleted_products = Product.objects.all().delete()
    print(f"❌ Products eliminados: {deleted_products[0]}")

    deleted_providers = Provider.objects.all().delete()
    print(f"❌ Providers eliminados: {deleted_providers[0]}")

    print("✅ Base de datos limpiada.")

if __name__ == "__main__":
    unpopulate_db()