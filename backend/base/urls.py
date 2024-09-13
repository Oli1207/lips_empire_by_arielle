from django.urls import path

from . import views

from rest_framework_simplejwt.views import TokenRefreshView
urlpatterns = [
    path('user/token/', views.MyTokenObtainPairView.as_view()),
    path('user/token/refresh/', TokenRefreshView.as_view()),
    path('user/register/', views.RegisterView.as_view()),
    path('user/profile/<user_id>/', views.ProfileView.as_view()),

    path('category/', views.CategoryListAPIView.as_view()),
    path('products/', views.ProductListAPIView.as_view()),
    path('product/<slug>/', views.ProductDetailAPIView.as_view()),
     path('cart-view/', views.CartAPIView.as_view()),
     path('cart-list/<str:cart_id>/<int:user_id>/', views.CartListView.as_view()),
     path('cart-list/<str:cart_id>/', views.CartListView.as_view()),
     path('cart-detail/<str:cart_id>/', views.CartDetailView.as_view()),
      path('cart-detail/<str:cart_id>/<int:user_id>/', views.CartDetailView.as_view()),
      path('cart-delete/<str:cart_id>/<int:item_id>/<int:user_id>/', views.CartItemDeleteAPIView.as_view()),
    path('cart-delete/<str:cart_id>/<int:item_id>/', views.CartItemDeleteAPIView.as_view()),
    path('create-order/', views.CreateOrderAPIView.as_view()),
    path('checkout/<order_oid>/', views.CheckOutView.as_view()),
    path('coupon/', views.CouponAPIView.as_view()),

    path('stripe-checkout/<order_oid>/', views.StripeCheckoutView.as_view()),
    path('payment-success/<order_oid>/', views.PaymentSuccessView.as_view()),

    path('contact/', views.ContactCreateView.as_view(), name='contact-create'),

    path('customer/orders/<user_id>/', views.OrdersAPIView.as_view()),
    
    path('customer/order/<user_id>/<order_oid>/', views.OrderDetailAPIView.as_view()),
  #path('image-search/', store_views.ImageSearchAPIView.as_view(), name='image-search'),
]  