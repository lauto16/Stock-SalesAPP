from rest_framework.pagination import PageNumberPagination
from rest_framework import serializers
from .models import Product, Offer
from django.utils import timezone

class ProductPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class OfferPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class ProductSerializer(serializers.ModelSerializer):
    in_offer = serializers.SerializerMethodField()
    offers_data = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "code",
            "name",
            "stock",
            "sell_price",
            "buy_price",
            "provider",
            "last_modification",
            "in_offer",
            "offers_data",
        ]
        read_only_fields = ["last_modification"]

    def get_in_offer(self, obj):
        now = timezone.now().date()
        return obj.offers.filter(end_date__gte=now).exists()

    def get_offers_data(self, obj):
        now = timezone.now().date()
        offers = obj.offers.filter(end_date__gte=now)
        return OfferSerializer(offers, many=True, context=self.context).data


class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = [
            "name",
            "percentage",
            "end_date",
            "created_at",
            "products",
        ]
        read_only_fields = ["created_at"]

