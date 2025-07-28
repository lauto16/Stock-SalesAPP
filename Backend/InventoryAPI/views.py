from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from .serializers import ProductSerializer, ProductPagination
from rest_framework.pagination import PageNumberPagination
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.views.generic import ListView
from rest_framework.views import APIView
from django.http import HttpRequest
from rest_framework import status
from django.db.models import Q
from .models import Product


class ProductViewSet(viewsets.ModelViewSet):
    """
    Set of django views for each API request
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = ProductPagination
    # authentication_classes = [SessionAuthentication, TokenAuthentication]
    # permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='low-stock/(?P<limit>\d+)')
    def low_stock(self, request, limit=None):
        """
        Return up to 150 products with stock less than or equal to `limit`, sorted by stock ascending
        """
        try:
            limit = int(limit)
        except ValueError:
            return Response({'error': 'Invalid limit'}, status=status.HTTP_400_BAD_REQUEST)

        products = Product.objects.filter(
            stock__lte=limit).order_by('stock')[:150]

        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['delete'], url_path='delete-by-code/(?P<code>[^/.]+)')
    def destroy_by_code(self, request, code=None):
        """
        Removes a certain product from DB
        """
        product = Product.objects.filter(code=code)
        if not product.exists():
            return Response({"error": f'No se pudo eliminar el producto "{code}"'}, status=status.HTTP_400_BAD_REQUEST)

        product.delete()
        return Response({'success': True})


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
