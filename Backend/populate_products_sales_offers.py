import os
import django
import random
from faker import Faker
from datetime import datetime, timedelta

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "StockSalesApp.settings")
django.setup()

from InventoryAPI.models import Product, Offer
from SalesAPI.models import Sale, SaleItem
from ProvidersAPI.models import Provider
from Auth.models import CustomUser

fake = Faker()

def create_providers(n=100):
    providers = []
    for _ in range(n):
        name = fake.unique.company()
        providers.append(Provider(name=name))
    Provider.objects.bulk_create(providers)
    print(f"✅ {n} proveedores creados.")

def create_products(n=200):
    providers = list(Provider.objects.all())
    products = []
    for _ in range(n):
        code = fake.unique.bothify(text="??-###")
        name = fake.unique.word().capitalize() + " " + fake.word().capitalize()
        stock = random.randint(0, 100)
        buy_price = round(random.uniform(1000, 10000), 2)
        sell_price = round(buy_price * random.uniform(1.1, 1.5), 2)
        provider = random.choice(providers)
        last_mod = datetime.now().date() - timedelta(days=random.randint(0, 365))
        products.append(Product(
            code=code,
            name=name,
            stock=stock,
            sell_price=sell_price,
            buy_price=buy_price,
            provider=provider,
            last_modification=last_mod
        ))
    created = Product.objects.bulk_create(products)
    print(f"✅ {n} productos creados.")
    return created

def create_sales(n=400, extra_products=None):
    products = list(Product.objects.all())
    if extra_products:
        products.extend(extra_products)
    users = list(CustomUser.objects.all())

    current_year = datetime.now().year

    for _ in range(n):
        discount_percentage = round(random.uniform(0, 20), 2)
        discount_reason = fake.sentence(nb_words=4) if discount_percentage > 0 else ""
        tax_percentage = 21.0
        created_by = random.choice(users) if users else None

        # ✅ Fecha distribuida a lo largo del año actual
        month = random.randint(1, 12)
        day = random.randint(1, 28)
        created_at = datetime(
            current_year, month, day,
            random.randint(0, 23),
            random.randint(0, 59),
            random.randint(0, 59)
        )

        sale = Sale.objects.create(
            applied_discount_percentage=discount_percentage,
            discount_reason=discount_reason,
            tax_percentage=tax_percentage,
            created_by=created_by,
            created_at=created_at
        )

        # ✅ Items asociados
        items_count = random.randint(1, 5)
        selected_products = random.sample(products, items_count)

        for product in selected_products:
            quantity = random.randint(1, 10)
            unit_price = product.sell_price
            item_discount = round(random.uniform(0, 15), 2)

            SaleItem.objects.create(
                sale=sale,
                product=product,
                quantity=quantity,
                unit_price=unit_price,
                discount_percentage=item_discount
            )

        sale.finalize_sale(user=created_by)

    print(f"✅ {n} ventas distribuidas en todos los meses del año creadas.")

def create_offers(n=50):
    products = list(Product.objects.all())
    offers = []
    for _ in range(n):
        name = fake.unique.word().capitalize() + " Offer"
        percentage = round(random.uniform(5, 50), 2)
        end_date = datetime.now().date() + timedelta(days=random.randint(1, 90))
        offer = Offer(name=name, percentage=percentage, end_date=end_date)
        offer.save()
        linked_products = random.sample(products, random.randint(1, 10))
        offer.products.set(linked_products)
        offer.save()
    print(f"✅ {n} ofertas creadas.")


if __name__ == "__main__":
    # ✅ Crear proveedores si no hay suficientes
    if Provider.objects.count() < 100:
        create_providers(100)
    else:
        print("🔁 Ya hay 100 o más proveedores, no se crean nuevos.")

    # ✅ Crear productos si faltan
    new_products = []
    if Product.objects.count() < 200:
        new_products = create_products(200)
    else:
        print("🔁 Ya hay 200 o más productos, no se crean nuevos.")

    # ⚡ SIEMPRE CREA MÁS VENTAS (aunque ya haya muchas)
    create_sales(400, extra_products=new_products)

    # ✅ Crear ofertas si faltan
    if Offer.objects.count() < 50:
        create_offers(50)
    else:
        print("🔁 Ya hay 50 o más ofertas, no se crean nuevas.")
