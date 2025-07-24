from django.shortcuts import render
from django.http import HttpResponse, HttpRequest
from StockSalesApp.decorators import pin_required
from django.contrib.auth.decorators import login_required


@login_required
@pin_required
def inventory(request: HttpRequest) -> HttpResponse:
    """
    Provides the user the html view for the inventory service
    """
    user = request.user
    return render(request, 'inventory.html', {'user_role': user.role.name_sp})
