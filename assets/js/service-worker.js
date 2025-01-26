self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Notificación Push';
    const message = data.message || 'Tienes una nueva notificación.';
  
    const options = {
      body: message,
      icon: '/icon.png', // Puedes agregar un icono para la notificación
      badge: '/badge.png' // Puedes agregar un badge
    };
  
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });
