from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

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

    @action(detail=False, methods=["get"], url_path="unseen")
    def get_unseen(self, request):
        """
        Returns notifications that have not been seen yet.
        """
        notifications = Notification.objects.filter(seen=False)
        serializer = self.get_serializer(notifications, many=True)

        return self.success_response(
            serializer.data,
            status.HTTP_200_OK
        )

    @action(detail=True, methods=["post"], url_path="mark_as_seen")
    def mark_as_seen(self, request, pk=None):
        """
        Marks a notification as seen.
        """
        try:
            notification = self.get_object()
        except Exception:
            return self.error_response(
                "La notificación no existe.",
                status.HTTP_404_NOT_FOUND
            )

        notification.mark_as_seen()

        return self.success_response(
            {"id": notification.id, "seen": True},
            status.HTTP_200_OK
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return self.error_response(
                str(serializer.errors),
                status.HTTP_400_BAD_REQUEST
            )

        serializer.save(seen=False)
        return self.success_response(
            serializer.data,
            status.HTTP_201_CREATED
        )

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return self.error_response(
                "La notificación no existe.",
                status.HTTP_404_NOT_FOUND
            )

        instance.delete()
        return self.success_response(
            None,
            status.HTTP_204_NO_CONTENT
        )