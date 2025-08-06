from .serializers import (
    ProductSerializer,
    OfferSerializer,
    ProductPagination,
    OfferPagination,
)
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.response import Response
from rest_framework.decorators import action
from ProvidersAPI.models import Provider
from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework import viewsets
from django.http import HttpRequest
from .models import Product, Offer
from rest_framework import status
from django.utils import timezone


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
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=["get"], url_path=r"get-by-code/(?P<code>[\w-]+)")
    def get_by_code(self, request, code=None):
        if not code:
            return Response(
                {"error": "Código inválido"}, status=status.HTTP_400_BAD_REQUEST
            )

        found = Product.objects.filter(code=code).first()

        if not found:
            return Response(
                {"error": "El producto con este código no existe"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(found)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="low-stock/(?P<limit>\d+)")
    def low_stock(self, request, limit=None):
        """
        Return up to 150 products with stock less than or equal to `limit`, sorted by stock ascending
        """
        try:
            limit = float(limit)
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
            for attr, value in serializer.validated_data.items():
                setattr(product, attr, value)

            product.last_modification = timezone.now()
            product.save(user=request.user)

            return Response({"success": True, "error": ""}, status=status.HTTP_200_OK)
            
        else:
            print(serializer.errors)
            return Response(
                {"success": False, "error": "El codigo ya existe para otro producto"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["patch"], url_path="patch-selected-prices")
    def patch_selected(self, request):
        """
        Updates a list of selected products by code,
        with optional control for whether to include discounted products (in an active offer).
        """
        percentage = request.data.get("percentage")
        include_discounted = request.data.get("includeDiscounted", False)
        codes = request.data.get("codes", [])
        
        if not isinstance(codes, list) or not codes:
            return Response(
                {
                    "success": False,
                    "error": "Debe proporcionar una lista de códigos de productos",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated_products = []

        for code in codes:
            product = Product.objects.filter(code=code).first()

            if not product:
                return Response(
                    {
                        "success": False,
                        "error": f"No se encontró el producto con código {code}",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if product.has_discount() and not include_discounted:
                continue

            if isinstance(percentage, (int, float)):
                product.sell_price = product.sell_price * (1 + (percentage / 100))
                product.last_modification = timezone.now()
                product.save(user=request.user)
                updated_products.append(product.code)

        return Response(
            {
                "success": True,
                "updated": updated_products,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["patch"], url_path="patch-all-prices")
    def patch_all(self, request):
        """
        TODO: Add the functionality to take care of edge cases when user wants to apply discount/rise prices to
        discounts(ofertas) and product combos ------> This needs to be done when the combos and discount structure and
        DB are ready
        """
        percentage = request.data.get("percentage")
        include_discounted = request.data.get("includeDiscounted", False)

        products = Product.objects.all()

        for product in products:
            if product.has_discount() and not include_discounted:
                continue

            if isinstance(percentage, (int, float)):
                product.sell_price = product.sell_price * (1 + (percentage / 100))
                product.last_modification = timezone.now()
                product.save(user=request.user)

        return Response({"success": True}, status=status.HTTP_200_OK)


class OfferViewSet(viewsets.ModelViewSet):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer
    pagination_class = OfferPagination

    def create(self, request, *args, **kwargs):
        try:
            name = request.data.get("name")
            percentage = request.data.get("percentage")
            end_date = request.data.get("end_date")
            products_ids = request.data.get("products")

            if not name:
                return Response(
                    {"success": False, "error": "El nombre es obligatorio."}, status=400
                )

            if Offer.objects.filter(name=name).exists():
                return Response(
                    {"success": False, "error": "Ya existe una oferta con ese nombre."},
                    status=400,
                )

            if percentage is None:
                return Response(
                    {"success": False, "error": "El porcentaje es obligatorio."},
                    status=400,
                )

            if end_date is None:
                return Response(
                    {
                        "success": False,
                        "error": "La fecha de finalización es obligatoria.",
                    },
                    status=400,
                )

            if not products_ids or not isinstance(products_ids, list):
                return Response(
                    {
                        "success": False,
                        "error": "Debe proporcionar una lista de productos.",
                    },
                    status=400,
                )

            products = Product.objects.filter(pk__in=products_ids)
            if products.count() != len(products_ids):
                return Response(
                    {"success": False, "error": "Uno o más productos no existen."},
                    status=400,
                )

            offer = Offer.objects.create(
                name=name,
                percentage=percentage,
                end_date=end_date,
            )
            offer.products.set(products)

            return Response({"success": True, "error": ""}, status=201)

        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=500)


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
