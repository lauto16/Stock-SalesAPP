from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ViewSet
from datetime import datetime, timedelta
from django.http import JsonResponse
import json
import os


class ActivationViewSet(ViewSet):
    permission_classes = [IsAuthenticated]

    TRIAL_DAYS = 15 

    def list(self, request):
        try:
            file_path = os.path.join(os.getcwd(), "activated.json")

            with open(file_path, "r") as f:
                data = json.load(f)

            is_activated = data.get("activated", True)
            remaining_seconds = 0

            free_trial_init = data.get("free_trial_init", "")

            if free_trial_init:
                try:
                    start_date = datetime.strptime(free_trial_init, "%d/%m/%Y")
                    end_date = start_date + timedelta(days=self.TRIAL_DAYS)
                    now = datetime.now()

                    delta = end_date - now
                    remaining_seconds = max(int(delta.total_seconds()), 0)

                except Exception as parse_error:
                    print("Error parsing date:", parse_error)
                    remaining_seconds = 0

            return JsonResponse({
                "isActivated": is_activated,
                "remainingTime": remaining_seconds
            })

        except Exception as e:
            print(e)
            return JsonResponse({
                "isActivated": True,
                "remainingTime": 0
            })