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
from PaymentMethodAPI.models import PaymentMethod
from Auth.models import CustomUser
from CategoryAPI.models import Category

fake = Faker()

# -------------------------------------------------
# Providers
# -------------------------------------------------

def create_providers(n=100):
    providers = []
    for _ in range(n):
        providers.append(
            Provider(
                name=fake.unique.company(),
                phone=fake.phone_number(),
                address=fake.address(),
                email=fake.email()
            )
        )
    Provider.objects.bulk_create(providers)
    print(f"✅ {n} proveedores creados.")


# -------------------------------------------------
# Products
# -------------------------------------------------

def create_products(n=200):
    providers = list(Provider.objects.all())
    categories = list(Category.objects.all())

    products = []
    for _ in range(n):
        products.append(
            Product(
                code=fake.unique.bothify(text="??-###"),
                name=fake.word().capitalize() + " " + fake.word().capitalize(),
                stock=random.randint(0, 100),
                buy_price=round(random.uniform(1000, 10000), 2),
                sell_price=round(random.uniform(1200, 15000), 2),
                provider=random.choice(providers) if providers else None,
                category=random.choice(categories) if categories else None,
            )
        )

    created = Product.objects.bulk_create(products)
    print(f"✅ {n} productos creados.")
    return created


# -------------------------------------------------
# Sales + SaleItems
# -------------------------------------------------

def create_sales(n=400, extra_products=None):
    products = list(Product.objects.all())
    if extra_products:
        products.extend(extra_products)

    users = list(CustomUser.objects.all())
    payment_methods = list(PaymentMethod.objects.all())

    if not payment_methods:
        print("❌ No hay PaymentMethod creados. Abortando ventas.")
        return

    current_year = datetime.now().year

    for _ in range(n):
        applied_charge = round(random.uniform(0, 15), 2)
        charge_reason = fake.sentence(nb_words=4) if applied_charge > 0 else ""
        created_by = random.choice(users) if users else None
        payment_method = random.choice(payment_methods)

        # 👉 Crear venta primero
        sale = Sale.objects.create(
            applied_charge_percentage=applied_charge,
            charge_reason=charge_reason,
            created_by=created_by,
            payment_method=payment_method
        )

        # 👉 Forzar fecha distribuida en el año
        random_date = datetime(
            current_year,
            random.randint(1, 12),
            random.randint(1, 28),
            random.randint(0, 23),
            random.randint(0, 59),
            random.randint(0, 59)
        )

        Sale.objects.filter(pk=sale.pk).update(created_at=random_date)
        sale.refresh_from_db()

        # 👉 Items
        items_count = random.randint(1, 5)
        selected_products = random.sample(products, items_count)

        for product in selected_products:
            SaleItem.objects.create(
                sale=sale,
                product=product,
                quantity=random.randint(1, 10),
                unit_price=product.sell_price,
                charge_percentage=round(random.uniform(0, 10), 2),
            )

        sale.finalize_sale(user=created_by)

    print(f"✅ {n} ventas creadas y distribuidas en el año.")


# -------------------------------------------------
# Offers
# -------------------------------------------------

def create_offers(n=50):
    products = list(Product.objects.all())
    offers = []

    for _ in range(n):
        offer = Offer.objects.create(
            name=fake.unique.word().capitalize() + " Offer",
            percentage=round(random.uniform(5, 50), 2),
            end_date=datetime.now().date() + timedelta(days=random.randint(1, 90)),
        )

        linked_products = random.sample(products, random.randint(1, 10))
        offer.products.set(linked_products)
        offers.append(offer)

    print(f"✅ {n} ofertas creadas.")


# -------------------------------------------------
# Main
# -------------------------------------------------

if __name__ == "__main__":

    if Provider.objects.count() < 100:
        create_providers(100)
    else:
        print("🔁 Ya hay suficientes proveedores.")

    new_products = []
    if Product.objects.count() < 200:
        new_products = create_products(200)
    else:
        print("🔁 Ya hay suficientes productos.")

    # ⚡ siempre crea ventas
    create_sales(400, extra_products=new_products)

    if Offer.objects.count() < 50:
        create_offers(50)
    else:
        print("🔁 Ya hay suficientes ofertas.")