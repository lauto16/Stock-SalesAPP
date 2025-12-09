
from django.db.models.functions import (
    ExtractYear,
    ExtractMonth,
    TruncDay,
    Coalesce,
)
from django.db.models import Sum, Count, F, FloatField
from django.db.models.functions import ExtractMonth
from concurrent.futures import ThreadPoolExecutor
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from InventoryAPI.models import Product
from SalesAPI.models import Sale
from collections import Counter
from datetime import datetime


class StatsViewSet(viewsets.ViewSet):
    """
    A set of api endpoints (views) retrieving data statistics calculated using fast and 
    efficient methods.
    """
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"], url_path=r"sales-data")
    def sales_data(self, request):
        """
        Calculates and returns key sales statistics across different time periods.

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
                {"month": month, "sales": month_sales.get(month, 0)} for month in range(1, 13)
            ]

            return {"total_sales_by_month": all_months}

        with ThreadPoolExecutor(max_workers=2) as executor:
            results = list(executor.map(lambda fn: fn(), [
                           calc_totals, calc_sales_per_month]))

        data = {}
        for r in results:
            data.update(r)

        return Response({"success": True, "sales_data": data})

    @action(detail=False, methods=["get"], url_path=r"employees-stats")
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
            counter = Counter(queryset.values_list(
                "created_by__username", flat=True))
            return counter.most_common(1)[0][0] if counter else None

        data = {
            "most_selling_employee_historically": best_seller(qs),
            "most_selling_employee_this_year": best_seller(qs.filter(year=current_year)),
            "most_selling_employee_this_month": best_seller(
                qs.filter(year=current_year, month=current_month)
            ),
            "most_selling_employee_this_day": best_seller(
                qs.filter(
                    year=current_year, month=current_month, day__day=current_day
                )
            ),
        }

        return Response({"success": True, "employees_stats": data})

    @action(detail=False, methods=["get"], url_path=r"products-data")
    def products_data(self, request):
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
            total_margin=Coalesce(
                Sum("margin", output_field=FloatField()), 0.0),
        )

        product_count = qs.count()
        total_margin = aggregated["total_margin"]

        average_margin = round(total_margin / product_count,
                               2) if product_count > 0 else 0.0

        data = {"average_gain_margin_per_product": average_margin}

        return Response({"success": True, "products_data": data})