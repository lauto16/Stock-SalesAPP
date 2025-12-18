from rest_framework import serializers
from InventoryAPI.models import Product
from .models import Provider


class ProviderSerializer(serializers.ModelSerializer):
    """
    Provider serializer for API
    """
    products = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Product.objects.all(),
        required=False
    )

    class Meta:
        model = Provider
        fields = [
            "id",
            "name",
            "address",
            "phone",
            "email",
            "products",
        ]
