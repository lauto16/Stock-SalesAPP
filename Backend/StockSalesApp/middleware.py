from django.conf import settings
import threading
import traceback
import requests


class Error500PostMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        print(str(settings.ERROR_500_API_KEY))
        payload = {
            "path": request.path,
            "method": request.method,
            "user": str(request.user),
            "ip": request.META.get("REMOTE_ADDR"),
            "key": str(settings.ERROR_500_API_KEY),
            "get": dict(request.GET),
            "post": dict(request.POST),
            "error": str(exception),
            "traceback": traceback.format_exc(),
        }

        threading.Thread(target=self.send_post, args=(payload,)).start()

        return None

    def send_post(self, payload):
        try:
            requests.post(
                settings.ERROR_500_WEBHOOK_URL,
                json=payload,
                headers={
                    "X-API-Key": settings.ERROR_500_API_KEY,
                    "Content-Type": "application/json",
                },
                timeout=3,
            )
        except Exception as e:
            print(e)
            pass
