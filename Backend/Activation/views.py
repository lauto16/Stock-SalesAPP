from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.viewsets import ViewSet
from datetime import datetime, timedelta
from django.http import JsonResponse
from .key_tester import test_key
import json
import os


class ActivationViewSet(ViewSet):
    permission_classes = [IsAuthenticated]

    TRIAL_DAYS = 15 

    @action(detail=False, methods=['post'], url_path='activate')
    def activate(self, request):
        key = request.data.get("key")
        if not test_key(key):
            return JsonResponse({'success': False, 'error': "Clave incorrecta."})
        
        try:
            file_path = os.path.join(os.getcwd(), "activated.json")
            
            with open(file_path, "r") as f:
                data = json.load(f)

            data["activated"] = True
            data["free_trial_init"] = datetime.now().strftime("%d/%m/%Y")

            with open(file_path, "w") as f:
                json.dump(data, f, indent=4)

            is_activated = data.get("activated", False)
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