from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='student_id',
            field=models.CharField(blank=True, max_length=30, null=True, unique=True),
        ),
    ]
