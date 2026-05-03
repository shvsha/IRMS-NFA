from django.db import models
from django.utils import timezone


class User(models.Model):
    USER_LEVEL_CHOICES = [
        ('Admin',                'Admin'),
        ('Warehouse Supervisor', 'Warehouse Supervisor'),
        ('Signatory',            'Signatory'),
    ]

    SIGNATORY_ROLE_CHOICES = [
        ('Asst. Branch Manager', 'Asst. Branch Manager'),
        ('Accountant 3',         'Accountant 3'),
        ('Branch Manager',       'Branch Manager'),
    ]
    
    STATUS_CHOICES = [
        ('Active',   'Active'),
        ('Inactive', 'Inactive'),
    ]

    user_id = models.AutoField(primary_key=True)
    fname = models.CharField(max_length=100)
    mI = models.CharField(max_length=5, blank=True)
    lname = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    user_level = models.CharField(max_length=50, choices=USER_LEVEL_CHOICES, default='Warehouse Supervisor')

    dept = models.CharField(max_length=100, blank=True)
    position = models.CharField(max_length=100, blank=True)
    signatory_role = models.CharField( # for signatory only
        max_length=100,
        choices=SIGNATORY_ROLE_CHOICES,
        blank=True,
        null=True
    )
    WHCode = models.CharField(max_length=20, blank=True)
    Office_id = models.CharField(max_length=50, blank=True)

    e_signature = models.ImageField(upload_to='signatures/', null=True, blank=True)

    # Auth
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Active')

    @property
    def is_signatory(self):
        return self.user_level == 'Signatory'

    @property
    def full_name(self):
        if self.mI:
            return f"{self.fname} {self.mI}. {self.lname}"
        return f"{self.fname} {self.lname}"

    def __str__(self):
        return self.full_name


class PasswordResetCode(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE)
    code       = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used    = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.created_at + timezone.timedelta(minutes=10)