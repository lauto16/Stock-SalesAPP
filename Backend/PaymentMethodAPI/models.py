from django.db import models

class PaymentMethod(models.Model):
    name = models.CharField(max_length=200, primary_key=True, verbose_name='nombre')
    
    class Meta:
        verbose_name = 'método de pago'
        verbose_name_plural ='metodos de pago'
