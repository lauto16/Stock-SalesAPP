from django.http import JsonResponse, HttpRequest, HttpResponse
from django.contrib.auth.decorators import login_required
from json import loads as json_loads, JSONDecodeError
from django.contrib.auth import login, logout
from django.shortcuts import render
from .verify import AuthVerifyer
from .forms import LoginForm


@login_required
def pin_verify(request: HttpRequest) -> HttpResponse:
    user = request.user
    if request.method == 'POST':
        try:
            data = json_loads(request.body)
            user_pin = data['user_pin']

            pin_is_valid = AuthVerifyer.verifyUserPin(user_pin=user_pin, user=user)

            if pin_is_valid:
                request.session['pin_verified'] = True
                return JsonResponse({'success': True, 'role': user.role.name})
            else:
                return JsonResponse({'error': 'Pin inválido.'}, status=401)

        except JSONDecodeError:
            return JsonResponse({'error': 'Formato JSON incorrecto.'}, status=400)

    else:
        return render(request, 'pin_verify.html')


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

            user = AuthVerifyer.verifyAuthenticity(request=request, username=username, password=password)

            if user is None:
                return JsonResponse({'error': 'Credenciales inválidas.'}, status=401)

            login(request, user)
            return JsonResponse({'success': True, 'redirect_to': 'pin_verify'})

        except JSONDecodeError:
            return JsonResponse({'error': 'Formato JSON incorrecto.'}, status=400)

    else:
        return render(request, 'auth.html')
