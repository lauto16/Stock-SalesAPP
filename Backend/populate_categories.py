import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'StockSalesApp.settings')
django.setup()

from CategoryAPI.models import Category

categories_data = [
    {"name": "Sin categoria", "description": "Categoria por defecto para productos"}
]

def populate_categories():
    for category in categories_data:
        obj, created = Category.objects.get_or_create(
            name=category["name"]
        )
        if created:
            print(f"✅ Categoria creada: {obj.name}")
            obj.description = category["description"]
            obj.save()
        else:
            print(f"⚠️ Categoria ya existe:  {obj.name}")

    print("\n--- Finalizado ---")
    
