import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'StockSalesApp.settings')
django.setup()

from Auth.models import Role

roles_data = [
    {"name": "administrator", "name_sp": "Administrador"},
    {"name": "stocker", "name_sp": "Repositor"},
    {"name": "salesperson", "name_sp": "Vendedor"},
    {"name": "salesperson_stocker", "name_sp": "Vendedor y Repositor"},
]

def populate_roles():
    for role in roles_data:
        obj, created = Role.objects.get_or_create(
            name=role["name"],
            defaults={"name_sp": role["name_sp"]}
        )
        if created:
            print(f"✅ Rol creado: {obj.name}")
        else:
            print(f"⚠️ Rol ya existe: {obj.name}")

    print("\n--- Finalizado ---")