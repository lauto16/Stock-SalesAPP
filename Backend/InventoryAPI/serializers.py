from rest_framework.pagination import PageNumberPagination
from InventoryAPI.models import Provider, Category
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework import serializers
from .models import Product, Offer
from django.utils import timezone
from datetime import datetime


class ProductPagination(PageNumberPagination):
    """
    Custom paginator for Product results.

    Provides:
      - A default page size of 10 items.
      - Client-controlled page size via the `page_size` query parameter.
      - A safe maximum of 100 items per page.

    This class also intercepts invalid page requests. If the requested
    page does not exist, it stores a custom error response instead of
    raising a NotFound exception, allowing the view to return a
    consistent JSON structure.
    """
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        """
        Paginates the queryset and catches NotFound errors caused by invalid
        page numbers.

        Args:
            queryset (QuerySet): The queryset to paginate.
            request (Request): The incoming HTTP request.
            view: The view calling the paginator (optional).

        Returns:
            list | None: A list of paginated objects or None if invalid page.
        """
        try:
            return super().paginate_queryset(queryset, request, view)
        except NotFound:
            self.error_response = Response({
                "success": False,
                "error": "La página solicitada no existe."
            })

    def get_paginated_response(self, data):
        """
        Returns a JSON-formatted paginated response.

        If an invalid page was requested, the custom error response
        generated in paginate_queryset is returned instead.

        Args:
            data (list): Serialized paginated objects.

        Returns:
            Response: A DRF Response containing pagination metadata.
        """
        if hasattr(self, 'error_response'):
            return self.error_response

        return Response({
            "success": True,
            "count": self.page.paginator.count,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "results": data,
        })


class NullableDateField(serializers.DateField):
    def to_internal_value(self, value):
        try:
            return super().to_internal_value(value)
        except Exception:
            return None


class ProductSerializer(serializers.ModelSerializer):
    expiration = NullableDateField(
        required=False,
        allow_null=True,
        input_formats=["%Y-%m-%d", "%Y-%m-%dT%H:%M:%S"]
    )

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
            "category",
            "expiration",
        ]
        read_only_fields = ["last_modification"]

    def validate(self, attrs):
        """
        If provider/category are null, empty, false or missing,
        assign default objects.
        """

        provider = attrs.get("provider", None)

        if not provider:
            provider, _ = Provider.objects.get_or_create(name="Sin proveedor")
            attrs["provider"] = provider

        category = attrs.get("category", None)

        if not category:
            category, _ = Category.objects.get_or_create(name="Sin categoria")
            attrs["category"] = category

        return attrs

    def get_in_offer(self, obj):
        now = timezone.now().date()
        return obj.offers.filter(end_date__gte=now).exists()

    def get_offers_data(self, obj):
        offer = obj.get_active_discount()
        return OfferSerializer(offer, many=False, context=self.context).data


class OfferPagination(PageNumberPagination):
    """
    Pagination class for Offer results.

    Behaves similarly to ProductPagination but without a custom paginated
    response structure. Invalid pages are intercepted to produce a
    consistent error message.
    """
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        """
        Handles pagination while capturing NotFound errors caused by invalid
        page numbers.

        Args:
            queryset (QuerySet): The queryset to paginate.
            request (Request): Incoming HTTP request.
            view: The view invoking pagination.

        Returns:
            list | None: Paginated data or None if an invalid page was requested.
        """
        try:
            return super().paginate_queryset(queryset, request, view)
        except NotFound:
            self.error_response = Response({
                "success": False,
                "error": "La página solicitada no existe."
            })


class OfferSerializer(serializers.ModelSerializer):
    """
    Serializer for Offer objects.

    Serializes basic information about an offer, including name, discount
    percentage, expiration date, and related products.

    The `created_at` field is read-only.
    """

    class Meta:
        model = Offer
        fields = [
            "id",
            "name",
            "percentage",
            "end_date",
            "created_at",
            "products",
        ]
        read_only_fields = ["id", "created_at"]
