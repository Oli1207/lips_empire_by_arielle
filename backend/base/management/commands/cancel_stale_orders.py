from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
import datetime


class Command(BaseCommand):
    help = "Cancel pending orders older than 2 hours and restore stock"

    def add_arguments(self, parser):
        parser.add_argument(
            "--hours",
            type=int,
            default=2,
            help="Hours after which a pending order is considered abandoned (default: 2)",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be cancelled without doing it",
        )

    def handle(self, *args, **options):
        from base.models import CartOrder, CartOrderItem

        hours = options["hours"]
        dry_run = options["dry_run"]
        cutoff = timezone.now() - datetime.timedelta(hours=hours)

        stale = CartOrder.objects.filter(
            payment_status="pending",
            date__lt=cutoff,
        ).prefetch_related("cartorderitem_set__product")

        count = stale.count()
        if count == 0:
            self.stdout.write(self.style.SUCCESS("No stale orders found."))
            return

        self.stdout.write(f"Found {count} stale order(s) to cancel.")

        if dry_run:
            for order in stale:
                self.stdout.write(f"  [DRY] Would cancel order {order.oid} (created {order.date})")
            return

        cancelled = 0
        for order in stale:
            with transaction.atomic():
                items = CartOrderItem.objects.filter(order=order).select_related("product")
                for item in items:
                    item.product.stock_qty += item.qty
                    item.product.save(update_fields=["stock_qty"])
                order.payment_status = "cancelled"
                order.order_status = "Cancelled"
                order.save(update_fields=["payment_status", "order_status"])
                cancelled += 1
                self.stdout.write(f"  Cancelled order {order.oid} — restored {items.count()} item(s)")

        self.stdout.write(self.style.SUCCESS(f"Done. {cancelled} order(s) cancelled and stock restored."))
