from InventoryAPI.models import Product
from rest_framework import serializers
from .models import Entry, EntryDetail
from django.db import transaction


class EntryDataValidator:
    """
    Helper class that contains validations for stock entries creation process.
    """

    @staticmethod
    def validate_details_present(details):
        if not details or len(details) == 0:
            raise serializers.ValidationError(
                "Un ingreso debe contener al menos un producto."
            )

    @staticmethod
    def validate_product_exists(product):
        if product is None:
            raise serializers.ValidationError("El producto no existe.")
        
        if not product.in_use:
            raise serializers.ValidationError(f"El producto {product.name} no existe.")
        
    @staticmethod
    def validate_quantity(quantity):
        if quantity is None or quantity <= 0:
            raise serializers.ValidationError(
                "La cantidad debe ser mayor a cero."
            )

    @staticmethod
    def validate_unit_price(unit_price):
        if unit_price is None or unit_price <= 0:
            raise serializers.ValidationError(
                "El precio unitario debe ser mayor a cero."
            )


class EntryDetailSerializer(serializers.ModelSerializer):
    subtotal = serializers.SerializerMethodField()
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_code = serializers.CharField(source="product.code", read_only=True)

    class Meta:
        model = EntryDetail
        fields = [
            "id",
            "entry",
            "product",
            "product_name",
            "product_code",
            "unit_price",
            "quantity",
            "subtotal",
            "applied_charge",
            "observations",
        ]
        read_only_fields = ["id", "subtotal"]

    def get_subtotal(self, obj):
        return obj.subtotal
    

class EntryDetailCreateSerializer(serializers.Serializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product'
    )
    unit_price = serializers.FloatField()
    quantity = serializers.FloatField()
    applied_charge = serializers.FloatField(default=0)
    observations = serializers.CharField(
        required=False,
        allow_blank=True,
        default="Sin observaciones"
    )


class EntryCreateSerializer(serializers.ModelSerializer):
    details = EntryDetailCreateSerializer(many=True)

    class Meta:
        model = Entry
        fields = [
            'rute_number',
            'details'
        ]

    def validate(self, data):
        details = data.get("details")

        EntryDataValidator.validate_details_present(details)

        for detail in details:
            product = detail.get("product")
            quantity = detail.get("quantity")
            unit_price = detail.get("unit_price")

            EntryDataValidator.validate_product_exists(product)
            EntryDataValidator.validate_quantity(quantity)
            EntryDataValidator.validate_unit_price(unit_price)

        return data

    @transaction.atomic
    def create(self, validated_data):
        details_data = validated_data.pop("details")
        user = self.context['request'].user if "request" in self.context else None

        entry = Entry.objects.create(
            created_by=user,
            rute_number=validated_data.get("rute_number", "0")
        )

        for detail in details_data:
            EntryDetail.objects.create(
                entry=entry,
                product=detail["product"],
                unit_price=detail["unit_price"],
                quantity=detail["quantity"],
                applied_charge=detail.get("applied_charge", 0),
                observations=detail.get("observations", "Sin observaciones")
            )

        entry.apply_entry()

        return entry


class EntrySerializer(serializers.ModelSerializer):
    """
    Serializer for entries
    """
    details = EntryDetailSerializer(many=True, read_only=True)
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = Entry
        fields = [
            "id",
            "created_at",
            "created_by",
            "created_by_username",
            "total",
            "details",
            "rute_number",
        ]
        read_only_fields = ["id", "created_at", "total"]