def delete_old_notifications(months: int = 1):
    """
    Deletes notifications with created_at older than the given number of months.
    Default: deletes notifications from 1 month ago or older.
    """
    import os
    import sys
    import django
    from datetime import timedelta
    from django.utils import timezone

    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend"))
    sys.path.append(BASE_DIR)

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "StockSalesApp.settings")
    django.setup()

    from NotificationAPI.models import Notification

    cutoff_date = timezone.now() - timedelta(days=30 * months)

    deleted_count, _ = Notification.objects.filter(created_at__lte=cutoff_date, seen=True).delete()


def create_best_sellers_low_stock_notification(stock_limit: int):
    """
    Creates one notification for each product with the both of the next:
    1) stock <= stock_limit
    2) is in the top 15 best sellers products
    """
    import os
    import sys
    import django
    from datetime import timedelta
    from django.utils import timezone

    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend"))
    sys.path.append(BASE_DIR)

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "StockSalesApp.settings")

    django.setup()

    from NotificationAPI.models import Notification
    from StatsAPI.views import SalesStatsViewSet
    from InventoryAPI.models import Product

    viewset = SalesStatsViewSet()
    best_selling_products = viewset.calculate_best_selling_products(
        period="all", count=15
    )
    products_to_notify = []

    for product_data in best_selling_products:
        try:
            product = Product.objects.get(code=product_data["product__code"])
            if product.stock <= stock_limit:
                products_to_notify.append(product)
        except Product.DoesNotExist:
            print(
                f'\033[91mError al crear la notificacion: El producto con codigo: {product_data["product__code"]} no existe.\033[0m'
            )
        except Exception as e:
            print(f"\033[91m{e}\033[0m")

    for product_to_notify in products_to_notify:
        # using 0.2 as an arbitrary value to determine how low can the product's stock be until its "empty"
        if product_to_notify.stock < 0.2:
            Notification.objects.create(
                name="Sin stock de producto exitoso",
                subject="NO_STOCK",
                text=f'El producto "{product_to_notify.name}" es de los más vendidos y no tenés stock.',
            )
            continue

        Notification.objects.create(
            name="Stock bajo de producto exitoso",
            subject="STOCK",
            text=f'El producto "{product_to_notify.name}" es de los más vendidos y te queda poco stock ({product_to_notify.stock}).',
        )


def create_expiration_notifications(limit: int):
    """
    Creates notifications for products:
    - EXP: close to expiration
    - EXPIRED: already expired
    limit: days from now to consider a product close to expiration
    """
    import os
    import sys
    import django
    from datetime import timedelta
    from django.utils import timezone

    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend"))
    sys.path.append(BASE_DIR)

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "StockSalesApp.settings")
    django.setup()

    from NotificationAPI.models import Notification
    from InventoryAPI.models import Product

    now = timezone.now().date()
    limit_date = now + timedelta(days=limit)

    expired_products = Product.objects.filter(
        stock__gt=0,
        expiration__isnull=False,
        expiration__lt=now,
    )

    for product in expired_products:
        Notification.objects.create(
            name="Producto vencido",
            subject="EXPIRED",
            text=f'Puedes tener unidades vencidas del producto "{product.name}".',
        )

    expiring_products = Product.objects.filter(
        stock__gt=0,
        expiration__isnull=False,
        expiration__gte=now,
        expiration__lte=limit_date,
    )

    for product in expiring_products:
        Notification.objects.create(
            name="Vencimiento próximo",
            subject="EXP",
            text=f'Puedes tener unidades que vencerán pronto del producto "{product.name}".',
        )
