from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework import viewsets, permissions
from .serializers import ProductSerializer, ProductPagination
from .models import Product


class ProductViewSet(viewsets.ModelViewSet):
    """
    Set of django views for each API request
    """

    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = ProductPagination
    #authentication_classes = [SessionAuthentication, TokenAuthentication]
    #permission_classes = [permissions.IsAuthenticated]