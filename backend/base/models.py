from django.db import models
from django.contrib.auth.models import AbstractUser
from shortuuid.django_fields import ShortUUIDField
from django.utils.text import slugify

from django.db.models.signals import post_save
from django.dispatch import receiver
from ckeditor.fields import RichTextField



class User(AbstractUser):
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100, null=True, blank=True)
    phone = models.CharField(max_length=100, blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
    
    def save(self, *args, **kwargs):
        email_username, mobile = self.email.split('@')
        if self.full_name == "" or self.full_name == None:
            self.full_name = email_username
        if self.username == "" or self.username == None:
            self.username = email_username
        super(User, self).save(*args, **kwargs)

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.FileField(upload_to="users/profile_pic", default="default/default.png", null=True, blank=True)
    full_name = models.CharField(max_length=100, null=True, blank=True)
    about = models.TextField(null=True, blank=True)
    gender = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    address = models.CharField(max_length=100, null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)
    pid = ShortUUIDField(unique=True, length=10, max_length=20, alphabet="abcdefghijklmnopqrstuvwxyz")

    def __str__(self):
        if self.full_name:
            return str(self.full_name)
        else:
            return str(self.user.full_name)

    def save(self, *args, **kwargs):
        if self.full_name == "" or self.full_name == None:
            self.full_name = self.user.full_name
        super(Profile, self).save(*args, **kwargs)


class Category(models.Model):
    title = models.CharField(max_length=100)
    image = models.FileField(upload_to="category", default="category.jpg", blank=True, null=True)
    active = models.BooleanField(default=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['-title']

class Product(models.Model):
    STATUS = (
        ("rupture", "Rupture"),
        ("en_attente", "En Attente"),
        ("disponible", "Disponible"),
    )
    title = models.CharField(max_length=100)
    image = models.FileField(upload_to="category", default="category.jpg", blank=True, null=True)
    description = RichTextField(null=True, blank=True)
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True)
    price = models.DecimalField(decimal_places=2, max_digits=12, default=0.00)
    old_price = models.DecimalField(decimal_places=2, max_digits=12, default=0.00)
    qbo_item_id = models.CharField(max_length=100, blank=True, null=True)
    shipping_amount = models.DecimalField(decimal_places=2, max_digits=12, default=0.00)
    stock_qty = models.PositiveIntegerField(default=1)
    in_stock = models.BooleanField(default=True)
    status = models.CharField(max_length=100, choices=STATUS, default="disponible")
    views = models.PositiveIntegerField(default=0)

    pid = ShortUUIDField(unique=True, length=10, prefix="findit", alphabet="abcdefghijklmnopqrstuvwxyz")
    slug = models.SlugField(unique=True)
    date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
        self._compress_image()

    def _compress_image(self):
        if not self.image or not hasattr(self.image, 'path'):
            return
        try:
            from PIL import Image as PilImage
            import os
            path = self.image.path
            if not os.path.exists(path):
                return
            _, ext = os.path.splitext(path)
            if ext.lower() == '.webp':
                return
            with PilImage.open(path) as img:
                img = img.convert('RGB')
                max_dim = 1200
                if img.width > max_dim or img.height > max_dim:
                    img.thumbnail((max_dim, max_dim), PilImage.LANCZOS)
                webp_path = os.path.splitext(path)[0] + '.webp'
                img.save(webp_path, 'WEBP', quality=82, method=6)
            new_name = os.path.splitext(self.image.name)[0] + '.webp'
            os.remove(path)
            Product.objects.filter(pk=self.pk).update(image=new_name)
        except Exception:
            pass

    def __str__(self):
        return self.title

    def gallery(self):
        return Gallery.objects.filter(product=self)

    def specification(self):
        return Specification.objects.filter(product=self)

    def color(self):
        return Color.objects.filter(product=self)

class Gallery(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    image = models.FileField(upload_to="products", default="products.jpg")
    active = models.BooleanField(default=True)
    gid = ShortUUIDField(unique=True, alphabet="abcdefghijklmnopqrstuvwxyz", prefix="finditgallery")

    def __str__(self):
        return self.product.title

    class Meta:
        verbose_name_plural = "Galleries"



class Specification(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    title = models.CharField(max_length=1000)
    content = RichTextField(null=True, blank=True)

    def __str__(self):
        return self.title



class Color(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    name = models.CharField(max_length=1000)
    color_code = models.CharField(max_length=1000)

    def __str__(self):
        return self.name

class Cart(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    qty = models.PositiveIntegerField(default=0)
    price = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    sub_total = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    shipping_amount = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    service_fee = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    tax_fee = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    total = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    country = models.CharField(max_length=100, null=True, blank=True)
    size = models.CharField(max_length=100, null=True, blank=True)
    cart_id = models.CharField(max_length=1000, null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.cart_id} - {self.product.title}"

class CartOrder(models.Model):
    PAYMENT_STATUS = (
        ("paid", "Paid"),
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("cancelled", "Cancelled"),
    )
    ORDER_STATUS = (
        ("Pending", "Pending"),
        ("Fulfilled", "Fulfilled"),
        ("Cancelled", "Cancelled"),
    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    sub_total = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    shipping_amount = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    service_fee = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    tax_fee = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    total = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    payment_status = models.CharField(choices=PAYMENT_STATUS, max_length=100, default="pending")
    order_status = models.CharField(choices=ORDER_STATUS, max_length=100, default="Pending")
    initial_total = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    saved = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    full_name = models.CharField(max_length=100, null=True, blank=True)
    email = models.EmailField(max_length=100, null=True, blank=True)
    mobile = models.CharField(max_length=100, null=True, blank=True)
    address = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    postal_code = models.CharField(max_length=100, null=True, blank=True)
    shipment_id =  models.CharField(max_length=1000, null=True, blank=True)
    stripe_session_id = models.CharField(max_length=1000, null=True, blank=True)
    qbo_invoice_id = models.CharField(max_length=1000, null=True, blank=True)
    oid = ShortUUIDField(unique=True, length=10, alphabet="abcdefghijklmnopqrstuvwxyz")
    date  = models.DateTimeField(auto_now_add=True)
    terms_accepted = models.BooleanField(default=False)
    review_email_scheduled_at = models.DateTimeField(null=True, blank=True)
    review_email_sent = models.BooleanField(default=False)
    reminder_email_sent = models.BooleanField(default=False)

    def __str__(self):
        return self.oid

    def orderitem(self):
        return CartOrderItem.objects.filter(order=self)

class CartOrderItem(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    order = models.ForeignKey(CartOrder, on_delete=models.CASCADE, null=True, blank=True)
    qty = models.PositiveIntegerField(default=0)
    price = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    sub_total = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    shipping_amount = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    service_fee = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    tax_fee = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    country = models.CharField(max_length=100, null=True, blank=True)
    

    coupon = models.ManyToManyField("base.Coupon", blank=True)
    initial_total = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    saved = models.DecimalField(default=0.00, max_digits=12, decimal_places=2)
    oid = ShortUUIDField(unique=True, length=10, alphabet="abcdefghijklmnopqrstuvwxyz")
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Grand Total of all amount listed above")
    
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.oid


class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.product.title

class Coupon(models.Model):
    code = models.CharField(max_length=1000)
    discount = models.IntegerField(default=1)
    active = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code


class Tax(models.Model):
    country = models.CharField(max_length=100)
    rate = models.IntegerField(default=5, help_text="Numbers added here are in percentage e.g 5%")
    active = models.BooleanField(default=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.country
    
    class Meta:
        verbose_name_plural = "Taxes"
        ordering = ['country']

class Contact(models.Model):
    name = models.CharField(max_length=100, null=True, blank=True, default="Inconnu")
    email = models.EmailField(null=True, blank=True, default="Pas d'email")
    subject = models.CharField(max_length=200, null=True, blank=True, default="Demande d'abonnement")
    message = models.TextField(null=True, blank=True, default="Pas de message")

    def __str__(self):
        return f'{self.email} - {self.subject}'
    
    

class Review(models.Model):
    RATING = (
        (1, "1 Star"),
        (2, "2 Star"),
        (3, "3 Star"),
        (4, "4 Star"),
        (5, "5 Star"),
    )
    STATUS = (
        ('pending', 'En attente'),
        ('approved', 'Approuvé'),
        ('rejected', 'Rejeté'),
    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    order = models.ForeignKey('CartOrder', on_delete=models.SET_NULL, null=True, blank=True, related_name='reviews')
    reviewer_name = models.CharField(max_length=100, blank=True)
    reviewer_email = models.EmailField(blank=True)
    review = models.TextField()
    reply = models.TextField(null=True, blank=True)
    rating = models.IntegerField(default=None, choices=RATING)
    active = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS, default='pending')
    is_verified_purchase = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    is_global = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.product.title if self.product else f"Avis global — {self.reviewer_name or self.user}"

    class Meta:
        verbose_name_plural = "Reviews & Rating"


class ReviewPhoto(models.Model):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='review_photos/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo avis #{self.review_id}"


class PrivateFeedback(models.Model):
    order = models.ForeignKey(CartOrder, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} — {self.created_at.date()}"

    class Meta:
        verbose_name_plural = "Feedbacks privés"
        ordering = ['-created_at']

    def profile(self):
        return Profile.objects.get(user=self.user)

@receiver(post_save, sender=Review)
def update_product_rating(sender, instance, **kwargs):
    if instance.product:
        instance.product.save()


@receiver(post_save, sender=Product)
def check_low_stock(sender, instance, **kwargs):
    LOW_STOCK_THRESHOLD = 3
    if instance.stock_qty > LOW_STOCK_THRESHOLD:
        return
    from django.utils import timezone as tz
    from django.core.mail import send_mail
    from django.template.loader import render_to_string
    from django.conf import settings

    cutoff = tz.now()

    cart_user_ids = Cart.objects.filter(
        product=instance, user__isnull=False
    ).values_list('user_id', flat=True).distinct()

    wishlist_user_ids = Wishlist.objects.filter(
        product=instance, user__isnull=False
    ).values_list('user_id', flat=True).distinct()

    user_ids = set(cart_user_ids) | set(wishlist_user_ids)

    already_notified = set(
        ReminderLog.objects.filter(
            reminder_type='low_stock',
            product=instance,
            user_id__in=user_ids,
        ).values_list('user_id', flat=True)
    )

    to_notify = user_ids - already_notified

    for user in User.objects.filter(id__in=to_notify).select_related():
        try:
            html = render_to_string('email/low_stock_alert.html', {
                'user': user,
                'product': instance,
                'site_url': 'https://lipsempirebyarielle.store',
            })
            send_mail(
                subject=f"⚡ Plus que {instance.stock_qty} en stock — {instance.title}",
                message=f"Plus que {instance.stock_qty} exemplaire(s) de {instance.title} disponible(s).",
                html_message=html,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=True,
            )
            ReminderLog.objects.create(user=user, reminder_type='low_stock', product=instance)
        except Exception:
            pass
        
        
        

class AnalyticsSession(models.Model):
    session_id = models.CharField(max_length=100, unique=True)
    utm_source = models.CharField(max_length=200, null=True, blank=True)
    utm_medium = models.CharField(max_length=200, null=True, blank=True)
    utm_campaign = models.CharField(max_length=200, null=True, blank=True)
    utm_content = models.CharField(max_length=200, null=True, blank=True)
    ref = models.CharField(max_length=200, null=True, blank=True)
    device_type = models.CharField(max_length=50, null=True, blank=True)
    country = models.CharField(max_length=10, null=True, blank=True)
    referrer = models.CharField(max_length=500, null=True, blank=True)
    is_new_visitor = models.BooleanField(null=True)
    screen_res = models.CharField(max_length=20, null=True, blank=True)
    timezone = models.CharField(max_length=80, null=True, blank=True)
    language = models.CharField(max_length=20, null=True, blank=True)
    browser = models.CharField(max_length=100, null=True, blank=True)
    os = models.CharField(max_length=100, null=True, blank=True)
    fingerprint = models.CharField(max_length=64, null=True, blank=True)
    visit_count = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.session_id


class AnalyticsEvent(models.Model):
    session = models.ForeignKey(AnalyticsSession, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=100)
    page = models.CharField(max_length=500, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    extra = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.event_type} - {self.created_at}"


class PushSubscription(models.Model):
    endpoint = models.TextField(unique=True)
    p256dh = models.TextField()
    auth = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.endpoint[:80]


class ReminderLog(models.Model):
    TYPES = (
        ('cart_abandon', 'Abandon panier'),
        ('wishlist', 'Wishlist'),
        ('low_stock', 'Stock faible'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reminder_logs')
    reminder_type = models.CharField(max_length=50, choices=TYPES)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=['user', 'reminder_type', 'sent_at'])]

    def __str__(self):
        return f"{self.user.email} — {self.reminder_type} — {self.sent_at.date()}"


class QuickBooksCredentials(models.Model):
    """
    Stocke les tokens pour une entreprise QuickBooks connectée (realmId).
    On supporte plusieurs clients/companies si nécessaire.
    """
    company_name = models.CharField(max_length=255, blank=True, null=True)
    realm_id = models.CharField(max_length=100, unique=True)  # Company ID fourni par Intuit
    access_token = models.TextField()
    refresh_token = models.TextField()
    token_expires_at = models.DateTimeField()  # datetime quand access_token expire
    # Méta
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_access_token_expired(self, margin_seconds=60):
        """Retourne True si le token va expirer dans margin_seconds (sécurité)."""
        return timezone.now() >= (self.token_expires_at - timezone.timedelta(seconds=margin_seconds))

    def __str__(self):
        return f"QB:{self.realm_id} ({self.company_name or 'unnamed'})"

