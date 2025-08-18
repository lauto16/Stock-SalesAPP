from .serializers import SaleSerializer, SaleCreateSerializer
from rest_framework.pagination import PageNumberPagination
from rest_framework import viewsets, status, permissions
from rest_framework.exceptions import NotFound
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from .models import Sale

class SalePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        try:
            return super().paginate_queryset(queryset, request, view)
        except NotFound:
            self.error_response = Response({
                "success": False,
                "message": "La página solicitada no existe."
            })

    def get_paginated_response(self, data):
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
    queryset = Sale.objects.all().order_by("-created_at")
    serializer_class = SaleSerializer
    pagination_class = SalePagination
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return SaleCreateSerializer
        return SaleSerializer

    @action(detail=False, methods=["get"], url_path=r"get-by-id/(?P<id>\d+)")
    def get_by_id(self, request, id=None):
        if not id:
            return Response({"error": "ID inválido"}, status=status.HTTP_400_BAD_REQUEST)

        sale = Sale.objects.filter(id=id).first()
        if not sale:
            return Response({"error": "La venta no existe"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(sale)
        return Response(serializer.data)

    @action(detail=False, methods=["delete"], url_path=r"delete-by-id/(?P<id>\d+)")
    def destroy_by_id(self, request, id=None):
        sale = Sale.objects.filter(id=id)
        if not sale.exists():
            return Response({"error": f"No se pudo eliminar la venta con ID {id}"}, status=status.HTTP_400_BAD_REQUEST)
        
        sale.delete()
        return Response({"success": True})

    def perform_create(self, serializer):
        with transaction.atomic():
            sale = serializer.save(created_by=self.request.user, created_at=timezone.now())
            sale.finalize_sale(user=self.request.user)