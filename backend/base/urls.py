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
    path('reviews/<product_id>/', views.ReviewListAPIView.as_view()),
    
    path('customer/wishlist/<user_id>/', views.WishListAPIView.as_view()),
    
    
    path('search/', views.SearchProductAPIView.as_view()),
    
        path('connect/', views.quickbooks_connect, name='qbo_connect'),
    path('callback/', views.quickbooks_callback, name='qbo_callback'),  # doit rendre une page JS qui postMessage + close
    path('status/', views.quickbooks_status, name='qbo_status'),        # vérifie si QuickBooks est connecté
    path('disconnect/', views.quickbooks_disconnect, name='qbo_disconnect'),  # révoque et supprime les tokens (optionnel)


    # Admin
    path('admin/dashboard/', views.AdminDashboardView.as_view()),
    path('admin/orders/', views.AdminOrderListView.as_view()),
    path('admin/orders/<str:oid>/', views.AdminOrderUpdateView.as_view()),
    path('admin/products/', views.AdminProductListCreateView.as_view()),
    path('admin/products/<int:pk>/', views.AdminProductDetailView.as_view()),
    path('admin/coupons/', views.AdminCouponListCreateView.as_view()),
    path('admin/coupons/<int:pk>/', views.AdminCouponDetailView.as_view()),
    path('admin/reviews/', views.AdminReviewListView.as_view()),
    path('admin/reviews/<int:pk>/', views.AdminReviewDetailView.as_view()),
    path('admin/contacts/', views.AdminContactListView.as_view()),
    path('admin/analytics/', views.AdminAnalyticsView.as_view()),

    # Analytics tracking
    path('analytics/session/', views.AnalyticsSessionView.as_view()),
    path('analytics/event/', views.AnalyticsEventView.as_view()),

    # Push notifications
    path('push/subscribe/', views.PushSubscribeView.as_view()),

    # Admin utilisateurs & rappels
    path('admin/users/', views.AdminUserListView.as_view()),
    path('admin/send-reminder/', views.AdminSendReminderView.as_view()),

    # Cart merge (login)
    path('cart/merge/', views.CartMergeView.as_view()),
]
