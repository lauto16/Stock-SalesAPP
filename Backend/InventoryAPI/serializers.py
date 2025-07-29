from rest_framework.pagination import PageNumberPagination
from rest_framework import serializers
from .models import Product

class ProductPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['code', 'name', 'stock', 'sell_price', 'buy_price',
                  'provider', 'last_modification']
        read_only_fields = ['last_modification']