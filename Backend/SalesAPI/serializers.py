from rest_framework import serializers
from .models import Sale, SaleItem
from InventoryAPI.serializers import ProductSerializer
from InventoryAPI.models import Product

class SaleItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product', write_only=True)

    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_id', 'quantity', 'unit_price', 'discount_percentage', 'subtotal']

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)
    created_by = serializers.StringRelatedField()

    class Meta:
        model = Sale
        fields = [
            'id', 'applied_discount_percentage', 'discount_reason', 'initial_price', 'total_price',
            'tax_percentage', 'created_at', 'created_by', 'items'
        ]

class SaleCreateSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)

    class Meta:
        model = Sale
        fields = [
            'applied_discount_percentage', 'discount_reason', 'initial_price', 'total_price',
            'tax_percentage', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        sale = Sale.objects.create(**validated_data)
        for item_data in items_data:
            SaleItem.objects.create(sale=sale, **item_data)
        return sale