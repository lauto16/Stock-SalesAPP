from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from .models import Entry, EntryDetail
from django.db import transaction
from .serializers import (
    EntrySerializer,
    EntryDetailSerializer,
    EntryPagination
)


class EntryViewSet(viewsets.ModelViewSet):
    """
    CRUD for Entry
    """
    queryset = Entry.objects.all().order_by("-created_at")
    serializer_class = EntrySerializer
    pagination_class = EntryPagination

    def perform_create(self, serializer):
        """
        Automatically assigns the logged-in user.
        """
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def apply(self, request, pk=None):
        """
        Applies the entry (updates stock + calculates total)
        """
        entry = self.get_object()

        with transaction.atomic():
            entry.apply_entry()

        return Response(
            {"success": True, "total": entry.total},
            status=status.HTTP_200_OK
        )
    @action(detail=False, methods=["delete"], url_path=r"delete-by-id/(?P<id>\d+)")
    def destroy_by_id(self, request, id=None):
            """
            Deletes an Entry by ID and restores stock for all products involved in the sale.
            """
            try:
                entry = (
                    Entry.objects.select_related("created_by")
                    .prefetch_related("details__product")
                    .get(id=id)
                )
            except Entry.DoesNotExist:
                return Response(
                    {"error": f"No se pudo eliminar la erntrada con ID {id}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            #Falta encontrar la relacion, buscar en cada detalle, cual es el de la entrada
            #  Entry 1--> 1* EntryDetail 
            with transaction.atomic():
                for item in Entry.details.all():
                    product = item.product
                    product.stock -= item.quantity
                    product.save(user=request.user)
                entry.delete()

            return Response({"success": True})
class EntryDetailViewSet(viewsets.ModelViewSet):
    """
    CRUD for EntryDetail
    """
    queryset = EntryDetail.objects.select_related(
        "entry", "product"
    ).all()
    serializer_class = EntryDetailSerializer

    def perform_create(self, serializer):
        """
        When a detail is created, we recalculate the entry total.
        """
        detail = serializer.save()
        detail.entry.calculate_total()

    def perform_update(self, serializer):
        detail = serializer.save()
        detail.entry.calculate_total()

    def perform_destroy(self, instance):
        entry = instance.entry
        instance.delete()
        entry.calculate_total()
