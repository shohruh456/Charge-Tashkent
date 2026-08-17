self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/bookings'
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    const current = clients[0]
    if (current) {
      current.navigate(targetUrl)
      return current.focus()
    }
    return self.clients.openWindow(targetUrl)
  }))
})
