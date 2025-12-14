from django.db.models.functions import (
    ExtractYear,
    ExtractMonth,
    TruncDay,
    Coalesce,
)
from django.db.models import Sum, Count, Q, F, FloatField, ExpressionWrapper
from django.db.models.functions import ExtractMonth, ExtractHour
from concurrent.futures import ThreadPoolExecutor
from PaymentMethodAPI.models import PaymentMethod
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from SalesAPI.models import Sale, SaleItem
from InventoryAPI.models import Product
from Auth.models import CustomUser
from django.utils import timezone
from collections import Counter
from datetime import timedelta
from datetime import datetime


class ProductsStatsViewSet(viewsets.ViewSet):
    """
    A set of api endpoints retrieving product's data statistics calculated using fast and
    efficient methods.
    """

    def calculate_lower_margin_products(self, count: int):
        margin_expr = ExpressionWrapper(
            F("sell_price") - F("buy_price"),
            output_field=FloatField()
        )

        return (
            Product.objects
            .annotate(margin=margin_expr)
            .order_by("margin")[:count]
            .values(
                "code",
                "sell_price",
                "buy_price",
                "name",
                "margin",
            )
        )

    def calculate_higher_margin_products(self, count: int):
        margin_expr = ExpressionWrapper(
            F("sell_price") - F("buy_price"),
            output_field=FloatField()
        )

        return (
            Product.objects
            .annotate(margin=margin_expr)
            .order_by("-margin")[:count]
            .values(
                "code",
                "sell_price",
                "buy_price",
                "name",
                "margin",
            )
        )
    
    @action(detail=False, methods=["get"], url_path=r"products-stats")
    def products_stats(self, request):
        """
        Calculates and returns aggregate product data, specifically the average gain margin.

        It annotates each product by calculating its margin percentage directly
        in the database using Sell Price and Buy Price.
        The overall average margin is then computed by aggregating the total margin
        across all products and dividing by the product count.
        It uses Coalesce to default the Sum to 0.0 if the queryset is empty.
        """
        qs = Product.objects.annotate(
            margin=((F("sell_price") - F("buy_price")) / F("buy_price")) * 100.0
        )

        aggregated = qs.aggregate(
            total_margin=Coalesce(Sum("margin", output_field=FloatField()), 0.0),
        )

        product_count = qs.count()
        total_margin = aggregated["total_margin"]

        average_margin = (
            round(total_margin / product_count, 2) if product_count > 0 else 0.0
        )

        data = {"average_gain_margin_per_product": average_margin}

        return Response({"success": True, "products_data": data})
        
    @action(detail=False, methods=["get"], url_path="higher-margin-products")
    def higher_margin_products(self, request):
        # /api/products_stats/higher-margin-products/?count=5
        try:
            count = int(request.query_params.get("count", 10))
        except ValueError:
            count = 10

        ranking = self.calculate_higher_margin_products(count)

        return Response(ranking)
    
    @action(detail=False, methods=["get"], url_path="lower-margin-products")
    def lower_margin_products(self, request):
        # /api/products_stats/lower-margin-products/?count=5
        try:
            count = int(request.query_params.get("count", 10))
        except ValueError:
            count = 10

        ranking = self.calculate_lower_margin_products(count)

        return Response(ranking)
    
