from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework import viewsets, permissions
from .serializers import ProviderSerializer
from .models import Provider


class ProviderViewSet(viewsets.ModelViewSet):
    """
    Set of django views for each API request
    """

    queryset = Provider.objects.all()
    serializer_class = ProviderSerializer
    #authentication_classes = [SessionAuthentication, TokenAuthentication]
    #permission_classes = [permissions.IsAuthenticated]