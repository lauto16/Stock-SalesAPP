from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import viewsets, status, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import SignupSerializer
from rest_framework.views import APIView
from django.conf import settings
from Auth.models import Role


class LoginView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            access_token = response.data["access"]
            refresh_token = response.data["refresh"]

            res = Response({"message": "Login successful"},
                           status=status.HTTP_200_OK)
            cookie_settings = {
                "httponly": True,
                "secure": not settings.DEBUG,
                "samesite": "Lax",
                "max_age": 3600,
            }
            res.set_cookie("access", access_token, **cookie_settings)
            res.set_cookie("refresh", refresh_token,
                           path="/api/token/refresh/", **cookie_settings)
            return res

        except (InvalidToken, AuthenticationFailed):
            return Response(
                {"error": "Credenciales inválidas"},
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    def post(self, request):
        res = Response({"message": "Logout successful"},
                       status=status.HTTP_200_OK)
        res.delete_cookie("access")
        res.delete_cookie("refresh", path="/api/token/refresh/")
        return res


class LoginViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"])
    def me(self, request):
        user = request.user
        if not user:
            return Response({"detail": "El usuario debe estar logueado"}, status=403)

        if user and hasattr(user, "role") and user.role:
            return Response({"role_name_sp": user.role.name_sp})
        return Response({"detail": "No se encontró el rol del usuario."}, status=404)

    @action(detail=False, methods=["get"], url_path=r"verify-user-pin/(?P<pin>[\w-]+)")
    def verify_user_pin(self, request, pin=None):
        user = request.user
        if not pin:
            return Response({"detail": "Se debe ingresar un pin"}, status=400)

        if not user:
            return Response({"detail": "El usuario debe estar logueado"}, status=403)

        if user.pin == pin:
            return Response(
                {"success": True},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"success": False},
                status=status.HTTP_401_UNAUTHORIZED
            )


CustomUser = get_user_model()


class SignupViewSet(viewsets.ViewSet):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        pin = serializer.validated_data['pin']
        role_name = serializer.validated_data['role']

        try:
            role = Role.objects.get(name=role_name)
        except Role.DoesNotExist:
            return Response(
                {"error": f"El rol '{role_name}' no existe"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = CustomUser.objects.create_user(
            username=username,
            password=password,
            role_name=role_name,
            pin=pin
        )

        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "role": role.name,
                "token": token.key
            },
            status=status.HTTP_201_CREATED
        )