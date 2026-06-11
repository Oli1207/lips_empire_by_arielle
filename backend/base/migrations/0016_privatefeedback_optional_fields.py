from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("base", "0015_cartorder_postage_type"),
    ]

    operations = [
        migrations.AlterField(
            model_name="privatefeedback",
            name="name",
            field=models.CharField(blank=True, default="Anonyme", max_length=100),
        ),
        migrations.AlterField(
            model_name="privatefeedback",
            name="email",
            field=models.EmailField(blank=True, default=""),
        ),
    ]
