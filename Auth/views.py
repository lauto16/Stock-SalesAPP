from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, HttpResponse
from json import loads as json_loads, JSONDecodeError
from .forms import LoginForm
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required

@login_required
def role_selector(request: HttpRequest) -> HttpResponse:
    return render(request, 'role_selector.html')


def auth(request: HttpRequest) -> HttpResponse:
    """
    This view represent's the user login page.

    Args:
        request (HttpResponse): HttpResponse
    """
    # quitar en produccion
    logout(request)
    if request.method == 'POST':
        try:
            data = json_loads(request.body)
            form = LoginForm(data)
            
            if not form.is_valid():
                return JsonResponse({'error': 'Datos inválidos.'}, status=400)

            username = form.cleaned_data['username']
            password = form.cleaned_data['password']

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                return JsonResponse({'success': True})
            else:
                return JsonResponse({'error': 'Credenciales inválidas.'}, status=401)

        except JSONDecodeError:
            return JsonResponse({'error': 'Formato JSON incorrecto.'}, status=400)

    else:
        return render(request, 'auth.html')