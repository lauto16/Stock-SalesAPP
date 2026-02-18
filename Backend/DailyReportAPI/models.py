from django.utils import timezone
from django.db import transaction
from django.db.models import F
from django.db import models
from decimal import Decimal

class DailyReport(models.Model):
    """
    Represents a comparison between the daily gain and loss
    """

    gain = models.DecimalField(
        max_digits=15, decimal_places=2, default=0, verbose_name="ganancia"
    )

    loss = models.DecimalField(
        max_digits=15, decimal_places=2, default=0, verbose_name="perdida"
    )
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

    @property
    def is_todays(self) -> bool:
        """
        Returns True if this report belongs to today
        """
        today = timezone.localdate()
        return self.created_at == today

    def _add_gain(self, amount: int | float):
        """
        Adds a gain to a certain DailyReport avoiding concurrency problems using F

        Args:
            amount (int | float)
        """
        amount = Decimal(str(amount))
        DailyReport.objects.filter(pk=self.pk).update(gain=F("gain") + amount)

    def _add_loss(self, amount: int | float):
        """
        Adds a loss to a certain DailyReport avoiding concurrency problems using F

        Args:
            amount (int | float)
        """
        amount = Decimal(str(amount))
        DailyReport.objects.filter(pk=self.pk).update(loss=F("loss") + amount)

    def _remove_loss(self, amount: int | float):
        """
        Removes loss. If loss goes below 0, overflow becomes gain.
        """
        amount = Decimal(str(amount))
        with transaction.atomic():
            report = DailyReport.objects.select_for_update().get(pk=self.pk)

            new_loss = report.loss - amount

            if new_loss >= 0:
                report.loss = new_loss
            else:
                overflow = abs(new_loss)
                report.loss = 0
                report.gain += overflow

            report.save(update_fields=["gain", "loss"])

    def _remove_gain(self, amount: int | float):
        """
        Removes gain. If gain goes below 0, overflow becomes loss.
        """
        amount = Decimal(str(amount))
        with transaction.atomic():
            report = DailyReport.objects.select_for_update().get(pk=self.pk)

            new_gain = report.gain - amount

            if new_gain >= 0:
                report.gain = new_gain
            else:
                overflow = abs(new_gain)
                report.gain = 0
                report.loss += overflow

            report.save(update_fields=["gain", "loss"])

    def apply_amount(
        self, amount: float | int, remove_gain=False, remove_loss=False
    ) -> None:
        """
        Decides if the value is a loss or a gain and adds it to it's respective field

        Args:
            amount (float | int)
            The following parameters can be used in case of sale returns, entry deletions or any scenario like the mentioned.
            remove_gain (bool): defaults to False, when True, removes an amount of gain to the daily report
            remove_loss (bool): defaults to False, when True, removes an amount of loss to the daily report
        """
        if amount == 0:
            return

        if remove_gain:
            self._remove_gain(amount)
            return

        elif remove_loss:
            self._remove_loss(amount)
            return

        if amount > 0:
            self._add_gain(amount)

        elif amount < 0:
            self._add_loss(abs(amount))

    class Meta:
        verbose_name = "Reporte financiero"
        verbose_name_plural = "reportes financieros diarios"
