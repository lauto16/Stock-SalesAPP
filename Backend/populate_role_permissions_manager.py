import os
import django

"""
Script to populate the Role, CustomPermission & Role - CustomPermission tables
"""

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'StockSalesApp.settings')
django.setup()

from populate_permissions import populate_permissions
from populate_roles import populate_roles
from populate_role_permissions import populate_role_permissions
from populate_pay_methods import populate_pay_methods
def run_all():
    
    print("\n=== CREANDO ROLES ===")
    populate_roles()
    
    print("\n=== CREANDO PERMISOS ===")
    populate_permissions()
    
    print("\n=== CREANDO METODOS DE PAGO ===")
    populate_pay_methods()

    print("\n=== ASIGNANDO PERMISOS A ROLES ===")
    populate_role_permissions()

    print("\n=== PROCESO COMPLETO FINALIZADO ===")

if __name__ == "__main__":
    run_all()
