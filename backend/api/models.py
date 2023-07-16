from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
from django.contrib.auth.validators import ASCIIUsernameValidator
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email: str, username: str, password: str = None):
        if not email:
            raise ValueError('Email must not be empty')
        user = self.model(username=username, email=self.normalize_email(email))
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email: str, username: str, password: str = None):
        user = self.create_user(email, username, password)
        user.is_superuser = True
        user.is_staff = True
        user.save()
        return user


class User(AbstractBaseUser, PermissionsMixin):
    username_validator = ASCIIUsernameValidator()
    username = models.CharField(max_length=40, unique=True, validators=[username_validator])
    email = models.EmailField(max_length=255, unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    objects = UserManager()

    USERNAME_FIELD = 'username'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['email']

    class Meta:
        ordering = ['id']

    def clean(self):
        super().clean()
        self.email = self.__class__.objects.normalize_email(self.email)

    def get_full_name(self):
        return str(self.username).strip()

    def get_short_name(self):
        return str(self.username).strip()


class Message(models.Model):
    text = models.CharField(max_length=250)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True,
                               related_name='children')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    favorited_by = models.ManyToManyField(User, related_name='favorites')
    created = models.DateTimeField(auto_now_add=True)
    objects = models.Manager()
