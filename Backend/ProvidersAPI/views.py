from rest_framework.pagination import PageNumberPagination
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework import viewsets, permissions
from .serializers import ProviderSerializer
from .models import Provider
from django.http import HttpRequest
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ProvidersAPI.models import Provider
from ProvidersAPI.serializers import ProviderSerializer
from django.utils import timezone


class ProviderViewSet(viewsets.ModelViewSet):
    """
    Set of django views for each API request
    """

    queryset = Provider.objects.all()
    serializer_class = ProviderSerializer
    # authentication_classes = [SessionAuthentication, TokenAuthentication]
    # permission_classes = [permissions.IsAuthenticated]


class ProviderValidator:
    """
    Validador para datos de PATCH de un Proveedor
    """

    @staticmethod
    def validate_data(request: HttpRequest) -> dict:
        data = request.data

        try:
            name = data.get("name")
            phone = data.get("phone")
            address = data.get("address")
            email = data.get("email")

            if name is not None and not name.strip():
                return {
                    "success": False,
                    "error": "El campo 'nombre' no puede estar vacío.",
                }

            if phone is not None and not phone.strip():
                return {
                    "success": False,
                    "error": "El campo 'teléfono' no puede estar vacío.",
                }

            if address is not None and not address.strip():
                return {
                    "success": False,
                    "error": "El campo 'dirección' no puede estar vacío.",
                }

            if email is not None:
                if not email.strip():
                    return {
                        "success": False,
                        "error": "El campo 'email' no puede estar vacío.",
                    }
                if "@" not in email or "." not in email:
                    return {
                        "success": False,
                        "error": "El campo 'email' debe ser una dirección válida.",
                    }

            return {"success": True, "error": None}

        except Exception as e:
            return {"success": False, "error": f"Ocurrió un error inesperado: {str(e)}"}


class ProviderPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class ProviderViewSet(viewsets.ModelViewSet):
    """
    ViewSet para operaciones CRUD sobre proveedores con paginación.
    """

    queryset = Provider.objects.all().order_by("name")
    serializer_class = ProviderSerializer
    pagination_class = ProviderPagination

    @action(detail=False, methods=["get"], url_path="get-by-name/(?P<name>[^/.]+)")
    def get_by_name(self, request, name=None):
        """
        Devuelve un proveedor por nombre exacto (case-insensitive)
        """
        provider = Provider.objects.filter(name__iexact=name).first()

        if not provider:
            return Response(
                {"error": f"No se encontró el proveedor '{name}'"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(provider)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["patch"], url_path="patch-by-id/(?P<pk>\d+)")
    def patch_by_id(self, request, pk=None):
        """
        Modifica un proveedor por ID
        """
        validate_response = ProviderValidator.validate_data(request)
        if not validate_response["success"]:
            return Response(
                {"success": False, "error": validate_response["error"]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        provider = Provider.objects.filter(pk=pk).first()
        if not provider:
            return Response(
                {"success": False, "error": "Proveedor no encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ProviderSerializer(
            provider, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True}, status=status.HTTP_200_OK)
        else:
            return Response(
                {"success": False, "error": "Datos inválidos"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["delete"], url_path="delete-by-id/(?P<pk>\d+)")
    def delete_by_id(self, request, pk=None):
        """
        Elimina un proveedor por ID
        """
        provider = Provider.objects.filter(pk=pk).first()
        if not provider:
            return Response(
                {"error": "Proveedor no encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )

        provider.delete()
        return Response({"success": True}, status=status.HTTP_200_OK)
