self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Notificación Push';
    const message = data.message || 'Tienes una nueva notificación.';
  
    const options = {
      body: message,
      icon: 'https://cdn-icons-png.flaticon.com/512/1/1176.png',
      badge: 'https://cdn-icons-png.flaticon.com/512/1/1176.png' 
    };
  
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });
