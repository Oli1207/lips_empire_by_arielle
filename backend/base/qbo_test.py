# base/utils/qbo_test.py
from intuitlib.client import AuthClient
from quickbooks import QuickBooks
from quickbooks.objects.item import Item
from base.models import QuickBooksCredentials

def get_qbo_items():
    """Récupère tous les produits QuickBooks depuis ton entreprise connectée"""
    creds = QuickBooksCredentials.objects.last()
    if not creds:
        print("⚠️ Aucun identifiant QuickBooks trouvé dans la base.")
        return []

    try:
        # Authentification OAuth
        auth_client = AuthClient(
            client_id="ABSM6vlHyhC34bCFzqrH3VvGkpMtkT6sRp8DhLUfiRcCCbIOfz",
            client_secret="OlJIkybyiTT29Fl4Uy15k5ShkVYDdCDYRXdf6te1",
            access_token=creds.access_token,
            refresh_token=creds.refresh_token,
            environment="production",
            redirect_uri="https://backend.lipsempirebyarielle.store/api/v1/callback/",
        )

        # Connexion à ton entreprise QuickBooks
        client = QuickBooks(
            auth_client=auth_client,
            refresh_token=creds.refresh_token,
            company_id=creds.realm_id,
        )

        # Liste tous les produits
        items = Item.all(qb=client)
        print("✅ Liste des produits QuickBooks :")
        for item in items:
            print(f"➡️ {item.Name} — ID: {item.Id} — Type: {item.Type}")

        return items

    except Exception as e:
        print(f"❌ Erreur lors de la récupération des produits : {e}")
        return []
