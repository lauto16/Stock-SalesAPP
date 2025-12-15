from .serializers import SaleSerializer, SaleCreateSerializer
from rest_framework.pagination import PageNumberPagination
from rest_framework import viewsets, status, permissions
from rest_framework.exceptions import NotFound
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from rest_framework.views import APIView
from .models import Sale

class SalePagination(PageNumberPagination):
    """
    Custom pagination class that standardizes the API response format.

    It envelopes the results in a structured object containing success status,
    total count, navigation links, and the actual data. It also handles
    out-of-bound page requests gracefully.
    """
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        """
        Attempts to paginate the queryset while catching 'NotFound' exceptions.

        If the requested page is invalid (e.g., page 999 of 5), it prepares
        a custom error response instead of raising a 404 exception immediately.
        """
        try:
            return super().paginate_queryset(queryset, request, view)
        except NotFound:
            self.error_response = Response({
                "success": False,
                "message": "La página solicitada no existe."
            })

    def get_paginated_response(self, data):
        """
        Constructs the final response dictionary.

        If an error occurred during pagination (like an invalid page number),
        returns the error response. Otherwise, returns the standard success
        envelope with metadata and the results list.
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


class SaleViewSet(viewsets.ModelViewSet):
    """
    ViewSet responsible for the complete management of sales records.

    Handles listing, creating, retrieving, and deleting sales. It enforces
    authentication, applies custom pagination, and orders results by creation date.
    """
    queryset = Sale.objects.all().order_by("-created_at")
    serializer_class = SaleSerializer
    pagination_class = SalePagination
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        """
        Determines which serializer to use based on the current action.

        Returns the creation-specific serializer when making a new sale,
        and the standard read-only serializer for all other operations.
        """
        if self.action == "create":
            return SaleCreateSerializer
        return SaleSerializer

    @action(detail=False, methods=["get"], url_path=r"get-by-id/(?P<id>\d+)")
    def get_by_id(self, request, id=None):
        """
        Custom endpoint to retrieve a single sale by its numerical ID.

        Validates the ID presence and existence of the sale in the database,
        returning a 400 Bad Request if the sale is not found, or the serialized
        data if successful.
        """
        if not id:
            return Response({"error": "ID inválido"}, status=status.HTTP_400_BAD_REQUEST)

        sale = Sale.objects.filter(id=id).first()
        if not sale:
            return Response({"error": "La venta no existe"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(sale)
        return Response(serializer.data)

    @action(detail=False, methods=["delete"], url_path=r"delete-by-id/(?P<id>\d+)")
    def destroy_by_id(self, request, id=None):
        """
        Deletes a sale by ID and restores stock for all products involved in the sale.
        """
        try:
            sale = Sale.objects.select_related("created_by").prefetch_related("items__product").get(id=id)
        except Sale.DoesNotExist:
            return Response(
                {"error": f"No se pudo eliminar la venta con ID {id}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            for item in sale.items.all():
                product = item.product
                product.stock += item.quantity
                product.save(user=request.user)

            sale.delete()

        return Response({"success": True})

    def perform_create(self, serializer):
        """
        Intercepts the creation process to wrap operations in a database transaction.

        Automatically assigns the current user and timestamp to the sale,
        and triggers the 'finalize_sale' method on the model instance to
        handle post-creation business logic (like stock updates).
        """
        with transaction.atomic():
            sale = serializer.save(created_by=self.request.user, created_at=timezone.now())
            sale.finalize_sale(user=self.request.user)


class SaleSearchView(APIView):
    """
    Performs a relevance-based search across sales by date, products, or amount.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.GET.get("q", "").strip().lower()
        if not query:
            return Response([], status=status.HTTP_200_OK)

        results = []
        sales = Sale.objects.prefetch_related('items__product').all()

        for sale in sales:
            score = 0

            created_at_str = sale.created_at.strftime("%Y-%m-%d %H:%M:%S").lower() if sale.created_at else ""
            date_only = sale.created_at.strftime("%Y-%m-%d").lower() if sale.created_at else ""
            total_price_str = str(sale.total_price) if sale.total_price is not None else ""
            payment_method = str(sale.payment_method) if sale.payment_method is not None else ""
            
            if query in created_at_str:
                score += 5
                if date_only.startswith(query):
                    score += 3

            if query == date_only:
                score += 5

            if query == total_price_str:
                score += 5
                
            if query == payment_method:
                score += 5
                if payment_method.startswith(query):
                    score += 3
            
            elif query.replace('.', '').isdigit():
                try:
                    query_amount = float(query)
                    if sale.total_price:
                        price_diff = abs(sale.total_price - query_amount)
                        if price_diff <= sale.total_price * 0.1:
                            score += 2
                except ValueError:
                    pass

            for item in sale.items.all():
                product = item.product
                product_name = product.name.lower() if product.name else ""
                product_code = product.code.lower() if product.code else ""

                if query in product_name:
                    score += 4
                    if product_name.startswith(query):
                        score += 2

                if query in product_code:
                    score += 3
                    if product_code.startswith(query):
                        score += 2

            if score > 0:
                results.append((score, sale))

        # Sort by score (highest first)
        results.sort(key=lambda tup: tup[0], reverse=True)
        matched_sales = [s for _, s in results]

        serializer = SaleSerializer(matched_sales, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)