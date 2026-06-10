const SESSION_KEY = 'le_sid'
const API = 'https://backend.lipsempirebyarielle.store/api/v1/'

function getOrCreateSession() {
  let sid = localStorage.getItem(SESSION_KEY)
  if (!sid) {
    sid = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(SESSION_KEY, sid)
  }
  return sid
}

function getUTMs() {
  try {
    const p = new URLSearchParams(window.location.search)
    const src = p.get('utm_source')
    const med = p.get('utm_medium')
    const cam = p.get('utm_campaign')
    if (src) sessionStorage.setItem('utm_source', src)
    if (med) sessionStorage.setItem('utm_medium', med)
    if (cam) sessionStorage.setItem('utm_campaign', cam)
  } catch {}
  return {
    utm_source: sessionStorage.getItem('utm_source'),
    utm_medium: sessionStorage.getItem('utm_medium'),
    utm_campaign: sessionStorage.getItem('utm_campaign'),
  }
}

function getDevice() {
  const w = window.innerWidth
  return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop'
}

export function initTracking() {
  const session_id = getOrCreateSession()
  const utms = getUTMs()
  fetch(API + 'analytics/session/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, device_type: getDevice(), ...utms }),
    keepalive: true,
  }).catch(() => {})
}

export function trackEvent(event_type, data = {}) {
  const session_id = getOrCreateSession()
  fetch(API + 'analytics/event/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id,
      event_type,
      page: window.location.pathname,
      ...data,
    }),
    keepalive: true,
  }).catch(() => {})
}
