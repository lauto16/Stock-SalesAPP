from rest_framework.routers import DefaultRouter
from django.urls import path, include
from InventoryAPI.views import *
from ProvidersAPI.views import *

router_products = DefaultRouter()
router_products.register(r'products', ProductViewSet, basename='product')

router_providers = DefaultRouter()
router_providers.register(r'providers', ProviderViewSet, basename='provider')

urlpatterns = [
    path('api/products/search/', ProductSearchView.as_view(), name='product-search'), 
    path('api/', include(router_products.urls)),
    path('api/', include(router_providers.urls)),
]