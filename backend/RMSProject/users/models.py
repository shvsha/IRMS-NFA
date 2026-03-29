from django.db import models

# Create your models here.
class User (models.Model):
    user_id = models.AutoField(primary_key= True)
    fname =  models.CharField(max_length=50)
    mI =  models.CharField(max_length=1, blank=True, null=True)
    lname =  models.CharField(max_length=50)
    position = models.CharField(max_length=50)
    email = models.CharField(max_length=50)

    # for auth
    username = models.CharField(max_length=50)
    password = models.CharField(max_length=50)

    WHCode = models.CharField(max_length=15)
    Office_id = models.CharField(max_length=15)
    dept = models.CharField(max_length=50)
    status = models.CharField(max_length=50)
    user_level = models.CharField(max_length=50)

    @property 
    def full_name(self):
        if self.mI:
            return f"{self.fname} {self.mI} {self.lname}"
        return f"{self.fname} {self.lname}"
    def __str__(self):
        return self.full_name