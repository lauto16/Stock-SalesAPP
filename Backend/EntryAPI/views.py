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
