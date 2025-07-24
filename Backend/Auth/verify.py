from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import CustomUser, Role
from django.http import HttpRequest



class AuthVerifyer:
    def __init__(self) -> None:
        pass

    @staticmethod
    def verifyUserPin(user_pin: str, user: CustomUser) -> bool:
        """
        Verifies if an user has the right pin
        Returns:
            CustomUser: if the pin is right
            None: if the pin is incorrect
        """
        return user.pin == user_pin

        

    @staticmethod
    def verifyAuthenticity(request: HttpRequest, username: str, password: str) -> (User | None):
        """
        Verifies if an user exists based on his credentials
        Returns:
            User: if user exists
            None: if user does not exists
        """
        return authenticate(request, username=username, password=password)
