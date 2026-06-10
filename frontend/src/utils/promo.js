const PROMO_KEY = 'le_promo'
const API = 'https://backend.lipsempirebyarielle.store/api/v1/'

export function getStoredPromo() {
  try {
    const raw = localStorage.getItem(PROMO_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearPromo() {
  localStorage.removeItem(PROMO_KEY)
  window.dispatchEvent(new Event('promo-changed'))
}

async function validateAndStore(code) {
  try {
    const res = await fetch(API + 'coupon/validate/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    const data = await res.json()
    if (data.valid) {
      localStorage.setItem(PROMO_KEY, JSON.stringify({
        code: data.code,
        discount: data.discount,
        appliedAt: Date.now(),
      }))
      window.dispatchEvent(new Event('promo-changed'))
      return data
    }
  } catch {}
  return null
}

export async function initPromo() {
  const p = new URLSearchParams(window.location.search)
  const codeFromUrl = p.get('code') || p.get('promo')
  if (codeFromUrl) {
    await validateAndStore(codeFromUrl)
  }
}

export async function applyPromoCode(code) {
  return validateAndStore(code)
}
