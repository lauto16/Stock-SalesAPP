from django.db import models


class Provider(models.Model):
    """
    Represents a single provider
    """
    name = models.CharField(max_length=100, default='')
    phone = models.CharField(max_length=20, blank=True,
                             null=True, default='')
    address = models.CharField(
        max_length=200, blank=True, null=True,  default="")

    email = models.EmailField(
        max_length=200, blank=True, null=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


def save(self, args, **kwargs):
    if not self.name:  # None o ""
        self.name = self._meta.get_field('name').default
    if not self.phone:
        self.phone = self._meta.get_field('phone').default
    if not self.address:
        self.address = self._meta.get_field('address').default
    if not self.email:
        self.email = self._meta.get_field('email').default
    super().save(args, **kwargs)
