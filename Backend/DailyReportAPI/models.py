from django.utils import timezone
from django.db.models import F
from django.db import models


class DailyReport(models.Model):
    """
    Represents a comparison between the daily gain and loss
    """

    gain = models.FloatField(default=0, null=True, blank=True, verbose_name="ganancia")
    loss = models.FloatField(default=0, null=True, blank=True, verbose_name="perdida")
    created_at = models.DateField(unique=True, verbose_name="fecha", auto_now_add=True)
 
    @staticmethod
    def get_or_create_today_report():
        """
        Returns today's DailyReport instance.

        Returns:
            DailyReport: today's report
        """
        today = timezone.localdate()
        report, _ = DailyReport.objects.get_or_create(created_at=today)
        return report

    @property
    def profit(self) -> float:
        """
        Property to know if there's a loss or a gain on a certain report

        Returns:
            float: gain / loss
        """
        return self.gain - self.loss

    def _add_gain(self, amount: int | float):
        """
        Adds a gain to a certain DailyReport avoiding concurrency problems using F

        Args:
            amount (int | float)
        """
        DailyReport.objects.filter(pk=self.pk).update(gain=F("gain") + amount)

    def _add_loss(self, amount: int | float):
        """
        Adds a loss to a certain DailyReport avoiding concurrency problems using F

        Args:
            amount (int | float)
        """
        DailyReport.objects.filter(pk=self.pk).update(loss=F("loss") + amount)

    def apply_amount(self, amount: float | int) -> None:
        """
        Decides if the value is a loss or a gain and adds it to it's respective field

        Args:
            amount (float | int)
        """
        if amount == 0:
            return
        
        if amount > 0:
            self._add_gain(amount)
            
        elif amount < 0:
            self._add_loss(abs(amount))
            
    
    class Meta:
        verbose_name = "Reporte financiero"
        verbose_name_plural = "reportes financieros diarios"
