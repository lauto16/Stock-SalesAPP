from django.db import models


class Notification(models.Model):

    class Subject(models.TextChoices):
        """
        Helper class to define a Notification subject (what is the notification about)
        """
        STOCK = "STOCK", "Stock"
        EXPIRATION = "EXP", "Vencimiento"

    name = models.CharField(max_length=200)
    subject = models.CharField(
        max_length=10,
        choices=Subject.choices
    )
    text = models.TextField()
    seen = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def mark_as_seen(self):
        self.seen = True
        self.save(update_fields=["seen"])

    def is_sent(self) -> bool:
        return self.seen