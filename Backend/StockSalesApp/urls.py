from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from InventoryAPI.views import *
from ProvidersAPI.views import *
from BlameAPI.views import *
from AuthAPI.views import *

router_blame = DefaultRouter()
router_blame.register(r'blames', ChangeLogViewSet, basename='blame')

router_products = DefaultRouter()
router_products.register(r'products', ProductViewSet, basename='product')

router_providers = DefaultRouter()
router_providers.register(r'providers', ProviderViewSet, basename='provider')

router_offers = DefaultRouter()
router_offers.register(r'offers', OfferViewSet, basename='offer')

router_users = DefaultRouter()
router_users.register(r'login', LoginViewSet, basename='users')

urlpatterns = [
    path('api/products/search/', ProductSearchView.as_view(), name='product-search'),
    path('api/blames/search/', ChangeLogSearchViewForProducts.as_view(), name='blame-search'),
    path('api/', include(router_products.urls)),
    path('api/', include(router_providers.urls)),
    path('api/', include(router_offers.urls)),
    path('api/', include(router_users.urls)),
    path('api/', include(router_blame.urls)),
    path("api/login/", obtain_auth_token),
    path('api/logout/', LogoutView.as_view(), name='logout'),
]