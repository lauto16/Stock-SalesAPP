from .serializers import CategorySerializer
from rest_framework import viewsets
from .models import Category

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    