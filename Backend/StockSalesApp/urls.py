from rest_framework.routers import DefaultRouter
from django.urls import path, include
from InventoryAPI.views import *

router_products = DefaultRouter()
router_products.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    path('api/', include(router_products.urls))
]