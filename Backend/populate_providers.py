import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'StockSalesApp.settings')
django.setup()

from ProvidersAPI.models import Provider

providers_data = [
    {"name": "Sin proveedor"}
]

def populate_providers():
    for provider in providers_data:
        obj, created = Provider.objects.get_or_create(
            name=provider["name"]
        )
        if created:
            print(f"✅ Proveedor creado: {obj.name}")
        else:
            print(f"⚠️ Proveedor ya existe:  {obj.name}")

    print("\n--- Finalizado ---")
    