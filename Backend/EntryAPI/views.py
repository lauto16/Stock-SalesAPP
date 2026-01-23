from .serializers import EntrySerializer, EntryPagination
from rest_framework import viewsets
from .models import Entry

class EntryViewSet(viewsets.ModelViewSet):
    queryset = Entry.objects.all().order_by("-created_at")
    serializer_class = EntrySerializer
    pagination_class = EntryPagination