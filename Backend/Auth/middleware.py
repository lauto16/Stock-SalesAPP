class JWTAuthCookieMiddleware:
    # Intercepts the request looking for the user's Token
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token = request.COOKIES.get('access')
        if token:
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'
        return self.get_response(request)