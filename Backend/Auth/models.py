from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class CustomUserManager(BaseUserManager):
    """
    Manager for creating CustomUser instances
    """
    def create_user(self, username, password=None, role_name='salesperson', **extra_fields):
        if not username:
            raise ValueError('El usuario debe tener un nombre de usuario')

        try:
            role = Role.objects.get(name=role_name)
        except Role.DoesNotExist:
            raise ValueError(f"El rol '{role_name}' no existe")

        user = self.model(username=username, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(username, password, role_name='administrator', **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Represents a system's user 
    """
    username = models.CharField(max_length=150, unique=True, verbose_name='nombre')
    role = models.ForeignKey('Role', on_delete=models.PROTECT, verbose_name='rol')
    pin = models.CharField(max_length=5, verbose_name='pin')
    is_active = models.BooleanField(default=True, verbose_name='está activo')
    is_staff = models.BooleanField(default=False, verbose_name='es staff')
    askForPin = models.BooleanField(default=True, verbose_name='pedir pin')
    objects = CustomUserManager()

    class Meta:
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    def save(self, *args, **kwargs):
        if self.pk is None:
            first_user = CustomUser.objects.first()
            if first_user:
                self.askForPin = first_user.askForPin
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"{self.username} ({self.role})"


class CustomPermission(models.Model):
    """A permission to do something such as entering restricted views or changing potencially 
    important or secret content"""
    code_name = models.CharField(max_length=200, unique=True, null=False, blank=False)
    description = models.CharField(max_length=500, unique=False, null=True, blank=True)


class Role(models.Model):
    """
    Solution for giving each user a role
    """
    ROLE_CHOICES = [
        ('salesperson', 'Vendedor'),
        ('stocker', 'Repositor'),
        ('administrator', 'Administrador'),
        ('salesperson_stocker', 'Vendedor y repositor')
    ]

    name = models.CharField(max_length=20, choices=ROLE_CHOICES, unique=True, verbose_name='nombre')
    name_sp = models.CharField(max_length=20, unique=True, verbose_name='nombre_esp')
    permissions = models.ManyToManyField(
        CustomPermission,
        related_name='roles',
        blank=True, 
        verbose_name='permisos'
    
    )
    
    class Meta:
        verbose_name = "rol"
        verbose_name_plural = "roles"

    def __str__(self):
        return dict(self.ROLE_CHOICES).get(self.name, self.name)