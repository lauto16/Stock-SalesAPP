from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.pagination import PageNumberPagination
from rest_framework import viewsets, permissions
from .serializers import DailyReportSerializer
from .models import DailyReport


class DailyReportPagination(PageNumberPagination):
    """Pagination class for Providers results."""

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class DailyReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet providing CRUD operations for DailyReports with pagination support.
    """

    queryset = DailyReport.objects.all().order_by('-created_at')
    serializer_class = DailyReportSerializer
    pagination_class = DailyReportPagination
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
