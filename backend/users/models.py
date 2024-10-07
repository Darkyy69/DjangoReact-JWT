from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import validate_email
from users.validators import validate_email_domain
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
# Create your models here.


class CustomUserManager(BaseUserManager):
    def email_validator(self, email):
        try:
            validate_email(email)
            validate_email_domain(email)
        except ValidationError:
            raise ValueError('You must provide a valid email address')
    
    def create_user(self, email, password, **extrafields):
        if not email:
            raise ValueError(_('The Email field must be set'))
        if not password:
            raise ValueError(_('The Password field must be set'))
        
        email = self.normalize_email(email)
        self.email_validator(email)

        user = self.model(email=email, **extrafields)
        user.set_password(password)
        extrafields.setdefault('is_staff', False)
        extrafields.setdefault('is_superuser', False)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('L\'utilisateur superadmin doit avoir is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('L\'utilisateur superadmin doit avoir is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)   
    

class CustomUser(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)
    username = None
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = CustomUserManager()

    def __str__(self):
        return self.email