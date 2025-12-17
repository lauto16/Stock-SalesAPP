from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Category
from .serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def success_response(self, data=None, status_code=status.HTTP_200_OK):
        return Response({
            "success": True,
            "error": "",
            "data": data
        }, status=status_code)

    def error_response(self, message, status_code):
        return Response({
            "success": False,
            "error": message
        }, status=status_code)

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return self.success_response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return self.error_response(
                "La categoría solicitada no existe.",
                status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(instance)
        return self.success_response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            # DRF devuelve dict, lo convertimos a string legible
            return self.error_response(
                str(serializer.errors),
                status.HTTP_400_BAD_REQUEST
            )

        serializer.save()
        return self.success_response(
            serializer.data,
            status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return self.error_response(
                "La categoría no existe.",
                status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(instance, data=request.data)

        if not serializer.is_valid():
            return self.error_response(
                str(serializer.errors),
                status.HTTP_400_BAD_REQUEST
            )

        serializer.save()
        return self.success_response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return self.error_response(
                "La categoría no existe.",
                status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(
            instance, data=request.data, partial=True
        )

        if not serializer.is_valid():
            return self.error_response(
                str(serializer.errors),
                status.HTTP_400_BAD_REQUEST
            )

        serializer.save()
        return self.success_response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return self.error_response(
                "La categoría no existe.",
                status.HTTP_404_NOT_FOUND
            )

        instance.delete()
        return self.success_response(
            None,
            status.HTTP_204_NO_CONTENT
        )
    