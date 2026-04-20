from django.db import models

# Create your models here.
class AuditLog(models.Model):
    #audit id as PK/Unique Identifier
    Audit_id = models.AutoField(primary_key=True)

    #user id as fk
    User_ID = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='audit_logs',
        blank=True, null=True
    )

    # Date audited and Time audited
    Date_audited = models.DateField(auto_now_add=True)
    Time_audited = models.TimeField(auto_now_add=True)

    #Module - where action was made
    Module = models.CharField(
        max_length=100, 
        blank=True, null=True
    )

    #Action - what action has been done
    Action = models.CharField(
        max_length=255, 
        blank=True, null=True
    )

    # Properties
    @property
    def Name(self):
        return self.User_ID.full_name if self.User_ID else '-'
    
    @property
    def Position(self):
        if self.User_ID:
            return self.User_ID.position 
        return None

    def __str__(self):
        return f"Audit {self.Audit_id} - {self.User_ID} - {self.Action} ({self.Date_audited})"

    class Meta:
        db_table = 'tbl_audit'
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"


def create_audit_entry(user, module, action):
    return AuditLog.objects.create(
        User_ID=user,
        Module=module,
        Action=action
    )
