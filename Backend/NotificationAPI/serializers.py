from rest_framework import serializers
from .models import ProductNotification


class ProductNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductNotification
        fields = "__all__"
        read_only_fields = ["id", "seen", "created_at"]