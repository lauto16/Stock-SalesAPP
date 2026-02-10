from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework import serializers
from .models import Entry, EntryDetail

class EntryPagination(PageNumberPagination):
    """
    Pagination class for Entry results.
    """

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        try:
            return super().paginate_queryset(queryset, request, view)
        except NotFound:
            self.error_response = Response({
                "success": False,
                "error": "La página solicitada no existe."
            })


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