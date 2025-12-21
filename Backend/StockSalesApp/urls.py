from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from PaymentMethodAPI.views import *
from NotificationAPI.views import *
from InventoryAPI.views import *
from ProvidersAPI.views import *
from CategoryAPI.views import *
from BlameAPI.views import *
from SalesAPI.views import *
from StatsAPI.views import *
from AuthAPI.views import *
from Testing.views import *



router_blame = DefaultRouter()
router_blame.register(r'blames', ChangeLogViewSet, basename='blame')

router_products = DefaultRouter()
router_products.register(r'products', ProductViewSet, basename='product')

router_providers = DefaultRouter()
router_providers.register(r'providers', ProviderViewSet, basename='provider')

router_offers = DefaultRouter()
router_offers.register(r'offers', OfferViewSet, basename='offer')

router_users = DefaultRouter()
router_users.register(r'login', LoginViewSet, basename='user')

router_signup = DefaultRouter()
router_signup.register(r'signup', SignupViewSet, basename='signup')

router_sales = DefaultRouter()
router_sales.register(r'sales', SaleViewSet, basename='sale')

router_sales_stats = DefaultRouter()
router_sales_stats.register(r'sales_stats', SalesStatsViewSet, basename='sale_stat')

router_employees_stats = DefaultRouter()
router_employees_stats.register(r'employees_stats', EmployeesStatsViewSet, basename='employee_stat')

router_products_stats = DefaultRouter()
router_products_stats.register(r'products_stats', ProductsStatsViewSet, basename='product_stat')

router_users_admin_functions = DefaultRouter()
router_users_admin_functions.register(r'admin-user-functions', UserViewSet, basename='admin-user-function')

router_payment_methods = DefaultRouter()
router_payment_methods.register(r'payment-methods', PaymentMethodViewSet, basename='payment-method')

router_categories = DefaultRouter()
router_categories.register(r'categories', CategoryViewSet, basename='category')

router_notifications = DefaultRouter()
router_notifications.register(r'notifications', ProductNotificationViewSet, basename='notification')

urlpatterns = [
    path('api/sales_download_excel/', sale_download_excel, name='sale_download_excel'),
    path('api/products/search/', ProductSearchView.as_view(), name='product-search'),
    path('api/sales/search/', SaleSearchView.as_view(), name='sale-search'),
    path('api/blames/search/', ChangeLogSearchViewForProducts.as_view(), name='blame-search'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('tests/sales_test', test_sales, name='test_sales'),
    path('api/', include(router_products.urls)),
    path('api/', include(router_providers.urls)),
    path('api/', include(router_offers.urls)),
    path('api/', include(router_users.urls)),
    path('api/', include(router_blame.urls)),
    path('api/', include(router_signup.urls)),
    path('api/', include(router_sales.urls)),
    path('api/', include(router_sales_stats.urls)),
    path('api/', include(router_employees_stats.urls)),
    path('api/', include(router_products_stats.urls)),
    path('api/', include(router_payment_methods.urls)),
    path('api/', include(router_categories.urls)),
    path('api/', include(router_users_admin_functions.urls)),
    path('api/', include(router_notifications.urls)),
    path('api/login/', obtain_auth_token),

]

from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)