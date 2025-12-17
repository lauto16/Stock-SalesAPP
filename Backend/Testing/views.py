from django.shortcuts import render
from InventoryAPI.models import Product
from django.http import JsonResponse

def test_sales(request):
    product = Product.objects.get(code='Dd-864')
    return JsonResponse({'has_discount': product.get_active_discounts()})
