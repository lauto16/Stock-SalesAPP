from .serializers import ProductSerializer, ProductPagination
from rest_framework.response import Response
from rest_framework.decorators import action
from ProvidersAPI.models import Provider
from rest_framework.views import APIView
from rest_framework import viewsets
from django.http import HttpRequest
from rest_framework import status
from django.utils import timezone
from .models import Product


class ProductValidator:
    """
    Validator for Product PATCH request data
    """

    @staticmethod
    def validate_data(request: HttpRequest) -> dict:
        data = request.data

        try:
            code = data.get("code")
            name = data.get("name")
            stock = data.get("stock")
            buy_price = data.get("buy_price")
            sell_price = data.get("sell_price")
            provider = data.get("provider")

            if code is not None and not code.strip():
                return {
                    "success": False,
                    "error": "El campo 'código' no puede estar vacío.",
                }

            if name is not None and not name.strip():
                return {
                    "success": False,
                    "error": "El campo 'nombre' no puede estar vacío.",
                }

            if stock is not None:
                try:
                    stock = int(stock)
                except ValueError:
                    return {
                        "success": False,
                        "error": "Stock debe ser un número entero.",
                    }
                if stock < 0:
                    return {"success": False, "error": "Stock no puede ser negativo."}

            if buy_price is not None:
                try:
                    buy_price = float(buy_price)
                except ValueError:
                    return {
                        "success": False,
                        "error": "Precio de compra debe ser un número.",
                    }
                if buy_price <= 0:
                    return {
                        "success": False,
                        "error": "El precio de compra debe ser mayor a 0.",
                    }

            if sell_price is not None:
                try:
                    sell_price = float(sell_price)
                except ValueError:
                    return {
                        "success": False,
                        "error": "Precio de venta debe ser un número.",
                    }
                if sell_price <= 0:
                    return {
                        "success": False,
                        "error": "El precio de venta debe ser mayor a 0.",
                    }

            if provider is not None:
                try:
                    provider_id = int(provider)
                except ValueError:
                    return {
                        "success": False,
                        "error": "El ID del proveedor debe ser un número.",
                    }

                if not Provider.objects.filter(id=provider_id).exists():
                    return {
                        "success": False,
                        "error": "El proveedor especificado no existe.",
                    }

            return {"success": True, "error": None}

        except Exception as e:
            return {"success": False, "error": f"Ocurrió un error inesperado: {str(e)}"}


class ProductViewSet(viewsets.ModelViewSet):
    """
    Set of django views for each API request
    """

    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = ProductPagination
    # authentication_classes = [SessionAuthentication, TokenAuthentication]
    # permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"], url_path=r"get-by-code/(?P<code>[\w-]+)")
    def get_by_code(self, request, code=None):
        if not code:
            return Response(
                {"error": "Codigo invalido"}, status=status.HTTP_400_BAD_REQUEST
            )

        found = Product.objects.filter(code=code).first()

        if not found:
            return Response(
                {"error": "El producto con este codigo no existe"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(found, many=False)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="low-stock/(?P<limit>\d+)")
    def low_stock(self, request, limit=None):
        """
        Return up to 150 products with stock less than or equal to `limit`, sorted by stock ascending
        """
        try:
            limit = int(limit)
        except ValueError:
            return Response(
                {"error": "Limite invalido"}, status=status.HTTP_400_BAD_REQUEST
            )

        products = Product.objects.filter(stock__lte=limit).order_by("stock")[:150]

        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(
        detail=False, methods=["delete"], url_path="delete-by-code/(?P<code>[^/.]+)"
    )
    def destroy_by_code(self, request, code=None):
        """
        Removes a certain product from DB
        """
        product = Product.objects.filter(code=code)
        if not product.exists():
            return Response(
                {"error": f'No se pudo eliminar el producto "{code}"'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product.delete()
        return Response({"success": True})

    @action(detail=False, methods=["patch"], url_path="patch-by-code/(?P<code>[^/.]+)")
    def patch_by_code(self, request, code=None):
        """
        Modifies a certain product
        """
        validate_response = ProductValidator.validate_data(request)
        if validate_response["success"] is False:
            return Response(
                {"success": False, "error": validate_response["error"] or ""},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product = Product.objects.filter(code=code).first()

        if not product:
            return Response(
                {"success": False, "error": "No se encontro el producto a modificar"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ProductSerializer(product, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            product.last_modification = timezone.now()
            product.save()
            return Response({"success": True, "error": ""}, status=status.HTTP_200_OK)
        else:
            return Response(
                {"success": False, "error": "El codigo ya existe para otro producto"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ProductSearchView(APIView):

    def get(self, request):
        query = request.GET.get("q", "").strip().lower()
        if not query:
            return Response([], status=status.HTTP_200_OK)

        results = []
        for product in Product.objects.all():
            score = 0

            name = product.name.lower() if product.name else ""
            code = product.code.lower() if product.code else ""
            stock_str = str(product.stock) if product.stock is not None else ""

            if query in name:
                score += 5
                if name.startswith(query):
                    score += 3

            if query in code:
                score += 4
                if code.startswith(query):
                    score += 2

            if query == stock_str:
                score += 2

            if score > 0:
                results.append((score, product))

        results.sort(key=lambda tup: tup[0], reverse=True)
        matched_products = [p for _, p in results]

        serializer = ProductSerializer(matched_products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
