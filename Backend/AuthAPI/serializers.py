from rest_framework import serializers

class SignupSerializer(serializers.Serializer):
    """
    Serializes the necessary data to create a CustomUser
    """
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)
    pin = serializers.RegexField(regex=r'^\d{4}$', max_length=4, min_length=4)
    role = serializers.CharField(max_length=20)