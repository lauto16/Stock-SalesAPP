import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'StockSalesApp.settings')
django.setup()

from Auth.models import CustomPermission

permissions_data = [
    {"code_name": "access_dashboard", "description": "El usuario puede entrar al panel de administrador"},
    {"code_name": "access_sales", "description": "El usuario puede entrar al panel de ventas"},
    {"code_name": "access_inventory", "description": "El usuario puede entrar al panel de inventario"},
    {"code_name": "access_providers", "description": "El usuario puede entrar al panel de proveedores"},
    {"code_name": "access_offers", "description": "El usuario puede entrar al panel de ofertas"},
    {"code_name": "access_blame", "description": "El usuario puede entrar al panel de registro de cambios"},
]

def populate_permissions():
    for perm in permissions_data:
        obj, created = CustomPermission.objects.get_or_create(
            code_name=perm["code_name"],
            defaults={"description": perm["description"]}
        )
        if created:
            print(f"✅ Permiso creado: {obj.code_name}")
        else:
            print(f"⚠️ Permiso ya existe: {obj.code_name}")

    print("\n--- Finalizado ---")
