from django.conf import settings
from decimal import Decimal
from django.template.loader import render_to_string
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.mail import send_mail
from django.db import transaction
from django.http import HttpResponse
from django.utils import timezone


from .models import *
from .serializers import *

import requests
import json
from django.views.decorators.cache import never_cache


from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from django.db.models import Sum, Count
import datetime
import stripe
from django.shortcuts import redirect, HttpResponse, get_object_or_404, render
from django.http import JsonResponse
import base64
from django.conf import settings
from django.utils import timezone
stripe.api_key = settings.STRIPE_SECRET_KEY
from .utils import refresh_qbo_token_for, call_qbo_accounting_api

CLIENT_ID = 396690
CHITCHATS_API_KEY = "860417b18f004a8a936c0f7dbb7714f2"
CLIENT_ID_STAG= 507375
CHITCHATS_API_KEY_STAG = "2d907c11db9244ff894d83741485978e"




QBO_REDIRECT_URI="https://backend.lipsempirebyarielle.store/api/v1/callback/"
QBO_ENV="production"   # "sandbox" pour test, "production" en vrai

QBO_CLIENT_ID = "ABSM6vlHyhC34bCFzqrH3VvGkpMtkT6sRp8DhLUfiRcCCbIOfz"
QBO_CLIENT_SECRET = "OlJIkybyiTT29Fl4Uy15k5ShkVYDdCDYRXdf6te1"

QBO_OAUTH_AUTHORIZE = "https://appcenter.intuit.com/connect/oauth2"
QBO_OAUTH_TOKEN = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"

# Base URL API selon sandbox ou prod
QBO_API_BASE = "https://sandbox-quickbooks.api.intuit.com/v3/company" if QBO_ENV == "sandbox" else "https://quickbooks.api.intuit.com/v3/company"



class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny, )
    serializer_class = RegisterSerializer
    


class ProfileView(generics.RetrieveAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']

        user = User.objects.get(id=user_id)
        profile = Profile.objects.get(user=user)
        return profile

    

class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]



class ProductListAPIView(generics.ListAPIView):
    queryset = Product.objects.all().order_by('date')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