class EmployeesStatsViewSet(viewsets.ViewSet):
    """
    A set of api endpoints retrieving employee's data statistics calculated using fast and
    efficient methods.
    """

    permission_classes = [permissions.IsAuthenticated]

    def calculate_sales_by_user(self, user):
        return (
            Sale.objects
            .filter(created_by=user)
            .count()
        )     

    @action(detail=False, methods=["get"], url_path="employees-sales")
    def sales_by_employee(self, request):
        total_sales = {}
        users = CustomUser.objects.all()
        
        for user in users:
            sales = self.calculate_sales_by_user(user)
            total_sales[user.username] = sales

        return Response(total_sales)
    
    @action(detail=False, methods=["get"], url_path=r"employees-stats/")
    def employees_stats(self, request):
        """
        Calculates and returns sales performance statistics for employees across different time periods.

        It uses Django's database functions (ExtractYear, ExtractMonth, TruncDay)
        to annotate sales records by temporal periods (year, month, day).
        A helper function, 'best_seller', processes these records using Python's
        Counter utility to determine the employee with the most sales historically,
        this year, this month, and today.
        """
        today = datetime.now()
        current_year = today.year
        current_month = today.month
        current_day = today.day

        qs = Sale.objects.annotate(
            year=ExtractYear("created_at"),
            month=ExtractMonth("created_at"),
            day=TruncDay("created_at"),
        )

        def best_seller(queryset):
            counter = Counter(queryset.values_list("created_by__username", flat=True))
            return counter.most_common(1)[0][0] if counter else None

        data = {
            "most_selling_employee_historically": best_seller(qs),
            "most_selling_employee_this_year": best_seller(
                qs.filter(year=current_year)
            ),
            "most_selling_employee_this_month": best_seller(
                qs.filter(year=current_year, month=current_month)
            ),
            "most_selling_employee_this_day": best_seller(
                qs.filter(year=current_year, month=current_month, day__day=current_day)
            ),
        }

        return Response({"success": True, "employees_stats": data})


