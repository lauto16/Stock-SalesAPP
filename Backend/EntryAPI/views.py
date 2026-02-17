from rest_framework.pagination import PageNumberPagination
from rest_framework import viewsets, permissions, status
from django.db.models.functions import Greatest
from rest_framework.exceptions import NotFound
from DailyReportAPI.models import DailyReport
from rest_framework.decorators import action
from rest_framework.response import Response
from InventoryAPI.models import Product
from django.db import transaction
from django.utils import timezone
from django.db.models import F
from .serializers import (
    EntrySerializer,
    EntryCreateSerializer
)
from .models import Entry


class EntryPagination(PageNumberPagination):
    """
    Custom pagination class that standardizes the API response format.

    It envelopes the results in a structured object containing success status,
    total count, navigation links, and the actual data. It also handles
    out-of-bound page requests.
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
            self.error_response = Response(
                {"success": False, "message": "La página solicitada no existe."}
            )

    def get_paginated_response(self, data):
        """
        Constructs the final response dictionary.

        If an error occurred during pagination (like an invalid page number),
        returns the error response. Otherwise, returns the standard success
        envelope with metadata and the results list.
        """
        if hasattr(self, "error_response"):
            return self.error_response

        return Response(
            {
                "success": True,
                "count": self.page.paginator.count,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "results": data,
            }
        )


class EntryViewSet(viewsets.ModelViewSet):
    queryset = Entry.objects.all().order_by("-created_at")
    serializer_class = EntrySerializer
    pagination_class = EntryPagination
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return EntryCreateSerializer
        return EntrySerializer

    @action(detail=False, methods=["get"], url_path=r"get-by-id/(?P<id>\d+)")
    def get_by_id(self, request, id=None):
        if not id:
            return Response(
                {"error": "ID inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )

        entry = Entry.objects.prefetch_related(
            "details__product").filter(id=id).first()
        if not entry:
            return Response(
                {"error": "El ingreso no existe"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(entry)
        return Response(serializer.data)

    @action(detail=False, methods=["delete"], url_path=r"delete-by-id/(?P<id>\d+)")
    def destroy_by_id(self, request, id=None):
        """
        Deletes an entry by ID and diminishes stock for all products involved in the entry.
        """
        try:
            entry = (
                Entry.objects
                .select_related("created_by")
                .prefetch_related("details__product")
                .get(id=id)
            )
        except Entry.DoesNotExist:
            return Response(
                {"error": f"No se pudo eliminar el ingreso con ID {id}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        daily_report = DailyReport.get_or_create_today_report()
        daily_report.apply_amount(amount=entry.total, remove_loss=True)

        with transaction.atomic():
            for detail in entry.details.all():
                if detail.product and detail.product.in_use:
                    Product.objects.filter(pk=detail.product.pk).update(
                        stock=Greatest(F("stock") - detail.quantity, 0)
                    )

            entry.delete()

        return Response({"success": True}, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        with transaction.atomic():
            serializer.save(
                created_by=self.request.user,
                created_at=timezone.now()
            )
            
