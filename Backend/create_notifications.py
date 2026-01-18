def delete_old_products_notifications(months: int = 1):
    """
    Deletes notifications with created_at older than the given number of months.
    Default: deletes notifications from 1 month ago or older.
    """
    import os
    import sys
    import django
    from datetime import timedelta
    from django.utils import timezone

    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../Backend"))
    sys.path.append(BASE_DIR)

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "StockSalesApp.settings")
    django.setup()

    from NotificationAPI.models import ProductNotification

    cutoff_date = timezone.now() - timedelta(days=30 * months)

    ProductNotification.objects.filter(
        created_at__lte=cutoff_date,
        seen=True
    ).delete()


def can_create_product_notification(
    *,
    product,
    subject: str,
    cooldown_days: int = 7,
):
    """
    Returns True if a ProductNotification can be created for the given
    product + subject based on a cooldown window.
    """
    from datetime import timedelta
    from django.utils import timezone
    from NotificationAPI.models import ProductNotification

    cutoff_date = timezone.now() - timedelta(days=cooldown_days)

    return not ProductNotification.objects.filter(
        product=product,
        subject=subject,
        created_at__gte=cutoff_date,
    ).exists()


def create_best_sellers_products_low_stock_notification(stock_limit: int):
    """
    Creates one notification for each product with both:
    1) stock <= stock_limit
    2) is in the top 15 best sellers products

    Notifications are NOT duplicated unless 7 days have passed.
    """
    import os
    import sys
    import django

    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../Backend"))
    sys.path.append(BASE_DIR)

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "StockSalesApp.settings")
    django.setup()

    from NotificationAPI.models import ProductNotification
    from StatsAPI.views import SalesStatsViewSet
    from InventoryAPI.models import Product

    viewset = SalesStatsViewSet()
    best_selling_products = viewset.calculate_best_selling_products(
        period="all",
        count=15,
    )

    for product_data in best_selling_products:
        try:
            product = Product.objects.get(code=product_data["product__code"])
        except Product.DoesNotExist:
            print(
                f'\033[91mError: producto con código {product_data["product__code"]} no existe.\033[0m'
            )
            continue
        except Exception as e:
            print(f"\033[91m{e}\033[0m")
            continue

        if product.stock > stock_limit:
            continue

        # NO_STOCK
        if product.stock < 0.2:
            if can_create_product_notification(
                product=product,
                subject="NO_STOCK",
            ):
                ProductNotification.objects.create(
                    product=product,
                    name="Sin stock de producto exitoso",
                    subject="NO_STOCK",
                    text=f'El producto "{product.name}" es de los más vendidos y no tenés stock.',
                )
            continue

        # STOCK
        if can_create_product_notification(
            product=product,
            subject="STOCK",
        ):
            ProductNotification.objects.create(
                product=product,
                name="Stock bajo de producto exitoso",
                subject="STOCK",
                text=(
                    f'El producto "{product.name}" es de los más vendidos '
                    f'y te queda poco stock ({product.stock}).'
                ),
            )


def create_product_expiration_notifications(limit: int):
    """
    Creates notifications for products:
    - EXP: close to expiration
    - EXPIRED: already expired

    Notifications are NOT duplicated unless 7 days have passed.
    limit: days from now to consider a product close to expiration
    """
    import os
    import sys
    import django
    from datetime import timedelta
    from django.utils import timezone

    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../Backend"))
    sys.path.append(BASE_DIR)

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "StockSalesApp.settings")
    django.setup()

    from NotificationAPI.models import ProductNotification
    from InventoryAPI.models import Product

    now = timezone.now().date()
    limit_date = now + timedelta(days=limit)

    # EXPIRED
    expired_products = Product.objects.filter(
        stock__gt=0,
        expiration__isnull=False,
        expiration__lt=now,
    )

    for product in expired_products:
        if can_create_product_notification(
            product=product,
            subject="EXPIRED",
        ):
            ProductNotification.objects.create(
                product=product,
                name="Producto vencido",
                subject="EXPIRED",
                text=f'Puedes tener unidades vencidas del producto "{product.name}".',
            )

    # EXP
    expiring_products = Product.objects.filter(
        stock__gt=0,
        expiration__isnull=False,
        expiration__gte=now,
        expiration__lte=limit_date,
    )

    for product in expiring_products:
        if can_create_product_notification(
            product=product,
            subject="EXP",
        ):
            ProductNotification.objects.create(
                product=product,
                name="Vencimiento próximo",
                subject="EXP",
                text=f'Puedes tener unidades que vencerán pronto del producto "{product.name}".',
            )