class SalesStatsViewSet(viewsets.ViewSet):
    """
    A set of api endpoints retrieving product's data statistics calculated using fast and
    efficient methods.
    """

    """
    TODO:
    Ventas por franja horaria  (qué horas dan más ventas)
    """

    permission_classes = [permissions.IsAuthenticated]

    def calculate_average_sale(self, period: str):
        now = timezone.now()

        if period == "day":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "week":
            start_date = (
                now - timedelta(days=now.weekday())
            ).replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "month":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        elif period == "year":
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        elif period == "all":
            start_date = None
        else:
            return None

        qs = Sale.objects.all()

        if start_date:
            qs = qs.filter(
                created_at__gte=start_date,
                created_at__lte=now
            )

        result = qs.aggregate(
            total=Sum("total_price"),
            count=Count("id")
        )

        total = result["total"] or 0
        count = result["count"] or 0

        return 0 if count == 0 else total / count

    def calculate_most_used_payment_methods(self, period: str):
        now = timezone.now()

        if period == "day":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "week":
            start_date = (
                now - timedelta(days=now.weekday())
            ).replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "month":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        elif period == "year":
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        elif period == "all":
            start_date = None
        else:
            return None

        pm = PaymentMethod.objects.all()

        if start_date:
            pm = pm.annotate(
                usage_count=Count(
                    "sale",
                    filter=Q(
                        sale__created_at__gte=start_date,
                        sale__created_at__lte=now
                    )
                )
            )
        else:
            pm = pm.annotate(
                usage_count=Count("sale")
            )

        pm = pm.order_by("-usage_count")

        return [
            {
                "payment_method": m.name,
                "count": m.usage_count or 0
            }
            for m in pm
        ]
    
    def calculate_best_selling_products(self, period: str, count: int):
        now = timezone.now()

        if period == "day":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "week":
            start_date = (
                now - timedelta(days=now.weekday())
            ).replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "month":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        elif period == "year":
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        elif period == "all":
            start_date = None
        else:
            return None

        qs = SaleItem.objects.select_related("product", "sale")

        if start_date:
            qs = qs.filter(
                sale__created_at__gte=start_date,
                sale__created_at__lte=now
            )

        return (
            qs.values(
                "product__code",
                "product__name",
            )
            .annotate(total_sold=Sum("quantity"))
            .order_by("-total_sold")[:count]
        )

    def calculate_best_selling_hours(self):
        qs = (
            Sale.objects
            .annotate(hour=ExtractHour("created_at"))
            .values("hour")
            .annotate(count=Count("id"))
        )

        hours_map = {
            item["hour"]: item["count"]
            for item in qs
            if item["hour"] is not None
        }

        result = []

        for h in range(24):
            start = f"{h:02d}:00"
            end = f"{(h + 1) % 24:02d}:00"

            result.append({
                "hour   ": f"{start}-{end}",
                "count": hours_map.get(h, 0)
            })

        return result
    
    @action(detail=False, methods=["get"], url_path=r"average-sales-value/(?P<period>[a-zA-Z]+)")
    def average_sale_value(self, request, period=None):
        average = self.calculate_average_sale(period)
        if average is None:
            return Response({"error": "Periodo invalido"}, status=400)

        print(period, average)

        return Response({"period": period, "average_sale_value": average})

    @action(detail=False, methods=["get"], url_path=r"most-used-payment-methods/(?P<period>[a-zA-Z]+)")
    def most_used_payment_methods(self, request, period=None):
        result = self.calculate_most_used_payment_methods(period)

        if result is None:
            return Response({"error": "Periodo invalido"}, status=400)

        return Response({
            "period": period,
            "payment_method_usage": result
        })
    
    @action(detail=False, methods=["get"], url_path=r"best-selling-products/(?P<period>[a-zA-Z]+)")
    def best_selling_products(self, request, period=None):
        # /api/sales_stats/best-selling-products/month?count=5
        try:
            count = int(request.query_params.get("count", 10))
        except ValueError:
            count = 10

        ranking = self.calculate_best_selling_products(period, count)

        if ranking is None:
            return Response(
                {"error": "Periodo invalido"},
                status=400
            )

        return Response(ranking)
        
    @action(detail=False, methods=["get"], url_path=r"best-selling-hours")
    def best_selling_hours(self, request):
        # /api/sales_stats/best-selling-hours/

        ranking = self.calculate_best_selling_hours()

        if ranking is None:
            return Response(
                {"error": "No hay ventas registradas"},
                status=400
            )

        return Response(ranking)
        
    @action(detail=False, methods=["get"], url_path=r"sales-stats")
    def sales_stats(self, request):
        """
        Calculates and returns key sales statistics across different time periods used mainly for
        dashboard view.

        This custom action computes eight different metrics: the total count of sales
        and the total monetary value of sales (Sum of 'total_price').
        These metrics are provided for four temporal scopes: historically,
        current year, current month, and current day.
        It uses Django's database functions (ExtractYear, ExtractMonth, TruncDay, Sum)
        for efficient, database-level computation.
        """
        today = datetime.now()
        current_year = today.year
        current_month = today.month
        current_day = today.day

        def calc_totals():
            """
            Calculates eight key sales metrics grouped by time period (historic, year, month, day).

            First, it annotates the entire sale queryset with temporal fields (year, month, day).
            It then runs eight separate queries: four Count queries for the number of sales
            and four Sum queries for the monetary value (total_price), applying filters
            to restrict the data to the current year, month, and day as necessary.
            Returns a dictionary containing all calculated statistics.
            """
            qs = Sale.objects.annotate(
                year=ExtractYear("created_at"),
                month=ExtractMonth("created_at"),
                day=TruncDay("created_at"),
            )

            return {
                "total_sales_historically": qs.count(),
                "total_sales_this_year": qs.filter(year=current_year).count(),
                "total_sales_this_month": qs.filter(
                    year=current_year, month=current_month
                ).count(),
                "total_sales_this_day": qs.filter(
                    year=current_year, month=current_month, day__day=current_day
                ).count(),
                "total_money_sales_historically": qs.aggregate(Sum("total_price"))[
                    "total_price__sum"
                ]
                or 0.0,
                "total_money_sales_this_year": qs.filter(year=current_year).aggregate(
                    Sum("total_price")
                )["total_price__sum"]
                or 0.0,
                "total_money_sales_this_month": qs.filter(
                    year=current_year, month=current_month
                ).aggregate(Sum("total_price"))["total_price__sum"]
                or 0.0,
                "total_money_sales_this_day": qs.filter(
                    year=current_year, month=current_month, day__day=current_day
                ).aggregate(Sum("total_price"))["total_price__sum"]
                or 0.0,
            }

        def calc_sales_per_month():
            """Returns the historically sales in each month"""
            qs = (
                Sale.objects.annotate(month=ExtractMonth("created_at"))
                .values("month")
                .annotate(total=Count("id"))
            )
            month_sales = {item["month"]: item["total"] for item in qs}
            all_months = [
                {"month": month, "sales": month_sales.get(month, 0)}
                for month in range(1, 13)
            ]

            return {"total_sales_by_month": all_months}

        with ThreadPoolExecutor(max_workers=2) as executor:
            results = list(
                executor.map(lambda fn: fn(), [calc_totals, calc_sales_per_month])
            )

        data = {}
        for r in results:
            data.update(r)

        return Response({"success": True, "sales_data": data})
