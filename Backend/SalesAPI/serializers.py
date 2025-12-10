from InventoryAPI.serializers import ProductSerializer
from rest_framework import serializers
from InventoryAPI.models import Product
from .models import Sale, SaleItem
from django.db import transaction

class SaleDataValidator:
    """
    Contains validation methods for input data when creating a sale.
    Each validation method raises serializers.ValidationError on failure.
    """

    @staticmethod
    def validate_items_present(items):
        if not items or len(items) == 0:
            raise serializers.ValidationError("Una venta debe contener al menos un producto.")

    @staticmethod
    def validate_item_product_exists(product):
        if product is None:
            raise serializers.ValidationError("El producto no existe")

    @staticmethod
    def validate_item_quantity(quantity):
        if quantity is None or quantity <= 0:
            raise serializers.ValidationError("La cantidad a vender debe ser mayor a cero")

    @staticmethod
    def validate_stock_availability(product, quantity):
        if quantity > product.stock:
            raise serializers.ValidationError(
                f"Stock insuficiente para el producto '{product.name}'. Disponible: {product.stock}."
            )
        
        
class SaleItemSerializer(serializers.ModelSerializer):
    """
    Serializer for individual items within a sale.

    Manages the detailed product representation for reading purposes and 
    allows product assignment via its ID for writing purposes.
    """
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True
    )

    class Meta:
        model = SaleItem
        fields = [
            'id', 'product', 'product_id', 'quantity',
            'unit_price', 'discount_percentage', 'subtotal'
        ]
        read_only_fields = ['unit_price', 'discount_percentage', 'subtotal']


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

class SaleItemCreateSerializer(serializers.Serializer):
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField()
    discount_percentage = serializers.FloatField(default=0)


class SaleCreateSerializer(serializers.ModelSerializer):
    items = SaleItemCreateSerializer(many=True)

    class Meta:
        model = Sale
        fields = [
            'applied_discount_percentage',
            'discount_reason',
            'tax_percentage',
            'items',
        ]

    def validate(self, data):
        items = data.get("items")

        SaleDataValidator.validate_items_present(items)

        for item in items:
            product = item['product_id']
            qty = item['quantity']
            discount = item['discount_percentage']

            SaleDataValidator.validate_item_product_exists(product)
            SaleDataValidator.validate_item_quantity(qty)
            SaleDataValidator.validate_stock_availability(product, qty)

        return data

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")
        user = self.context['request'].user if "request" in self.context else None

        sale = Sale.objects.create(
            applied_discount_percentage=validated_data["applied_discount_percentage"],
            discount_reason=validated_data.get("discount_reason", ""),
            tax_percentage=validated_data["tax_percentage"],
            created_by=user
        )

        for item in items_data:
            product = item["product_id"]
            quantity = item["quantity"]
            discount = item["discount_percentage"]

            SaleItem.objects.create(
                sale=sale,
                product=product,
                quantity=quantity,
                unit_price=product.sell_price,
                discount_percentage=discount,
            )

        sale.finalize_sale(user=user)

        return sale