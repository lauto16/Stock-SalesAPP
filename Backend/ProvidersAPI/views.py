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


class NoPagination(PageNumberPagination):
    page_size = None


class ProviderViewSet(viewsets.ModelViewSet):
    """
    ViewSet para operaciones CRUD sobre proveedores con paginación.
    """
    queryset = Provider.objects.all()
    serializer_class = ProviderSerializer
    pagination_class = ProviderPagination
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="all")
    def get_all(self, request):
        """
        Retorna todos los proveedores sin paginación.
        """
        providers = Provider.objects.all()
        serializer = self.get_serializer(providers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
