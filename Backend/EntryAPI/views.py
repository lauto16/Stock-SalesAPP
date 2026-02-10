from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from .models import Entry, EntryDetail
from InventoryAPI.models import Product
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

    def create(self, request, *args, **kwargs):
        """
        Creates a new entry with details.
        """
        try:
            details_data = request.data.get("details", [])

            if not details_data or not isinstance(details_data, list):
                return Response(
                    {"success": False, "error": "Debe proporcionar una lista de detalles."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Validate products existence and data integrity
            for detail in details_data:
                product_id = detail.get("product")
                quantity = detail.get("quantity")
                unit_price = detail.get("unit_price")

                if not product_id:
                    return Response(
                        {"success": False, "error": "El producto es obligatorio en cada detalle."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                
                # Product ID (code) is a string, no need to cast to int
                if not isinstance(product_id, str):
                     return Response(
                        {"success": False, "error": "ID de producto inválido (debe ser código)."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if not Product.objects.filter(pk=product_id).exists():
                     return Response(
                        {"success": False, "error": f"El producto con código {product_id} no existe."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if quantity is None or float(quantity) <= 0:
                    return Response(
                        {"success": False, "error": "La cantidad debe ser mayor a 0."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                
                if unit_price is None or float(unit_price) < 0:
                     return Response(
                        {"success": False, "error": "El precio unitario no puede ser negativo."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            with transaction.atomic():
                entry = Entry.objects.create(created_by=request.user)

                for detail in details_data:
                    product = Product.objects.get(pk=detail.get("product"))
                    EntryDetail.objects.create(
                        entry=entry,
                        product=product,
                        quantity=float(detail.get("quantity")),
                        unit_price=float(detail.get("unit_price")),
                        observations=detail.get("observations", ""),
                        receipt=detail.get("receipt", "-")
                    )
                
                entry.calculate_total()
            
            serializer = self.get_serializer(entry)
            return Response({"success": True, "entry": serializer.data}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        """
        Updates an existing entry. If details are provided, replaces all existing details.
        """
        try:
            entry = self.get_object()
            details_data = request.data.get("details")

            with transaction.atomic():
                # Update Entry fields if needed (e.g. if we add more fields later)
                # Currently Entry only has created_by/at/total which are mostly auto or calculated.
                # If we wanted to update manual fields we would do it here.
                
                if details_data is not None:
                    if not isinstance(details_data, list):
                        return Response(
                            {"success": False, "error": "Detalles debe ser una lista."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    
                     # Validate products existence and data integrity
                    for detail in details_data:
                        product_id = detail.get("product")
                        quantity = detail.get("quantity")
                        unit_price = detail.get("unit_price")

                        if not product_id:
                            return Response(
                                {"success": False, "error": "El producto es obligatorio en cada detalle."},
                                status=status.HTTP_400_BAD_REQUEST,
                            )
                        
                        # Product ID (code) is a string
                        if not isinstance(product_id, str):
                             return Response(
                                {"success": False, "error": "ID de producto inválido (debe ser código)."},
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                        if not Product.objects.filter(pk=product_id).exists():
                             return Response(
                                {"success": False, "error": f"El producto con código {product_id} no existe."},
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                        if quantity is None or float(quantity) <= 0:
                            return Response(
                                {"success": False, "error": "La cantidad debe ser mayor a 0."},
                                status=status.HTTP_400_BAD_REQUEST,
                            )
                        
                        if unit_price is None or float(unit_price) < 0:
                             return Response(
                                {"success": False, "error": "El precio unitario no puede ser negativo."},
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                    # Replace details strategy
                    entry.details.all().delete()

                    for detail in details_data:
                        product = Product.objects.get(pk=detail.get("product"))
                        EntryDetail.objects.create(
                            entry=entry,
                            product=product,
                            quantity=float(detail.get("quantity")),
                            unit_price=float(detail.get("unit_price")),
                            observations=detail.get("observations", ""),
                            receipt=detail.get("receipt", "-")
                        )
                    
                    entry.calculate_total()
            
            serializer = self.get_serializer(entry)
            return Response({"success": True, "entry": serializer.data}, status=status.HTTP_200_OK)

        except Exception as e:
            print(e)
            return Response({"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
        Deletes an Entry by ID and restores stock for all products involved.
        """

        try:
            entry = (
                Entry.objects
                .prefetch_related("details__product")
                .get(pk=id)
            )
        except Entry.DoesNotExist:
            return Response(
                {"error": f"No existe el ingreso con ID {id}"},
                status=status.HTTP_404_NOT_FOUND
            )

        with transaction.atomic():
            for detail in entry.details.all():
                if detail.product and detail.product.in_use:
                    Product.objects.filter(pk=detail.product.pk).update(
                        stock=F("stock") - detail.quantity
                    )
            entry.delete()

        return Response({"success": True}, status=status.HTTP_200_OK)
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
