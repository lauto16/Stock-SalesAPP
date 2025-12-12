from rest_framework import viewsets
from .models import PayMethod
from .serializers import PayMethodSerializer

class PayMethodViewSet(viewsets.ModelViewSet):
    queryset = PayMethod.objects.all()
    serializer_class = PayMethodSerializer
