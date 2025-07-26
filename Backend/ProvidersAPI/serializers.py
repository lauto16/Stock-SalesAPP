from rest_framework import serializers
from .models import Provider


class ProviderSerializer(serializers.ModelSerializer):
    """
    Provider serializer for API
    """
    
    class Meta:
        model = Provider
        fields = ['name']