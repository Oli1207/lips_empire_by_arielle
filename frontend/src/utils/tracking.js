const SESSION_KEY = 'le_sid'
const VISITOR_KEY = 'le_vid'
const VISIT_COUNT_KEY = 'le_vc'
const LAST_VISIT_KEY = 'le_lv'
const API = 'https://backend.lipsempirebyarielle.store/api/v1/'

// ─── Identité ────────────────────────────────────────────────────────────────

function getOrCreateSession() {
  let sid = sessionStorage.getItem(SESSION_KEY)
  if (!sid) {
    sid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem(SESSION_KEY, sid)
  }
  return sid
}

function getVisitorInfo() {
  let vid = localStorage.getItem(VISITOR_KEY)
  const isNew = !vid
  if (!vid) {
    vid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(VISITOR_KEY, vid)
  }
  const count = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0') + 1
  localStorage.setItem(VISIT_COUNT_KEY, String(count))
  localStorage.setItem(LAST_VISIT_KEY, Date.now().toString())
  return { vid, is_new_visitor: isNew, visit_count: count }
}

// ─── Device fingerprint léger ─────────────────────────────────────────────────

async function getFingerprint() {
  try {
    const raw = [
      navigator.language,
      screen.width + 'x' + screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.platform,
      navigator.hardwareConcurrency || '',
    ].join('|')
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
  } catch {
    return null
  }
}

// ─── Browser / OS parsing ────────────────────────────────────────────────────

function parseBrowserOS() {
  const ua = navigator.userAgent
  let browser = 'Other', os = 'Other'

  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/OPR\/|Opera/.test(ua)) browser = 'Opera'
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = 'Chrome'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Safari'

  if (/Windows/.test(ua)) os = 'Windows'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/iPhone|iPad/.test(ua)) os = 'iOS'
  else if (/Mac OS X/.test(ua)) os = 'macOS'
  else if (/Linux/.test(ua)) os = 'Linux'

  return { browser, os }
}

// ─── UTMs ─────────────────────────────────────────────────────────────────────

function getUTMs() {
  try {
    const p = new URLSearchParams(window.location.search)
    ;[['utm_source','utm_source'],['utm_medium','utm_medium'],['utm_campaign','utm_campaign'],['utm_content','utm_content'],['ref','ref']]
      .forEach(([param, key]) => { const v = p.get(param); if (v) sessionStorage.setItem(key, v) })
  } catch {}
  return {
    utm_source: sessionStorage.getItem('utm_source'),
    utm_medium: sessionStorage.getItem('utm_medium'),
    utm_campaign: sessionStorage.getItem('utm_campaign'),
    utm_content: sessionStorage.getItem('utm_content'),
    ref: sessionStorage.getItem('ref'),
  }
}

function getDevice() {
  const w = window.innerWidth
  return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop'
}

// ─── Page time + scroll depth ─────────────────────────────────────────────────

let _pageStart = Date.now()
let _maxScroll = 0

function resetPageTracking() {
  _pageStart = Date.now()
  _maxScroll = 0
}

function getScrollDepth() {
  const el = document.documentElement
  const scrolled = el.scrollTop + window.innerHeight
  const total = el.scrollHeight
  return total <= 0 ? 0 : Math.round((scrolled / total) * 100)
}

function startScrollTracking() {
  const handler = () => {
    const d = getScrollDepth()
    if (d > _maxScroll) _maxScroll = d
  }
  window.addEventListener('scroll', handler, { passive: true })
}

function flushPageExit() {
  const time_on_page = Math.round((Date.now() - _pageStart) / 1000)
  if (time_on_page < 2) return
  trackEvent('page_exit', {
    page: window.location.pathname,
    time_on_page,
    max_scroll_pct: _maxScroll,
  })
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export async function initTracking() {
  const session_id = getOrCreateSession()
  const { vid, is_new_visitor, visit_count } = getVisitorInfo()
  const utms = getUTMs()
  const { browser, os } = parseBrowserOS()
  const fingerprint = await getFingerprint()

  // Lire le cache géo (rempli par UserCountry.jsx)
  let geoData = {}
  try {
    const raw = localStorage.getItem('le_geo')
    if (raw) {
      const { data } = JSON.parse(raw)
      if (data) geoData = { country: data.country || null, city: data.city || null, region: data.region || null }
    }
  } catch {}

  fetch(API + 'analytics/session/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id,
      visitor_id: vid,
      is_new_visitor,
      visit_count,
      device_type: getDevice(),
      screen_res: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      browser,
      os,
      fingerprint,
      referrer: document.referrer || null,
      ...geoData,
      ...utms,
    }),
    keepalive: true,
  }).catch(() => {})

  startScrollTracking()

  // Flush page_exit avant de quitter
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushPageExit()
  })
}

// ─── Events ───────────────────────────────────────────────────────────────────

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

// Appelé à chaque changement de route (dans TrackPageViews)
export function trackPageView(pathname) {
  flushPageExit()
  resetPageTracking()
  trackEvent('page_view', { page: pathname })
}

// ─── Funnel helpers ───────────────────────────────────────────────────────────

export function trackProductView(product_id, title) {
  trackEvent('view_product', { product_id, extra: { title } })
}

export function trackAddToCart(product_id, price, qty) {
  trackEvent('add_to_cart', { product_id, value: price, extra: { qty } })
}

export function trackBeginCheckout(value) {
  trackEvent('begin_checkout', { value })
}

export function trackPurchase(order_id, value) {
  trackEvent('purchase', { extra: { order_id }, value })
}

// Hover produit (appeler au mouseenter/mouseleave)
const _hoverStart = {}
export function trackProductHoverStart(product_id) {
  _hoverStart[product_id] = Date.now()
}
export function trackProductHoverEnd(product_id) {
  const start = _hoverStart[product_id]
  if (!start) return
  const duration_ms = Date.now() - start
  delete _hoverStart[product_id]
  if (duration_ms > 800) {
    trackEvent('product_hover', { product_id, extra: { duration_ms } })
  }
}
