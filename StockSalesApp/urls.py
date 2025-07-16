from Auth.views import auth, role_selector
from django.contrib import admin
from django.urls import path



urlpatterns = [
    #path('admin/', admin.site.urls),
    path('auth/', auth, name='auth_view'),
    path('role_selector/', role_selector, name='role_selector_view'),
]
