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
    """
    Viewset to manage user's login
    """

    def post(self, request, *args, **kwargs):
        try:
            """
            Returns useful information about the user along with their token.
            """
            response = super().post(request, *args, **kwargs)
            access_token = response.data["access"]
            refresh_token = response.data["refresh"]

            user = self.user

            user_permissions = []
            if hasattr(user, "role") and user.role:
                user_permissions = list(
                    user.role.permissions.values_list("code_name", flat=True)
                )

            res = Response(
                {
                    "message": "Login successful",
                    "permissions": user_permissions,
                },
                status=status.HTTP_200_OK,
            )

            cookie_settings = {
                "httponly": True,
                "secure": not settings.DEBUG,
                "samesite": "Lax",
                "max_age": 3600,
            }
            res.set_cookie("access", access_token, **cookie_settings)
            res.set_cookie(
                "refresh", refresh_token, path="/api/token/refresh/", **cookie_settings
            )
            return res

        except (InvalidToken, AuthenticationFailed):
            return Response(
                {"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    """
    Viewset to manage user's logout
    """

    def post(self, request):
        """Logs the user out"""
        res = Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        res.delete_cookie("access")
        res.delete_cookie("refresh", path="/api/token/refresh/")
        return res


class LoginViewSet(viewsets.ViewSet):
    """
    Control class to ask for data about the logued user and verify their pin
    """

    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"])
    def me(self, request):
        user = request.user
        if not user or not hasattr(user, "role") or not user.role:
            return Response(
                {"detail": "No se encontró el rol del usuario."}, status=404
            )

        permissions = list(user.role.permissions.values_list("code_name", flat=True))

        return Response(
            {
                "role_name_sp": user.role.name_sp,
                "permissions": permissions,
                "askForPin": user.askForPin,
                "allowedStockDecrease": user.allowed_to_decide_stock_decrease,
            }
        )

    @action(detail=False, methods=["get"], url_path=r"verify-user-pin/(?P<pin>[\w-]+)")
    def verify_user_pin(self, request, pin=None):
        "Returns True if the user submitted their pin correctly"
        user = request.user
        if not pin:
            return Response({"detail": "Se debe ingresar un pin"}, status=400)

        if not user:
            return Response({"detail": "El usuario debe estar logueado"}, status=403)

        if user.pin == pin:
            return Response({"success": True}, status=status.HTTP_200_OK)
        else:
            return Response({"success": False}, status=status.HTTP_401_UNAUTHORIZED)


CustomUser = get_user_model()


class SignupViewSet(viewsets.ViewSet):
    """Viewset for creating a new user"""

    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        """Creates a new user (this can only be done from dashboard and by an admin)"""
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]
        pin = serializer.validated_data["pin"]
        role_name = serializer.validated_data["role"]

        try:
            role = Role.objects.get(name=role_name)
        except Role.DoesNotExist:
            return Response(
                {"error": f"El rol '{role_name}' no existe"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = CustomUser.objects.create_user(
            username=username, password=password, role_name=role_name, pin=pin
        )

        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "role": role.name,
                "token": token.key,
            },
            status=status.HTTP_201_CREATED,
        )


class UserViewSet(viewsets.ViewSet):
    """This viewset is utilized to perform "crud" actions to CustomUser instances"""

    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="list")
    def list_users(self, request):
        """Returns the list of users registered"""
        user = request.user

        if not hasattr(user, "role") or user.role.name != "administrator":
            return Response(
                {"detail": "No tenés permisos para ver los usuarios."},
                status=status.HTTP_403_FORBIDDEN,
            )

        users = CustomUser.objects.all().select_related("role").order_by("username")

        users_data = [
            {
                "id": u.id,
                "username": u.username,
                "role": u.role.name_sp if u.role else None,
            }
            for u in users
        ]

        return Response(
            {"success": True, "data": users_data}, status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["delete"], url_path="delete")
    def delete_user(self, request, pk=None):
        """Deletes a user"""
        user = request.user

        if not hasattr(user, "role") or user.role.name != "administrator":
            return Response(
                {"detail": "No tenés permisos para eliminar usuarios."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            user_to_delete = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response(
                {"success": False, "message": "El usuario no existe."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user_to_delete.id == user.id:
            return Response(
                {"success": False, "message": "No podés eliminarte a vos mismo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        username_deleted = user_to_delete.username
        user_to_delete.delete()

        return Response(
            {
                "success": True,
                "message": f"Usuario '{username_deleted}' eliminado correctamente.",
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], url_path="get-ask-for-pin")
    def get_ask_for_pin(self, request):
        return Response({"askForPin": request.user.askForPin}, status=200)

    @action(detail=False, methods=["patch"], url_path="ask-for-pin")
    def update_ask_for_pin(self, request):
        """Updates CustomUser.askForPin for a specific user"""
        user = request.user

        if not hasattr(user, "role") or user.role.name != "administrator":
            return Response(
                {"detail": "No tenés permisos para modificar este valor."},
                status=status.HTTP_403_FORBIDDEN,
            )

        ask_for_pin = request.data.get("askForPin")
        if not isinstance(ask_for_pin, bool):
            return Response(
                {"detail": "askForPin debe ser booleano."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        print(ask_for_pin)

        target_users = CustomUser.objects.all()

        for target_user in target_users:
            target_user.askForPin = ask_for_pin
            target_user.save(update_fields=["askForPin"])

        return Response(
            {"success": True, "askForPinValue": ask_for_pin},
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="get-are-users-allowed-to-decide-stock-decrease",
    )
    def get_are_users_allowed_to_decide_stock_decrease(self, request):
        return Response(
            {"areUsersAllowedValue": request.user.allowed_to_decide_stock_decrease},
            status=200,
        )

    @action(
        detail=False,
        methods=["patch"],
        url_path="update-are-users-allowed-stock-decrease",
    )
    def update_are_users_allowed_stock_decrease(self, request):
        user = request.user

        if not hasattr(user, "role") or user.role.name != "administrator":
            return Response(
                {"detail": "No tenés permisos para modificar este valor."},
                status=status.HTTP_403_FORBIDDEN,
            )

        areUsersAllowed = request.data.get("areUsersAllowed")
        if not isinstance(areUsersAllowed, bool):
            return Response(
                {"detail": "areUsersAllowed debe ser booleano."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_users = CustomUser.objects.all()

        for target_user in target_users:
            target_user.allowed_to_decide_stock_decrease = areUsersAllowed
            target_user.save(update_fields=["allowed_to_decide_stock_decrease"])

        return Response(
            {"success": True, "areUsersAllowedValue": areUsersAllowed},
            status=status.HTTP_200_OK,
        )
