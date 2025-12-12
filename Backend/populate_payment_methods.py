import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'StockSalesApp.settings')
django.setup()

from PaymentMethodAPI.models import PaymentMethod

methods_data = [
    {"name": "Efectivo"},
    {"name": "QR"},
    {"name": "Tarjeta de debito"},
    {"name": "Tarjeta de credito"},
    {"name": "Transferencia"},
    {"name": "Cheque"},
]

def populate_payment_methods():
    for method in methods_data:
        obj, created = PaymentMethod.objects.get_or_create(
            name=method["name"]
        )
        if created:
            print(f"✅ Metodo de pago creado: {obj.name}")
        else:
            print(f"⚠️ Metodo de pago ya existe: {obj.name}")

    print("\n--- Finalizado ---")