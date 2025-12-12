from rest_framework import serializers
from .models import PayMethod

class PayMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayMethod
        fields = "__all__"