class ProductDetailAPIView(generics.RetrieveAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        slug = self.kwargs['slug']
        return Product.objects.get(slug=slug)
    

@method_decorator(never_cache, name='dispatch')
class CartAPIView(generics.ListCreateAPIView):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        payload = request.data

        product_id = payload['product_id']
        user_id = payload['user_id']
        qty = payload['qty']
        price = payload['price']
        shipping_amount = payload['shipping_amount']
        country = payload['country']
        cart_id = payload['cart_id']
        
        product = Product.objects.filter(id=product_id).first()
        if user_id != "undefined":
            user = User.objects.filter(id=user_id).first()
        else:
            user = None

        """tax = Tax.objects.filter(country=country).first()
        if tax:
            tax_rate = tax.rate / 100
        else:
            tax_rate = 0"""
        cart = Cart.objects.filter(cart_id=cart_id, product=product).first()

        if cart:
            cart.product = product
            cart.user = user
            cart.qty = qty
            cart.price = price
            cart.sub_total = Decimal(price) * int(qty)
            cart.shipping_amount =0.00
            cart.tax_fee = 0.00
            cart.country = country
            cart.cart_id = cart_id

            service_fee_percentage = 0.00
            cart.service_fee = 0.00

            cart.total = cart.sub_total
            cart.save()

            return Response({'message': "Cart Updated"}, status=status.HTTP_200_OK)
        
        else:
            cart = Cart()
            cart.product = product
            cart.user = user
            cart.qty = qty
            cart.price = price
            cart.sub_total = Decimal(price) * int(qty)
            cart.shipping_amount = 0.00
            cart.tax_fee = 0.00
            cart.country = country
            cart.cart_id = cart_id

            service_fee_percentage = 0.00
            cart.service_fee = 0.00

            cart.total = cart.sub_total
            cart.save()

            return Response({'message': "Cart created successfully"}, status=status.HTTP_201_CREATED)


@method_decorator(never_cache, name='dispatch')
class CartListView(generics.ListAPIView):
    serializer_class = CartSerializer
    permission_classes = [AllowAny]
    

    def get_queryset(self):
       cart_id = self.kwargs['cart_id']
       user_id = self.kwargs.get('user_id')

       if user_id is not None:
           user = User.objects.get(id=user_id)
           queryset = Cart.objects.filter(user=user, cart_id=cart_id)
       else:
           queryset = Cart.objects.filter(cart_id=cart_id)

       return queryset



@method_decorator(never_cache, name='dispatch')
class CartDetailView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [AllowAny]
    lookup_field = 'cart_id'

    def get_queryset(self):
       cart_id = self.kwargs['cart_id']
       user_id = self.kwargs.get('user_id')

       if user_id is not None:
           user = User.objects.get(id=user_id)
           queryset = Cart.objects.filter(user=user, cart_id=cart_id)
       else:
           queryset = Cart.objects.filter(cart_id=cart_id)

       return queryset

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        total_shipping = 0.0
        total_tax = 0.0
        total_service_fee = 0.0
        total_sub_total = 0.0
        total_total = 0.0

        for cart_item in queryset:
            total_shipping += float(self.calculate_shipping(cart_item))
            total_tax += float(self.calculate_tax(cart_item))
            total_service_fee += float(self.calculate_service_fee(cart_item))
            total_sub_total += float(self.calculate_sub_total(cart_item))
            total_total += float(self.calculate_total(cart_item))


        data = {
            'shipping': total_shipping,
            'tax': total_tax,
            'service_fee': total_service_fee,
            'sub_total' : total_sub_total,
            'total': total_total
        }

        return Response(data)

    def calculate_shipping(self, cart_item):
        return cart_item.shipping_amount
        
    def calculate_tax(self, cart_item):
        return cart_item.tax_fee
        
    def calculate_service_fee(self, cart_item):
        return cart_item.service_fee
        
    def calculate_sub_total(self, cart_item):
        return cart_item.sub_total
        
    def calculate_total(self, cart_item):
        return cart_item.total

@method_decorator(never_cache, name='dispatch')
class CartItemDeleteAPIView(generics.DestroyAPIView):
    serializer_class = CartSerializer
    lookup_field = 'cart_id'  

    def get_object(self):
        cart_id = self.kwargs['cart_id']
        item_id = self.kwargs['item_id']
        user_id = self.kwargs.get('user_id')

        if user_id is not None:
            user = get_object_or_404(User, id=user_id)
            cart = get_object_or_404(Cart, cart_id=cart_id, id=item_id, user=user)
        else:
            cart = get_object_or_404(Cart, cart_id=cart_id, id=item_id)

        return cart
    

 
@method_decorator(never_cache, name='dispatch')
class CreateOrderAPIView(generics.CreateAPIView):
    serializer_class = CartOrderSerializer
    queryset = CartOrder.objects.all()
    permission_classes = [AllowAny]

    def create(self, request):
        payload = request.data

        # Extract Order Details
        
        # Exemple pour chaque champ
        full_name = payload.get('full_name')
        email = payload.get('email')
        mobile = payload.get('mobile')
        address = payload.get('address')
        city = payload.get('city')
        state = payload.get('state')
        country = payload.get('country')
        postal_code = payload.get('postal_code')
        cart_id = payload.get('cart_id')
        user_id = payload.get('user_id')
        terms_accepted = str(payload.get('terms_accepted', '')).lower() in ('true', '1', 'yes')
        
        if not terms_accepted:
            return Response({"error": "Vous devez accepter les Conditions générales de vente."}, status=status.HTTP_400_BAD_REQUEST)


        # Fetch User
        user = User.objects.filter(id=user_id).first()

        # Fetch Cart Items
        cart_items = Cart.objects.filter(cart_id=cart_id)
        if not cart_items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)
       
        for item in cart_items:
            if item.qty > item.product.stock_qty:
                return Response({
                    "error": f"Le produit '{item.product.title}' a seulement {item.product.stock_qty} unité(s) disponible(s), vous avez demandé {item.qty}. Actualisez la page.."
                }, status=status.HTTP_400_BAD_REQUEST)
        # Calcul des totaux AVANT de construire shipment_data
        total_shipping = Decimal("0.00")
        total_tax = Decimal("0.00")
        total_service_fee = Decimal("0.00")
        total_sub_total = Decimal("0.00")
        total_initial_total = Decimal("0.00")
        total_total = Decimal("0.00")
        total_qty = 0

        for c in cart_items:
            total_sub_total += Decimal(str(c.sub_total))
            total_tax += Decimal(str(c.tax_fee))
            total_initial_total += Decimal(str(c.total))
            total_total += Decimal(str(c.total))
            total_qty += c.qty

        # Poids estimé : 120g par unité (gloss + emballage)
        estimated_weight = total_qty * 120

        # province_code uniquement pour CA et US
        country_upper = (country or "").upper()
        needs_province = country_upper in ("CA", "US")

        shipment_data = {
            "name": full_name,
            "address_1": address,
            "city": city,
            "postal_code": postal_code,
            "country_code": country_upper,
            "phone": str(mobile),
            "description": "Gloss lèvres - cosmétiques",
            "value": str(total_total.quantize(Decimal("0.01"))),
            "value_currency": "cad",
            "package_type": "parcel",
            "weight_unit": "g",
            "weight": estimated_weight,
            "size_unit": "cm",
            "size_x": 15,
            "size_y": 10,
            "size_z": 5,
            "insurance_requested": True,
            "signature_requested": False,
            "duties_paid_requested": False,
            "ship_date": "today",
            "line_items": [
                {
                    "quantity": c.qty,
                    "description": c.product.title,
                    "value_amount": str(Decimal(str(c.total)).quantize(Decimal("0.01"))),
                    "currency_code": "CAD",
                    "origin_country": "CA",
                    # US HTSUS requires 10 digits; other countries accept 6-digit HS code
                    "hs_tariff_code": "3304100000" if country_upper == "US" else "330410",
                } for c in cart_items
            ]
        }

        if needs_province and state:
            shipment_data["province_code"] = state.upper()
        headers = {
            "Authorization": f"{CHITCHATS_API_KEY}",
            'Content-Type': 'application/json; charset=utf-8'
        }

        # Envoi de la demande d'expédition
        try:
            response = requests.post(
                f"https://chitchats.com/api/v1/clients/{CLIENT_ID}/shipments",
                json=shipment_data,
                headers=headers
            )

            response_data = response.json()
            shipment_data = response_data.get("shipment", {})
            rates = shipment_data.get("rates", [])

            if response.status_code == 201 and rates:
                chosen_rate = rates[0]
                shipping_amount = Decimal(chosen_rate.get("payment_amount", "0.00"))
                postage_type = chosen_rate.get("postage_type")
                shipment_id = shipment_data.get("id")

                # Frais Stripe : 2.9% + 0.30 CAD sur (produits + livraison)
                stripe_fee = (total_total + shipping_amount) * Decimal("0.029") + Decimal("0.30")
                stripe_fee = stripe_fee.quantize(Decimal("0.01"))

                order = CartOrder.objects.create(
                    user=user,
                    full_name=full_name,
                    email=email,
                    mobile=mobile,
                    address=address,
                    city=city,
                    state=state,
                    country=country,
                    postal_code=postal_code,
                    shipping_amount=shipping_amount,
                    shipment_id=shipment_id,
                    terms_accepted=True,
                    sub_total=total_sub_total,
                    tax_fee=total_tax,
                    service_fee=stripe_fee,
                    initial_total=total_initial_total,
                    total=total_total + shipping_amount + stripe_fee,
                )

                for c in cart_items:
                    CartOrderItem.objects.create(
                        order=order,
                        product=c.product,
                        qty=c.qty,
                        price=c.price,
                        sub_total=c.sub_total,
                        shipping_amount=shipping_amount,
                        service_fee=0,
                        tax_fee=c.tax_fee,
                        initial_total=c.total,
                        total=c.total,
                    )
                    c.product.stock_qty -= c.qty
                    c.product.save()

                cart_items.delete()

                return Response({
                    "Message": "Order Created Successfully",
                    "order_oid": order.oid,
                }, status=status.HTTP_201_CREATED)

            elif response.status_code == 201 and not rates:
                return Response({
                    "error": "delivery_not_available",
                    "message": "On ne livre pas encore dans votre zone, c'est pour bientôt !"
                }, status=status.HTTP_400_BAD_REQUEST)

            else:
                errors = response_data.get("errors", [])
                country_errors = ["country_code", "destination", "international"]
                is_zone_error = any(
                    any(k in str(e).lower() for k in country_errors)
                    for e in errors
                ) if errors else False

                if is_zone_error or response.status_code in (422, 400):
                    return Response({
                        "error": "delivery_not_available",
                        "message": "On ne livre pas encore dans votre zone, c'est pour bientôt !"
                    }, status=status.HTTP_400_BAD_REQUEST)

                return Response({
                    "error": "shipment_failed",
                    "message": "Erreur lors de la création de l'expédition.",
                    "detail": response_data
                }, status=status.HTTP_400_BAD_REQUEST)

        except requests.exceptions.RequestException as e:
            return Response({
                "error": "shipment_failed",
                "message": "Impossible de contacter le service de livraison.",
                "detail": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@method_decorator(never_cache, name='dispatch')
class CheckOutView(generics.RetrieveAPIView):
    serializer_class = CartOrderSerializer
    lookup_field = 'order_oid'
    permission_classes = [AllowAny]

    def get_object(self):
        order_oid = self.kwargs['order_oid']
        order = CartOrder.objects.get(oid=order_oid)
        return order



@method_decorator(never_cache, name='dispatch')
class CouponAPIView(generics.CreateAPIView):
    serializer_class = CouponSerializer
    queryset = Coupon.objects.all()
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        payload = request.data

        order_oid = payload['order_oid']
        coupon_code = payload['coupon_code']

        order = CartOrder.objects.get(oid=order_oid)
        coupon = Coupon.objects.filter(code=coupon_code, active=True).first()

        if coupon:
            order_items = CartOrderItem.objects.filter(order=order)
            if order_items:
                for i in order_items:
                    if not coupon in i.coupon.all():
                        discount = i.total * coupon.discount / 100

                        i.total -= discount
                        i.sub_total -= discount
                        i.coupon.add(coupon)
                        i.saved += discount

                        order.total -= discount
                        order.sub_total -= discount
                        order.saved += discount

                        i.save()
                        order.save()

                        return Response({"message": "Coupon Activated", "icon": "success"}, status=status.HTTP_200_OK)
                    else:
                        return Response({"message":"Coupon Already Activated", "icon":"warning"}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Order Item Does Not Exist", "icon": "error"}, status=status.HTTP_200_OK)
        else:
            return Response({"message":"Coupon Does Not Exist", "icon":"error"}, status=status.HTTP_200_OK)


class CouponValidateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        code = request.data.get('code', '').strip()
        if not code:
            return Response({'valid': False, 'message': 'Code manquant'}, status=400)
        coupon = Coupon.objects.filter(code__iexact=code, active=True).first()
        if coupon:
            return Response({'valid': True, 'code': coupon.code, 'discount': coupon.discount})
        return Response({'valid': False, 'message': 'Code invalide ou expiré'})



@method_decorator(never_cache, name='dispatch')
class OrdersAPIView(generics.ListAPIView):
    serializer_class = CartOrderSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)

        orders = CartOrder.objects.filter(user=user)
        return orders
    
    
@method_decorator(never_cache, name='dispatch')    
class OrderDetailAPIView(generics.RetrieveAPIView):
    serializer_class = CartOrderSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        order_oid = self.kwargs['order_oid']

        user = User.objects.get(id=user_id)

        order = CartOrder.objects.get(user=user, oid=order_oid)
        return order
        


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Ignore the CSRF check


@method_decorator(never_cache, name='dispatch')
class StripeCheckoutView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication, BasicAuthentication]
    permission_classes = [AllowAny]


    
    def post(self, request, *args, **kwargs):
        order_oid = self.kwargs['order_oid']
        try:
            order = CartOrder.objects.get(oid=order_oid)
        except CartOrder.DoesNotExist:
            return Response({"message": "Order Not Found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            checkout_session = stripe.checkout.Session.create(
                customer_email=order.email,
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'cad',
                        'product_data': {
                            'name': order.full_name,
                        },
                        'unit_amount': int(order.total * 100),
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f'https://lipsempirebyarielle.store/payment-success/{order.oid}?session_id={{CHECKOUT_SESSION_ID}}',
                cancel_url='https://lipsempirebyarielle.store/payment-failed?session_id={CHECKOUT_SESSION_ID}'
            )

            order.stripe_session_id = checkout_session.id
            order.save()

            return redirect(checkout_session.url)

        except stripe.error.StripeError as e:
            return Response({"error": f'something went wrong: {str(e)}'})





def quickbooks_connect(request):
    params = {
        "client_id": QBO_CLIENT_ID,
        "response_type": "code",
        "scope": "com.intuit.quickbooks.accounting",
        "redirect_uri": QBO_REDIRECT_URI,
        "state": "connect_from_platform"
    }
    qs = "&".join(f"{k}={requests.utils.quote(v)}" for k, v in params.items())
    return redirect(f"{QBO_OAUTH_AUTHORIZE}?{qs}")

@csrf_exempt
def quickbooks_callback(request):
    # Intuit renvoie GET ?code=...&realmId=...
    code = request.GET.get("code")
    realmId = request.GET.get("realmId")
    error = request.GET.get("error")
    if error:
        # render page that notifies opener of error then closes
        return render(request, "qbo_callback_response.html", {"status": "error", "message": error})

    if not code or not realmId:
        return render(request, "qbo_callback_response.html", {"status": "error", "message": "Missing code or realmId"})

    # Exchange code for tokens (server-to-server)
    basic = base64.b64encode(f"{QBO_CLIENT_ID}:{QBO_CLIENT_SECRET}".encode()).decode()
    headers = {
        "Authorization": f"Basic {basic}",
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {"grant_type": "authorization_code", "code": code, "redirect_uri": QBO_REDIRECT_URI}
    try:
        r = requests.post(QBO_OAUTH_TOKEN, headers=headers, data=data, timeout=15)
        r.raise_for_status()
    except Exception as e:
        return render(request, "qbo_callback_response.html", {"status": "error", "message": str(e)})

    tokens = r.json()
    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")
    expires_in = tokens.get("expires_in", 3600)
    expires_at = timezone.now() + timezone.timedelta(seconds=int(expires_in))

    # Stocke / update
    QuickBooksCredentials.objects.update_or_create(
        realm_id=realmId,
        defaults={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_expires_at": expires_at
        }
    )

    # REND la page qui va postMessage {status: 'success'} et se fermer
    return render(request, "qbo_callback_response.html", {"status": "success", "message": "Connected"})

# --- status pour savoir si on est connecté ---
def quickbooks_status(request):
    qb = QuickBooksCredentials.objects.first()
    if not qb:
        return JsonResponse({"connected": False})
    return JsonResponse({
        "connected": True,
        "realm_id": qb.realm_id,
        "token_expires_at": qb.token_expires_at.isoformat()
    })

# --- disconnect (optionnel) : révoque token et supprime l'enregistrement ---
@csrf_exempt
def quickbooks_disconnect(request):
    qb = QuickBooksCredentials.objects.first()
    if not qb:
        return JsonResponse({"message": "No QuickBooks connection"}, status=404)
    # Facultatif: appeler endpoint revoke d'Intuit (si tu veux)
    # basic = base64.b64encode(f"{settings.QBO_CLIENT_ID}:{settings.QBO_CLIENT_SECRET}".encode()).decode()
    # headers = {"Authorization": f"Basic {basic}", "Content-Type": "application/x-www-form-urlencoded"}
    # requests.post("https://developer.api.intuit.com/v2/oauth2/tokens/revoke", headers=headers, data={"token": qb.access_token})
    qb.delete()
    return JsonResponse({"message": "QuickBooks disconnected"})



@method_decorator(never_cache, name='dispatch')
class PaymentSuccessView(generics.CreateAPIView):
    serializer_class = CartOrderSerializer
    permission_classes = [AllowAny]
    queryset = CartOrder.objects.all()

    def create(self, request, *args, **kwargs):
        payload = request.data
        order_oid = payload.get('order_oid')
        session_id = payload.get('session_id')

        if not order_oid or not session_id:
            return Response({"message": "Order ID and Session ID are required"},
                            status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # 🔒 Lock de la commande
            try:
                order = CartOrder.objects.select_for_update().get(oid=order_oid)
            except CartOrder.DoesNotExist:
                return Response({"message": "Order Not Found"}, status=status.HTTP_404_NOT_FOUND)

            # --- Commande déjà payée ---
            if order.payment_status == 'paid':
                return Response({"message": "déjà payé"}, status=status.HTTP_200_OK)

            # --- Récupération session Stripe ---
            try:
                session = stripe.checkout.Session.retrieve(session_id)
            except stripe.error.StripeError as e:
                return Response({"error": f"Erreur Stripe: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # --- Gestion des différents statuts ---
            if session.payment_status == 'unpaid':
                return Response({"message": "facture non payée"}, status=status.HTTP_400_BAD_REQUEST)
            elif session.payment_status == 'canceled':
                return Response({"message": "Paiement annulé"}, status=status.HTTP_400_BAD_REQUEST)
            elif session.payment_status != 'paid':
                return Response({"message": f"Une erreur s'est produite, réessayez (status={session.payment_status})"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # --- Paiement validé ---
            if session.payment_status == 'paid':
                # Marque la commande comme payée
                order.payment_status = 'paid'
                order.save(update_fields=['payment_status'])

                # --- Envoi email client ---
                order_items = CartOrderItem.objects.filter(order=order)
                shipment_id = (order.shipment_id or "").lower()
                lien_suivi = f"https://chitchats.com/tracking/{shipment_id}/" if shipment_id else None
                context = {"order": order, "order_items": order_items, "lien_suivi": lien_suivi}

                send_mail(
                    subject="Order Placed Successfully",
                    message=render_to_string("email/customer_order_confirmation.txt", context),
                    html_message=render_to_string("email/customer_order_confirmation.html", context),
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[order.email],
                    fail_silently=True
                )

                # Email de notification à Arielle
                admin_email = getattr(settings, 'ADMIN_EMAIL', settings.EMAIL_HOST_USER)
                items_summary = ", ".join([f"{i.qty}x {i.product.title}" for i in order_items])
                send_mail(
                    subject=f"🛍️ Nouvelle commande #{order.oid} — {order.total} CAD",
                    message=f"Nouvelle commande\nClient: {order.full_name} ({order.email})\nProduits: {items_summary}\nTotal: {order.total} CAD\nPays: {order.country}",
                    html_message=render_to_string("email/admin_new_order.html", context),
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[admin_email],
                    fail_silently=True
                )

                # Push notification admin
                _send_admin_push(
                    title=f"Nouvelle commande ! 🛍️",
                    body=f"{order.full_name} — {order.total} CAD ({order.country})",
                )

                # --- QuickBooks non bloquant ---
                qb_error = None
                try:
                    qb = QuickBooksCredentials.objects.first()
                    if qb and qb.realm_id:
                        invoice_lines = []
                        for item in order_items:
                            if not getattr(item.product, 'qbo_item_id', None):
                                continue
                            invoice_lines.append({
                                "DetailType": "SalesItemLineDetail",
                                "Amount": float(item.total),
                                "SalesItemLineDetail": {
                                    "ItemRef": {
                                        "value": str(item.product.qbo_item_id),
                                        "name": item.product.title
                                    }
                                }
                            })
                        if invoice_lines:
                            invoice_payload = {"CustomerRef": {"value": "1"}, "Line": invoice_lines}
                            resp = call_qbo_accounting_api(qb.realm_id, "POST", "/invoice", json_payload=invoice_payload)
                            qb_invoice_id = resp.get("Invoice", {}).get("Id")
                            if qb_invoice_id:
                                order.qbo_invoice_id = qb_invoice_id
                                order.save(update_fields=['qbo_invoice_id'])
                    else:
                        qb_error = "Aucune connexion QuickBooks configurée ou realm_id manquant"
                except Exception as e:
                    qb_error = str(e)

                # --- Réponse finale avec message exact attendu par le frontend ---
                response_data = {
                    "message": "Paiement effectué avec succès",
                    "order_oid": order.oid,
                    "payment_status": order.payment_status,
                    "order_status": order.order_status,
                    "qbo_invoice_id": getattr(order, "qbo_invoice_id", None)
                }
                if qb_error:
                    response_data["quickbooks_error"] = qb_error

                return Response(response_data, status=status.HTTP_200_OK)


@method_decorator(never_cache, name='dispatch')
class ContactCreateView(generics.CreateAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [AllowAny]
    


class ReviewListAPIView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        product_id = self.kwargs['product_id']

        product  = Product.objects.get(id=product_id)
        reviews = Review.objects.filter(product=product)
        return reviews

    def create(self, request, *args, **kwargs):
        payload = request.data
        
        user_id = payload['user_id']
        product_id = payload['product_id']
        rating = payload['rating']
        review = payload['review']

        user = User.objects.get(id=user_id)
        product = Product.objects.get(id=product_id)

        Review.objects.create(
            user=user,
            product=product,
            rating=rating,
            review=review
            )
        return Response({"message": "Review created successfully"}, status=status.HTTP_200_OK)



@method_decorator(never_cache, name='dispatch')
class WishListAPIView(generics.ListCreateAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']

        user = User.objects.get(id=user_id)
        wishlists = Wishlist.objects.filter(user=user)
        return wishlists
    
    def create(self, request, *args, **kwargs):
        payload = request.data

        product_id = payload['product_id']
        user_id = payload['user_id']

        product = Product.objects.get(id=product_id)
        user = User.objects.get(id=user_id)

        wishlist = Wishlist.objects.filter(product=product, user=user)
        if wishlist:
            wishlist.delete()
            return Response({"message":"produit retiré de la liste de souhaits"}, status=status.HTTP_200_OK)
        else:
            Wishlist.objects.create(product=product, user=user)
            return Response({"message":"produit ajouté à la liste de souhaits"}, status=status.HTTP_201_CREATED)
        
        

@method_decorator(never_cache, name='dispatch')
class SearchProductAPIView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        query = self.request.GET.get("query")
        products = Product.objects.filter(title__icontains=query)
        return products
        


# ─────────────────────────────────────────────
# HELPER : push notification vers tous les abonnés admin
# ─────────────────────────────────────────────

def _send_admin_push(title, body):
    try:
        from pywebpush import webpush, WebPushException
        vapid_private = getattr(settings, 'VAPID_PRIVATE_KEY', '')
        vapid_email = getattr(settings, 'VAPID_CLAIM_EMAIL', 'mailto:contact@lipsempirebyarielle.store')
        if not vapid_private:
            return
        payload = json.dumps({"title": title, "body": body})
        for sub in PushSubscription.objects.all():
            try:
                webpush(
                    subscription_info={"endpoint": sub.endpoint, "keys": {"p256dh": sub.p256dh, "auth": sub.auth}},
                    data=payload,
                    vapid_private_key=vapid_private,
                    vapid_claims={"sub": vapid_email},
                )
            except WebPushException:
                sub.delete()
    except ImportError:
        pass


# ─────────────────────────────────────────────
# ADMIN — Dashboard
# ─────────────────────────────────────────────

@method_decorator(never_cache, name='dispatch')
class AdminDashboardView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        today = timezone.now().date()
        month_start = today.replace(day=1)
        thirty_days_ago = today - datetime.timedelta(days=29)

        paid = CartOrder.objects.filter(payment_status='paid')
        paid_today = paid.filter(date__date=today)
        paid_month = paid.filter(date__date__gte=month_start)
        pending = paid.filter(order_status='Pending')

        revenue_today = paid_today.aggregate(r=Sum('total'))['r'] or 0
        revenue_month = paid_month.aggregate(r=Sum('total'))['r'] or 0
        revenue_total = paid.aggregate(r=Sum('total'))['r'] or 0

        daily_revenue = []
        for i in range(30):
            d = thirty_days_ago + datetime.timedelta(days=i)
            rev = paid.filter(date__date=d).aggregate(r=Sum('total'))['r'] or 0
            daily_revenue.append({'date': str(d), 'revenue': float(rev)})

        top_products = list(
            CartOrderItem.objects.filter(order__payment_status='paid')
            .values('product__title', 'product__id')
            .annotate(total_sold=Sum('qty'), total_revenue=Sum('total'))
            .order_by('-total_sold')[:5]
        )

        recent_orders = CartOrderSerializer(paid.order_by('-date')[:8], many=True).data

        low_stock = list(Product.objects.filter(stock_qty__lte=5, stock_qty__gt=0).values('id', 'title', 'stock_qty'))
        out_of_stock = Product.objects.filter(stock_qty=0).count()

        return Response({
            'revenue': {
                'today': float(revenue_today),
                'month': float(revenue_month),
                'total': float(revenue_total),
            },
            'orders': {
                'today': paid_today.count(),
                'month': paid_month.count(),
                'total': paid.count(),
                'pending': pending.count(),
            },
            'stock': {'low_stock': low_stock, 'out_of_stock': out_of_stock},
            'daily_revenue': daily_revenue,
            'top_products': top_products,
            'recent_orders': recent_orders,
        })


# ─────────────────────────────────────────────
# ADMIN — Commandes
# ─────────────────────────────────────────────

@method_decorator(never_cache, name='dispatch')
class AdminOrderListView(generics.ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = CartOrderSerializer

    def get_queryset(self):
        qs = CartOrder.objects.all().order_by('-date')
        s = self.request.query_params.get('status')
        p = self.request.query_params.get('payment')
        c = self.request.query_params.get('country')
        if s:
            qs = qs.filter(order_status=s)
        if p:
            qs = qs.filter(payment_status=p)
        if c:
            qs = qs.filter(country__iexact=c)
        return qs


@method_decorator(never_cache, name='dispatch')
class AdminOrderUpdateView(generics.UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = CartOrderSerializer
    queryset = CartOrder.objects.all()
    lookup_field = 'oid'


# ─────────────────────────────────────────────
# ADMIN — Produits
# ─────────────────────────────────────────────

@method_decorator(never_cache, name='dispatch')
class AdminProductListCreateView(generics.ListCreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = AdminProductSerializer
    queryset = Product.objects.all().order_by('-date')
    parser_classes = [MultiPartParser, FormParser]


@method_decorator(never_cache, name='dispatch')
class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = AdminProductSerializer
    queryset = Product.objects.all()
    parser_classes = [MultiPartParser, FormParser]


# ─────────────────────────────────────────────
# ADMIN — Coupons
# ─────────────────────────────────────────────

@method_decorator(never_cache, name='dispatch')
class AdminCouponListCreateView(generics.ListCreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = CouponSerializer
    queryset = Coupon.objects.all().order_by('-date')


@method_decorator(never_cache, name='dispatch')
class AdminCouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = CouponSerializer
    queryset = Coupon.objects.all()


# ─────────────────────────────────────────────
# ADMIN — Avis
# ─────────────────────────────────────────────

@method_decorator(never_cache, name='dispatch')
class AdminReviewListView(generics.ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = AdminReviewSerializer

    def get_queryset(self):
        qs = Review.objects.all().order_by('-date')
        active = self.request.query_params.get('active')
        if active is not None:
            qs = qs.filter(active=(active.lower() == 'true'))
        return qs


@method_decorator(never_cache, name='dispatch')
class AdminReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = AdminReviewSerializer
    queryset = Review.objects.all()


# ─────────────────────────────────────────────
# ADMIN — Contacts & Analytics
# ─────────────────────────────────────────────

@method_decorator(never_cache, name='dispatch')
class AdminContactListView(generics.ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = AdminContactSerializer
    queryset = Contact.objects.all().order_by('-id')


@method_decorator(never_cache, name='dispatch')
class AdminAnalyticsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        today = timezone.now().date()
        thirty_days_ago = today - datetime.timedelta(days=29)
        seven_days_ago = today - datetime.timedelta(days=6)

        sessions_30d = AnalyticsSession.objects.filter(created_at__date__gte=thirty_days_ago)
        sessions_7d = AnalyticsSession.objects.filter(created_at__date__gte=seven_days_ago)
        events_30d = AnalyticsEvent.objects.filter(created_at__date__gte=thirty_days_ago)

        events_by_type = list(
            events_30d.values('event_type').annotate(count=Count('id')).order_by('-count')
        )
        top_pages = list(
            events_30d.filter(event_type='page_view')
            .values('page').annotate(count=Count('id')).order_by('-count')[:10]
        )
        top_products_viewed = list(
            events_30d.filter(event_type='view_product', product__isnull=False)
            .values('product__title', 'product__id').annotate(count=Count('id')).order_by('-count')[:5]
        )

        daily_sessions = []
        for i in range(30):
            d = thirty_days_ago + datetime.timedelta(days=i)
            count = AnalyticsSession.objects.filter(created_at__date=d).count()
            daily_sessions.append({'date': str(d), 'sessions': count})

        total_sessions = sessions_30d.count()
        purchases = events_30d.filter(event_type='purchase').count()
        conversion_rate = round(purchases / total_sessions * 100, 2) if total_sessions > 0 else 0

        devices = list(sessions_30d.values('device_type').annotate(count=Count('id')))
        sources = list(
            sessions_30d.exclude(utm_source=None).exclude(utm_source='')
            .values('utm_source').annotate(count=Count('id')).order_by('-count')[:5]
        )
        top_campaigns = list(
            sessions_30d.exclude(utm_campaign=None).exclude(utm_campaign='')
            .values('utm_campaign').annotate(count=Count('id')).order_by('-count')[:5]
        )
        top_refs = list(
            sessions_30d.exclude(ref=None).exclude(ref='')
            .values('ref').annotate(count=Count('id')).order_by('-count')[:10]
        )
        top_content = list(
            sessions_30d.exclude(utm_content=None).exclude(utm_content='')
            .values('utm_content').annotate(count=Count('id')).order_by('-count')[:10]
        )

        return Response({
            'sessions': {'7d': sessions_7d.count(), '30d': total_sessions},
            'events_by_type': events_by_type,
            'top_pages': top_pages,
            'top_products_viewed': top_products_viewed,
            'daily_sessions': daily_sessions,
            'conversion_rate': conversion_rate,
            'devices': devices,
            'sources': sources,
            'top_campaigns': top_campaigns,
            'top_refs': top_refs,
            'top_content': top_content,
        })


# ─────────────────────────────────────────────
# ANALYTICS — Session & Events (public)
# ─────────────────────────────────────────────

class AnalyticsSessionView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        session_id = data.get('session_id')
        if not session_id:
            return Response({'error': 'session_id required'}, status=400)
        AnalyticsSession.objects.update_or_create(
            session_id=session_id,
            defaults={
                'utm_source': data.get('utm_source') or None,
                'utm_medium': data.get('utm_medium') or None,
                'utm_campaign': data.get('utm_campaign') or None,
                'utm_content': data.get('utm_content') or None,
                'ref': data.get('ref') or None,
                'device_type': data.get('device_type') or None,
                'country': data.get('country') or None,
            }
        )
        return Response({'ok': True})


class AnalyticsEventView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        session_id = data.get('session_id')
        event_type = data.get('event_type')
        if not session_id or not event_type:
            return Response({'error': 'session_id and event_type required'}, status=400)

        session, _ = AnalyticsSession.objects.get_or_create(session_id=session_id)

        product = None
        product_id = data.get('product_id')
        if product_id:
            product = Product.objects.filter(id=product_id).first()

        value = data.get('value')

        AnalyticsEvent.objects.create(
            session=session,
            event_type=event_type,
            page=data.get('page', ''),
            product=product,
            value=Decimal(str(value)) if value else None,
            extra=data.get('extra') or {},
        )
        return Response({'ok': True})


# ─────────────────────────────────────────────
# PUSH — Abonnements
# ─────────────────────────────────────────────

class PushSubscribeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        endpoint = data.get('endpoint')
        keys = data.get('keys', {})
        if not endpoint:
            return Response({'error': 'endpoint required'}, status=400)
        PushSubscription.objects.update_or_create(
            endpoint=endpoint,
            defaults={'p256dh': keys.get('p256dh', ''), 'auth': keys.get('auth', '')}
        )
        return Response({'ok': True})

    def delete(self, request):
        endpoint = request.data.get('endpoint')
        if endpoint:
            PushSubscription.objects.filter(endpoint=endpoint).delete()
        return Response({'ok': True})


def sitemap_xml(request):
    site = 'https://lipsempirebyarielle.store'
    now = timezone.now().strftime('%Y-%m-%d')

    static_urls = [
        ('/', '1.0', 'daily'),
        ('/policy', '0.5', 'monthly'),
        ('/livraison', '0.5', 'monthly'),
    ]

    products = Product.objects.exclude(status='en_attente').values('slug', 'date')

    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']

    for loc, priority, changefreq in static_urls:
        lines.append(f'''  <url>
    <loc>{site}{loc}</loc>
    <lastmod>{now}</lastmod>
    <changefreq>{changefreq}</changefreq>
    <priority>{priority}</priority>
  </url>''')

    for p in products:
        lastmod = p['date'].strftime('%Y-%m-%d') if p.get('date') else now
        lines.append(f'''  <url>
    <loc>{site}/detail/{p['slug']}/</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>''')

    lines.append('</urlset>')
    return HttpResponse('\n'.join(lines), content_type='application/xml')


# ─── Admin : vue utilisateurs (cart + wishlist) ───────────────────────────────

class AdminUserListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        users = User.objects.filter(is_staff=False).order_by('-date_joined')
        data = []
        for u in users:
            cart_items = Cart.objects.filter(user=u).select_related('product')
            wishlist_items = Wishlist.objects.filter(user=u).select_related('product')
            order_count = CartOrder.objects.filter(user=u, payment_status='paid').count()
            last_reminder = ReminderLog.objects.filter(user=u).order_by('-sent_at').first()

            data.append({
                'id': u.id,
                'email': u.email,
                'full_name': u.full_name or u.email,
                'date_joined': u.date_joined.strftime('%Y-%m-%d'),
                'order_count': order_count,
                'cart_count': cart_items.count(),
                'wishlist_count': wishlist_items.count(),
                'cart_total': float(sum(i.sub_total for i in cart_items)),
                'last_reminder_type': last_reminder.reminder_type if last_reminder else None,
                'last_reminder_date': last_reminder.sent_at.strftime('%Y-%m-%d') if last_reminder else None,
                'cart_items': [
                    {
                        'product_id': i.product.id,
                        'title': i.product.title,
                        'price': float(i.price),
                        'qty': i.qty,
                        'sub_total': float(i.sub_total),
                        'stock_qty': i.product.stock_qty,
                        'image': str(i.product.image),
                    }
                    for i in cart_items
                ],
                'wishlist_items': [
                    {
                        'product_id': i.product.id,
                        'title': i.product.title,
                        'price': float(i.product.price),
                        'stock_qty': i.product.stock_qty,
                        'image': str(i.product.image),
                    }
                    for i in wishlist_items
                ],
            })

        return Response(data)


# ─── Admin : envoyer un rappel manuel ────────────────────────────────────────

COOLDOWNS = {
    'cart_abandon': 7,
    'wishlist': 14,
}

class AdminSendReminderView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        user_id = request.data.get('user_id')
        reminder_type = request.data.get('type')  # 'cart_abandon' | 'wishlist'

        if reminder_type not in ('cart_abandon', 'wishlist'):
            return Response({'error': 'type invalide'}, status=400)

        try:
            user = User.objects.get(id=user_id, is_staff=False)
        except User.DoesNotExist:
            return Response({'error': 'utilisateur introuvable'}, status=404)

        cooldown_days = COOLDOWNS.get(reminder_type, 7)
        cutoff = timezone.now() - datetime.timedelta(days=cooldown_days)
        recent = ReminderLog.objects.filter(
            user=user, reminder_type=reminder_type, sent_at__gte=cutoff
        ).exists()
        if recent:
            return Response({'error': f'Rappel déjà envoyé il y a moins de {cooldown_days} jours'}, status=429)

        site_url = 'https://lipsempirebyarielle.store'

        if reminder_type == 'cart_abandon':
            cart_items = list(Cart.objects.filter(user=user).select_related('product'))
            if not cart_items:
                return Response({'error': 'Panier vide'}, status=400)
            total = sum(i.sub_total for i in cart_items)
            html = render_to_string('email/cart_reminder.html', {
                'user': user,
                'cart_items': cart_items,
                'cart_count': len(cart_items),
                'total': float(total),
                'site_url': site_url,
            })
            subject = "Vous avez oublié quelque chose 🛍️"

        else:  # wishlist
            wishlist_items = list(Wishlist.objects.filter(user=user).select_related('product'))
            if not wishlist_items:
                return Response({'error': 'Wishlist vide'}, status=400)
            html = render_to_string('email/wishlist_reminder.html', {
                'user': user,
                'wishlist_items': wishlist_items,
                'wishlist_count': len(wishlist_items),
                'site_url': site_url,
            })
            subject = "Vos coups de cœur vous attendent 💕"

        send_mail(
            subject=subject,
            message=subject,
            html_message=html,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
            fail_silently=False,
        )
        ReminderLog.objects.create(user=user, reminder_type=reminder_type)
        return Response({'ok': True, 'sent_to': user.email})


# ─── Merge cart anonyme → user après login ───────────────────────────────────

class CartMergeView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart_id = request.data.get('cart_id')
        if not cart_id:
            return Response({'ok': True})
        updated = Cart.objects.filter(cart_id=cart_id, user__isnull=True).update(user=request.user)
        return Response({'ok': True, 'merged': updated})
