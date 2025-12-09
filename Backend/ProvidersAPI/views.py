from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.pagination import PageNumberPagination
from ProvidersAPI.serializers import ProviderSerializer
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import ProviderSerializer
from rest_framework import viewsets, status
from ProvidersAPI.models import Provider
from django.http import HttpRequest
from django.utils import timezone
from .models import Provider


class ProviderValidator:
    """
    Validator for PATCH request data when updating a Provider.
    """

    @staticmethod
    def validate_data(request: HttpRequest) -> dict:
        """
        Validates incoming PATCH data for a Provider, ensuring required fields
        are non-empty and properly formatted.
        """
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
    """Pagination class for Providers results."""
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class NoPagination(PageNumberPagination):
    """
    Disables pagination for endpoints that require returning all results.

    Setting `page_size` to None causes DRF to return full result sets
    without applying any pagination.
    """
    page_size = None


class ProviderViewSet(viewsets.ModelViewSet):
    """
    ViewSet providing CRUD operations for providers with pagination support.
    """

    queryset = Provider.objects.all()
    serializer_class = ProviderSerializer
    pagination_class = ProviderPagination
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="all")
    def get_all(self, request):
        """
        Returns all providers without pagination.
        """
        providers = Provider.objects.all()
        serializer = self.get_serializer(providers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["patch"], url_path="patch-by-id/(?P<id>[^/.]+)")
    def patch_by_id(self, request, id=None):
        """
        Partially updates a provider based on its ID.
        """
        print(request)
        validate_response = ProviderValidator.validate_data(request)
        if validate_response["success"] is False:
            return Response(
                {"success": False, "error": validate_response["error"] or ""},
                status=status.HTTP_400_BAD_REQUEST,
            )

        provider = Provider.objects.filter(id=id).first()

        if not provider:
            return Response(
                {"success": False, "error": "No se encontro el proveedor a modificar"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ProviderSerializer(
            provider, data=request.data, partial=True)

        if serializer.is_valid():
            for attr, value in serializer.validated_data.items():
                setattr(provider, attr, value)

            provider.updated_at = timezone.now()
            provider.save(user=request.user)

            return Response({"success": True, "error": ""}, status=status.HTTP_200_OK)

        else:
            print(serializer.errors)
            return Response(
                {"success": False, "error": "Error en el servidor"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(
        detail=False,
        methods=["delete"],
        url_path="delete-by-id/(?P<id>[^/.]+)"
    )
    def destroy_by_id(self, request, id=None):
        """
        Deletes a product from the DB only if there's no sales associated with the product
        """
        provider = Provider.objects.filter(id=id).first()
        if not provider:
            return Response(
                {
                    "success": False,
                    "error": f'No se encontró el producto con código "{id}".'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        provider.delete()
        return Response({"success": True}, status=status.HTTP_200_OK)