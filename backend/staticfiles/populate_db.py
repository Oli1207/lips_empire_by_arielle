import os
import django
from faker import Faker

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from base.models import *  # Importez vos modèles

fake = Faker()

def create_category():
    for _ in range(5):  # Crée 5 catégories
        Category.objects.get_or_create(
            title=fake.word(),
            slug=fake.slug()
        )

def create_products():
    categories = Category.objects.all()
    for _ in range(20):  # Crée 20 produits
        product = Product.objects.create(
            title=fake.word(),
            description=fake.text(),
            price=fake.random_number(digits=2),
            old_price=fake.random_number(digits=2),
            shipping_amount=fake.random_number(digits=2),
            stock_qty=fake.random_number(digits=2),
            in_stock=fake.boolean(),
            status=fake.random_element(elements=("rupture", "en_attente", "disponible")),
            views=fake.random_number(digits=3),
            slug=fake.slug()
        )
        
        # Crée quelques couleurs et tailles factices pour chaque produit
        for _ in range(4):
            Color.objects.get_or_create(
                product=product,
                name=fake.color_name(),
                color_code=fake.hex_color()
            )

        for _ in range(5):
            Specification.objects.get_or_create(
                product=product,
                title=fake.word(),
                content=fake.text()
            )
        
        

if __name__ == "__main__":
    create_category()
    create_products()
    print("Database populated with fake data.")
