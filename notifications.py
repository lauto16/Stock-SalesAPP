from Backend.create_notifications import (
    delete_old_products_notifications,
    create_product_expiration_notifications,
    create_best_sellers_products_low_stock_notification,
)
import time


def run_notifications():
    print("Ejecutando notificaciones...")
    try:
        delete_old_products_notifications(months=1)
        create_product_expiration_notifications(limit=5)
        create_best_sellers_products_low_stock_notification(stock_limit=5)
        print("Notificaciones generadas correctamente.")
    except Exception as e:
        print("Error ejecutando notificaciones:", e)


def notification_scheduler(interval_seconds=3600):
    while True:
        try:
            time.sleep(interval_seconds)
            run_notifications()
        except Exception as e:
            print("Scheduler error:", e)
