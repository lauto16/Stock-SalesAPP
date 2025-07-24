from Auth.views import auth, pin_verify
from Inventory.views import inventory
from django.contrib import admin
from django.urls import path


urlpatterns = [
    # path('admin/', admin.site.urls),
    path('auth/', auth, name='auth_view'),
    path('pin_verify/', pin_verify, name='pin_verify_view'),
    path('', pin_verify, name='pin_verify_view'),
    path('inventory/', inventory, name='inventory_view')
]
