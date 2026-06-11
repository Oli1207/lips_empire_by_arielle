from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("base", "0014_analytics_geo_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="cartorder",
            name="postage_type",
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]
