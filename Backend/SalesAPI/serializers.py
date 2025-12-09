from rest_framework import serializers
from .models import Sale, SaleItem
from InventoryAPI.serializers import ProductSerializer
from InventoryAPI.models import Product

class SaleItemSerializer(serializers.ModelSerializer):
    """
    Serializer for individual items within a sale.

    Manages the detailed product representation for reading purposes and 
    allows product assignment via its ID for writing purposes.
    """
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product', write_only=True)

    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_id', 'quantity', 'unit_price', 'discount_percentage', 'subtotal']

class SaleSerializer(serializers.ModelSerializer):
    """
    Serializer designed for viewing and retrieving sales data.

    Includes a read-only nested list of associated items and the string 
    representation of the user who created the sale.
    """
    items = SaleItemSerializer(many=True, read_only=True)
    created_by = serializers.StringRelatedField()

    class Meta:
        model = Sale
        fields = [
            'id', 'applied_discount_percentage', 'discount_reason', 'initial_price', 'total_price',
            'tax_percentage', 'created_at', 'created_by', 'items'
        ]

class SaleCreateSerializer(serializers.ModelSerializer):
    """
    Serializer specifically for the process of creating new sales.

    Supports nested writing, accepting a list of items along with the 
    main sale data to process them together in a single request.
    """
    items = SaleItemSerializer(many=True)

    class Meta:
        model = Sale
        fields = [
            'applied_discount_percentage', 'discount_reason', 'initial_price', 'total_price',
            'tax_percentage', 'items'
        ]

    def create(self, validated_data):
        """
        Overrides the creation method to handle nested model insertion.

        Separates item data from sale data, creates the main sale instance, 
        and subsequently iterates to create and link each item to that sale.
        """
        items_data = validated_data.pop('items')
        sale = Sale.objects.create(**validated_data)
        for item_data in items_data:
            SaleItem.objects.create(sale=sale, **item_data)
        return sale