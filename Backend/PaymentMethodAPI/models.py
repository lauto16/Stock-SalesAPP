from django.db import models

class PaymentMethod(models.Model):
    name = models.CharField(max_length=200, primary_key=True)
