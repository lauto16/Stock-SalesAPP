from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    """
    Product serializer for API
    """
    
    class Meta:
        model = Product
        fields = ['code', 'name', 'stock', 'sell_price', 'buy_price',
                  'provider', 'last_modification']
        read_only_fields = ['last_modification']