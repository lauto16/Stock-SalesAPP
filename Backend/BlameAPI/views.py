from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.pagination import PageNumberPagination
from django.contrib.contenttypes.models import ContentType
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .serializers import ChangeLogSerializer
from rest_framework.views import APIView
from InventoryAPI.models import Product
from rest_framework import status
from .models import ChangeLog


class ChangeLogPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class NoPagination(PageNumberPagination):
    page_size = None


class ChangeLogViewSet(viewsets.ModelViewSet):
    """
    ViewSet para operaciones CRUD sobre proveedores con paginación.
    """

    queryset = ChangeLog.objects.all()
    serializer_class = ChangeLogSerializer
    pagination_class = ChangeLogPagination
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]


class ChangeLogSearchViewForProducts(APIView):

    def get(self, request):
        query = request.GET.get("q", "").strip().lower()
        if not query:
            return Response([], status=status.HTTP_200_OK)

        product_ct = ContentType.objects.get_for_model(Product)

        results = []
        for change_log in ChangeLog.objects.filter(content_type=product_ct):
            score = 0
            product = change_log.content_object

            if not isinstance(product, Product):
                continue

            product_name = product.name.lower() if product.name else ""
            code = product.code.lower() if product.code else ""
            change_log_date = str(change_log.changed_at)

            if query in change_log_date:
                score += 5
                if change_log_date.startswith(query):
                    score += 3

            if query in product_name:
                score += 5
                if product_name.startswith(query):
                    score += 3

            if query in code:
                score += 4
                if code.startswith(query):
                    score += 2

            if score > 0:
                results.append((score, change_log))

        results.sort(key=lambda tup: tup[0], reverse=True)
        matched_logs = [log for _, log in results]

        serializer = ChangeLogSerializer(matched_logs, many=True)
        return Response(
            {"results": serializer.data, "count": len(serializer.data)},
            status=status.HTTP_200_OK,
        )
