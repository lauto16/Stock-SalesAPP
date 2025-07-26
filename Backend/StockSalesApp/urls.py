from rest_framework.routers import DefaultRouter
from django.urls import path, include
from InventoryAPI.views import *

router_products = DefaultRouter()
router_products.register(r'products', ProductViewSet, basename='product')

router_providers = DefaultRouter()
router_providers.register(r'providers', ProductViewSet, basename='provider')

urlpatterns = [
    path('api/', include(router_products.urls)),
    path('api/', include(router_providers.urls))
]