import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'StockSalesApp.settings')
django.setup()

from Auth.models import CustomUser

def update_pin(new_pin: str):
    try:
        user = CustomUser.objects.first()
        if not user:
            print("ERROR: No existe ningún usuario en Auth_customuser.")
            return
        
        user.pin = new_pin
        user.save()
        print(f"PIN actualizado correctamente a {new_pin}")

    except Exception as e:
        print("ERROR al actualizar PIN:", e)


if __name__ == "__main__":
    import sys

    if len(sys.argv) != 2:
        print("USO: python update_pin.py <PIN_DE_4_DIGITOS>")
        sys.exit(1)

    pin = sys.argv[1]

    if not pin.isdigit() or len(pin) != 4:
        print("ERROR: El PIN debe ser un número de 4 dígitos.")
        sys.exit(1)

    update_pin(pin)
