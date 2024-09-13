from django.contrib import admin
from .models import *

class GalleryInline(admin.TabularInline):
    model = Gallery

class SpecificationInline(admin.TabularInline):
    model = Specification
    
class ColorInline(admin.TabularInline):
    model = Color

class ProductAdmin(admin.ModelAdmin):
    list_display = ['title', 'price', 'category', 'shipping_amount', 'stock_qty', 'in_stock']
    list_filter = ['date']
    search_fields = ['title']
    ordering = ['date']
    inlines = [GalleryInline, SpecificationInline, ColorInline]

class CartOrderAdmin(admin.ModelAdmin):
    list_display = ['oid', 'payment_status', 'total']
    

admin.site.register(Product, ProductAdmin)

admin.site.register(Cart)
admin.site.register(CartOrder)
admin.site.register(CartOrderItem)
admin.site.register(Coupon)
admin.site.register(Wishlist)
admin.site.register(Category)
admin.site.register(Tax)
admin.site.register(Contact)