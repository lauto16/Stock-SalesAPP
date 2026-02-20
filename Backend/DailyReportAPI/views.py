from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.authentication import TokenAuthentication
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse, FileResponse
from forms.export_to_excel import export_to_excel
from rest_framework import viewsets, permissions
from .serializers import DailyReportSerializer
from .models import DailyReport
import os



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
    


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def dailyreport_download_excel(request):
    columns = [
        ("Fecha", "created_at"),
        ("Ganancia", "gain"),
        ("Pérdida", "loss"),
        ("Margen", "profit"),
    ]

    filename = "reportes_diarios"

    reports = DailyReport.objects.all().order_by("created_at")

    success, file_path = export_to_excel(filename, columns, reports)

    if success and os.path.exists(file_path):
        return FileResponse(
            open(file_path, "rb"),
            as_attachment=True,
            filename=f"{filename}.xlsx"
        )

    return JsonResponse({
        "success": False,
        "message": file_path
    }, status=500)
