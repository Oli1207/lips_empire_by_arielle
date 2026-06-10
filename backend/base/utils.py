# integrations/utils.py
import requests
from django.shortcuts import get_object_or_404
from .models import QuickBooksCredentials
from django.utils import timezone
import base64


QBO_REDIRECT_URI="https://backend.lipsempirebyarielle.store/api/v1/callback/"
QBO_ENV="production"   # "sandbox" pour test, "production" en vrai

QBO_CLIENT_ID = "ABSM6vlHyhC34bCFzqrH3VvGkpMtkT6sRp8DhLUfiRcCCbIOfz"
QBO_CLIENT_SECRET = "OlJIkybyiTT29Fl4Uy15k5ShkVYDdCDYRXdf6te1"

QBO_OAUTH_AUTHORIZE = "https://appcenter.intuit.com/connect/oauth2"
QBO_OAUTH_TOKEN = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"

# Base URL API selon sandbox ou prod
QBO_API_BASE = "https://sandbox-quickbooks.api.intuit.com/v3/company" if QBO_ENV == "sandbox" else "https://quickbooks.api.intuit.com/v3/company"


def refresh_qbo_token_for(realm_id):
    qb = get_object_or_404(QuickBooksCredentials, realm_id=realm_id)
    basic = base64.b64encode(f"{QBO_CLIENT_ID}:{QBO_CLIENT_SECRET}".encode()).decode()
    headers = {"Authorization": f"Basic {basic}", "Content-Type": "application/x-www-form-urlencoded"}
    data = {"grant_type": "refresh_token", "refresh_token": qb.refresh_token}
    r = requests.post(QBO_OAUTH_TOKEN, headers=headers, data=data, timeout=15)
    r.raise_for_status()
    tokens = r.json()
    qb.access_token = tokens["access_token"]
    qb.refresh_token = tokens.get("refresh_token", qb.refresh_token)
    qb.token_expires_at = timezone.now() + timezone.timedelta(seconds=int(tokens.get("expires_in", 3600)))
    qb.save()
    return qb

def call_qbo_accounting_api(realm_id, method, path, json_payload=None, params=None):
    qb = get_object_or_404(QuickBooksCredentials, realm_id=realm_id)
    # refresh si nécessaire
    if timezone.now() >= (qb.token_expires_at - timezone.timedelta(seconds=60)):
        qb = refresh_qbo_token_for(realm_id)
    url = f"{QBO_API_BASE}/{realm_id}{path}"
    headers = {"Authorization": f"Bearer {qb.access_token}", "Accept": "application/json", "Content-Type": "application/json"}
    r = requests.request(method, url, headers=headers, json=json_payload, params=params, timeout=20)
    r.raise_for_status()
    return r.json()
