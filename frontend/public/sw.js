self.addEventListener('push', function (event) {
  let data = {}
  try { data = event.data.json() } catch {}

  const title = data.title || 'Lips Empire By Arielle'
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/logo_arielle.png',
    badge: '/logo_arielle.png',
    data: { url: data.url || '/' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(clients.openWindow(url))
})
