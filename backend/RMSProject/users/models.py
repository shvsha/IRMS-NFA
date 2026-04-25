from django.db import models
import random
from django.utils import timezone

class User (models.Model):
    USER_LEVEL_CHOICES = [
        ('Admin', 'Admin'),
        ('Warehouse Supervisor', 'Warehouse Supervisor'),
    ]
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    ]

    user_id = models.AutoField(primary_key= True)
    fname =  models.CharField(max_length=100)
    mI =  models.CharField(max_length=5, blank=True)
    lname =  models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    user_level = models.CharField(max_length=50, choices=USER_LEVEL_CHOICES, default='Warehouse Supervisor')

    dept = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    WHCode = models.CharField(max_length=20)
    Office_id = models.CharField(max_length=50)

    # for auth (credentials)
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Active')


    @property 
    def full_name(self):
        if self.mI:
            return f"{self.fname} {self.mI} {self.lname}"
        return f"{self.fname} {self.lname}"
    def __str__(self):
        return self.full_name

class PasswordResetCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.created_at + timezone.timedelta(minutes=10)