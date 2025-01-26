self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Notificación Push';
    const message = data.message || 'Tienes una nueva notificación.';
    const url = data.click_action || location.origin;
  
    const options = {
      body: message,
      icon: 'https://images.vexels.com/media/users/3/185261/isolated/preview/873be62e1bc5fb522c68b6cf3d7aa92a-pink-flower-large-petals-flat.png',
      badge: 'https://images.vexels.com/media/users/3/185261/isolated/preview/873be62e1bc5fb522c68b6cf3d7aa92a-pink-flower-large-petals-flat.png',
      data: { url: url },  // The URL which we are going to use later
      actions: [{ action: "open_url", title: "Read Now" }],
    };
  
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });
