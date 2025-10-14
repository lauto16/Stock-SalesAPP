import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'StockSalesApp.settings')
django.setup()

from Auth.models import Role, CustomPermission

data = {
    "Auth_role_permissions": [
        {"role_name": "administrator", "permission_code": "access_dashboard"},
        {"role_name": "administrator", "permission_code": "access_sales"},
        {"role_name": "administrator", "permission_code": "access_inventory"},
        {"role_name": "administrator", "permission_code": "access_providers"},
        {"role_name": "administrator", "permission_code": "access_offers"},
        {"role_name": "administrator", "permission_code": "access_blame"},
        {"role_name": "stocker", "permission_code": "access_inventory"},
        {"role_name": "stocker", "permission_code": "access_providers"},
        {"role_name": "salesperson", "permission_code": "access_sales"},
        {"role_name": "salesperson", "permission_code": "access_inventory"},
        {"role_name": "salesperson", "permission_code": "access_offers"},
        {"role_name": "salesperson_stocker", "permission_code": "access_sales"},
        {"role_name": "salesperson_stocker", "permission_code": "access_inventory"},
        {"role_name": "salesperson_stocker", "permission_code": "access_providers"},
        {"role_name": "salesperson_stocker", "permission_code": "access_offers"},
    ]
}

def populate_role_permissions():
    created_links = 0
    skipped_links = 0

    for entry in data["Auth_role_permissions"]:
        role_name = entry["role_name"]
        perm_code = entry["permission_code"]

        try:
            role = Role.objects.get(name=role_name)
        except Role.DoesNotExist:
            print(f"❌ Role con nombre='{role_name}' no existe. Saltando...")
            continue

        try:
            perm = CustomPermission.objects.get(code_name=perm_code)
        except CustomPermission.DoesNotExist:
            print(f"❌ CustomPermission con code_name='{perm_code}' no existe. Saltando...")
            continue

        if not role.permissions.filter(id=perm.id).exists():
            role.permissions.add(perm)
            created_links += 1
            print(f"✅ Asignado permiso '{perm.code_name}' → rol '{role.name}'")
        else:
            skipped_links += 1

    print(f"\n--- Finalizado ---")
    print(f"Permisos asignados nuevos: {created_links}")
    print(f"Permisos ya existentes: {skipped_links}")