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
    """
    Pagination class for ChangeLog results.

    Provides configurable page size with a default of 10 items per page.
    Allows clients to override the page size up to a maximum of 100.
    """
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class NoPagination(PageNumberPagination):
    """
    Disables pagination for endpoints that require returning all results.

    Setting `page_size` to None causes DRF to return full result sets
    without applying any pagination.
    """
    page_size = None


class ChangeLogViewSet(viewsets.ModelViewSet):
    """
    ViewSet for listing, retrieving, and managing ChangeLog entries.

    Uses standard Django REST Framework ModelViewSet behavior along with:
      - Token and session authentication
      - Authentication requirement (IsAuthenticated)
      - Pagination through ChangeLogPagination

    This endpoint is intended for general browsing and admin usage.
    """
    queryset = ChangeLog.objects.all()
    serializer_class = ChangeLogSerializer
    pagination_class = ChangeLogPagination
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]


class ChangeLogSearchViewForProducts(APIView):
    """
    Provides advanced search over ChangeLog entries related to Product objects.

    The search works by:
      - Matching the query against the product name, product code,
        and change date.
      - Assigning a weighted score based on relevance.
      - Sorting results in descending score order.

    The response includes:
      - A list of matching ChangeLog entries serialized with ChangeLogSerializer
      - A count of the number of matches

    Intended for use in frontend search bars and quick filtering interfaces.
    """

    def get(self, request):
        """
        Handles GET requests for product-related ChangeLog search.

        Query parameters:
            q (str): The search term. Matches are case-insensitive.

        Returns:
            Response: JSON object containing:
                - "results": serialized ChangeLog entries
                - "count": number of matched entries
        """
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