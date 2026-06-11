import hmac
import hashlib
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from base.models import CartOrder


def make_review_token(order_oid, email):
    key = settings.SECRET_KEY.encode()
    msg = f"{order_oid}:{email}".encode()
    return hmac.new(key, msg, hashlib.sha256).hexdigest()


SITE_URL = 'https://lipsempirebyarielle.store'
REMINDER_DAYS = 7


class Command(BaseCommand):
    help = "Envoie les emails de demande d'avis et rappels pour les commandes livrées."

    def handle(self, *args, **options):
        now = timezone.now()

        # Email initial (J+2 après Fulfilled)
        due_initial = CartOrder.objects.filter(
            review_email_scheduled_at__lte=now,
            review_email_sent=False,
            order_status='Fulfilled',
            email__isnull=False,
        ).exclude(email='')

        for order in due_initial:
            token = make_review_token(order.oid, order.email)
            review_url = f"{SITE_URL}/review?token={token}&order={order.oid}"
            feedback_url = f"{SITE_URL}/feedback?token={token}&order={order.oid}"
            context = {
                'name': order.full_name.split()[0] if order.full_name else 'chère cliente',
                'review_url': review_url,
                'feedback_url': feedback_url,
                'order': order,
                'items': order.orderitem(),
            }
            html = render_to_string('email/review_request.html', context)
            try:
                send_mail(
                    subject="Comment s'est passée votre commande ? Donnez votre avis",
                    message='',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[order.email],
                    html_message=html,
                    fail_silently=False,
                )
                order.review_email_sent = True
                order.save(update_fields=['review_email_sent'])
                self.stdout.write(f"Email avis envoyé : {order.email} ({order.oid})")
            except Exception as e:
                self.stderr.write(f"Erreur email {order.email}: {e}")

        # Email rappel (J+7 après le premier email, si pas d'avis laissé)
        from base.models import Review
        reminder_threshold = now - timezone.timedelta(days=REMINDER_DAYS)
        due_reminder = CartOrder.objects.filter(
            review_email_sent=True,
            reminder_email_sent=False,
            order_status='Fulfilled',
            email__isnull=False,
        ).exclude(email='').filter(
            review_email_scheduled_at__lte=reminder_threshold
        )

        for order in due_reminder:
            has_review = Review.objects.filter(order=order).exists()
            if has_review:
                order.reminder_email_sent = True
                order.save(update_fields=['reminder_email_sent'])
                continue

            token = make_review_token(order.oid, order.email)
            review_url = f"{SITE_URL}/review?token={token}&order={order.oid}"
            feedback_url = f"{SITE_URL}/feedback?token={token}&order={order.oid}"
            context = {
                'name': order.full_name.split()[0] if order.full_name else 'chère cliente',
                'review_url': review_url,
                'feedback_url': feedback_url,
                'order': order,
                'items': order.orderitem(),
            }
            html = render_to_string('email/review_reminder.html', context)
            try:
                send_mail(
                    subject="Votre avis nous tient vraiment à coeur",
                    message='',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[order.email],
                    html_message=html,
                    fail_silently=False,
                )
                order.reminder_email_sent = True
                order.save(update_fields=['reminder_email_sent'])
                self.stdout.write(f"Email rappel envoyé : {order.email} ({order.oid})")
            except Exception as e:
                self.stderr.write(f"Erreur rappel {order.email}: {e}")
