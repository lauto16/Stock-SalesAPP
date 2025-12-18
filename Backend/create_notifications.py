def create_expiration_notifications(limit: int):
    """
    Creates one notification for each product next to expire
    limit: int -> days from now to consider a product close to expiration
    """
    import os
    import sys
    import django
    from datetime import timedelta
    from django.utils import timezone

    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend"))
    sys.path.append(BASE_DIR)

    os.environ.setdefault(
        "DJANGO_SETTINGS_MODULE",
        "StockSalesApp.settings"
    )

    django.setup()

    from NotificationAPI.models import Notification
    from InventoryAPI.models import Product

    now = timezone.now()
    limit_date = now + timedelta(days=limit)

    products = Product.objects.filter(
        stock__gt=0,
        expiration__isnull=False,
        expiration__gte=now,
        expiration__lte=limit_date
    )

    for product in products:
        Notification.objects.create(
            name="Vencimiento próximo",
            subject="EXP",
            text=f"El producto {product.name} vencerá pronto.",
        )