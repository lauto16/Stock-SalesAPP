from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.conf import settings
from datetime import timedelta


class LoginView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            access_token = response.data["access"]
            refresh_token = response.data["refresh"]

            res = Response({"message": "Login successful"}, status=status.HTTP_200_OK)
            cookie_settings = {
                "httponly": True,
                "secure": not settings.DEBUG,
                "samesite": "Lax",
                "max_age": 3600,
            }
            res.set_cookie("access", access_token, **cookie_settings)
            res.set_cookie("refresh", refresh_token, path="/api/token/refresh/", **cookie_settings)
            return res

        except (InvalidToken, AuthenticationFailed):
            return Response(
                {"error": "Credenciales inválidas"},
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    def post(self, request):
        res = Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        res.delete_cookie("access")
        res.delete_cookie("refresh", path="/api/token/refresh/")
        return res