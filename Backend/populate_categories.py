import os
import sys
import django
import random

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configurar settings correctamente
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "StockSalesApp.settings")

django.setup()

# Importar modelos
from ProvidersAPI.models import Provider
from InventoryAPI.models import Product 
from CategoryAPI.models import Category


# 📌 Categorías predefinidas para kiosco
DEFAULT_CATEGORIES = [
    ("Bebidas", "Bebidas frías y calientes"),
    ("Golosinas", "Chocolates, caramelos y dulces"),
    ("Snacks", "Papas fritas, palitos, maní, etc."),
    ("Cigarrillos", "Cigarrillos y tabaco"),
    ("Limpieza", "Artículos de limpieza del hogar"),
    ("Librería", "Útiles escolares y de oficina"),
    ("Lácteos", "Leche, yogures, postres"),
    ("Panificados", "Pan, facturas, galletitas"),
    ("Almacén", "Enlatados, pastas, harinas, aceites"),
    ("Bebidas Alcohólicas", "Vinos, cervezas, aperitivos"),
    ("Helados", "Postres helados y palitos"),
]


def create_categories():
    print("🗑 Borrando categorías existentes...")
    Category.objects.all().delete()

    print("📌 Creando categorías predefinidas...")

    categories = [
        Category(name=name, description=desc)
        for name, desc in DEFAULT_CATEGORIES
    ]

    Category.objects.bulk_create(categories)

    print(f"✅ {len(categories)} categorías creadas con éxito.")


def assign_categories_to_products():
    categories = list(Category.objects.all())
    products = Product.objects.all()

    if not categories:
        print("⚠ No hay categorías para asignar.")
        return

    print("🔗 Asignando categorías aleatorias a productos...")

    for product in products:
        product.category = random.choice(categories)
        product.save()

    print(f"✅ {products.count()} productos actualizados con categoría.")


if __name__ == "__main__":
    create_categories()
    assign_categories_to_products()  # ❗ Si NO querés asignarlas, comentá esta línea
