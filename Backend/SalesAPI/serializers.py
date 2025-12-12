from InventoryAPI.serializers import ProductSerializer
from PaymentMethodAPI.models import PaymentMethod
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
            'unit_price', 'charge_percentage', 'subtotal'
        ]
        read_only_fields = ['unit_price', 'charge_percentage', 'subtotal']


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
            'id', 'applied_charge_percentage', 'charge_reason', 'initial_price', 'total_price', 'created_at', 'created_by', 'items', 'pay_method'
        ]


class SaleItemCreateSerializer(serializers.Serializer):
    """Represents the data required to create a single sale item."""
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField()
    charge_percentage = serializers.FloatField(default=0)


class SaleCreateSerializer(serializers.ModelSerializer):
    """
    Handles the creation of a complete sale including all associated items.
    """
    items = SaleItemCreateSerializer(many=True)

    class Meta:
        model = Sale
        fields = [
            'applied_charge_percentage',
            'charge_reason',
            'items',
            'pay_method'
        ]

    def validate(self, data):
        items = data.get("items")

        SaleDataValidator.validate_items_present(items)

        for item in items:
            product = item['product_id']
            qty = item['quantity']
            SaleDataValidator.validate_item_product_exists(product)
            SaleDataValidator.validate_item_quantity(qty)
            SaleDataValidator.validate_stock_availability(product, qty)

        return data

    @transaction.atomic
    def create(self, validated_data):
        """
        Re-implements the creation method, this is because creating a sales is way
        more complex than simply adding some registries to a DB
        """
        items_data = validated_data.pop("items")
        user = self.context['request'].user if "request" in self.context else None

        pay_method = PayMethod.objects.get_or_create(name=validated_data.get("pay_method", "Efectivo"))
    
        sale = Sale.objects.create(
            applied_charge_percentage=validated_data["applied_charge_percentage"],
            charge_reason=validated_data.get("charge_reason", ""),
            created_by=user,
            pay_method=pay_method
        )

        for item in items_data:
            product = item["product_id"]
            quantity = item["quantity"]
            charge = item["charge_percentage"]

            SaleItem.objects.create(
                sale=sale,
                product=product,
                quantity=quantity,
                unit_price=product.sell_price,
                charge_percentage=charge,
            )

        return sale