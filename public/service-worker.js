// Manejo del evento 'push'
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Notificación Push";
  const message = data.message || "Tienes una nueva notificación.";
  const options = {
      body: message,
      icon: "https://images.vexels.com/media/users/3/185261/isolated/preview/873be62e1bc5fb522c68b6cf3d7aa92a-pink-flower-large-petals-flat.png",
      badge: "https://images.vexels.com/media/users/3/185261/isolated/preview/873be62e1bc5fb522c68b6cf3d7aa92a-pink-flower-large-petals-flat.png",
      data: { url: location.origin }
  };

  event.waitUntil(
      self.registration.showNotification(title, options)
  );
});

// Manejo del evento 'notificationclick'
self.addEventListener("notificationclick", (event) => {
  console.log("Notificación clickeada", event);

  // Cerrar la notificación
  event.notification.close();

  // Recuperar la URL de los datos de la notificación
  const url = event.notification.data?.url || location.origin;

  // Abrir una nueva ventana o enfocar una existente
  event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
          let matchingClient = null;

          // Buscar una ventana que coincida con la URL
          for (const client of clientList) {
              console.log("Ventana abierta:", client.url);
              if (client.url.startsWith(url) && "focus" in client) {
                  matchingClient = client;
                  break;
              }
          }

          // Si se encuentra una ventana, enfocarla
          if (matchingClient) {
              console.log("Enfocando ventana existente:", matchingClient.url);
              return matchingClient.focus();
          }

          // Si no, abrir una nueva ventana
          console.log("Abriendo nueva ventana:", url);
          if (clients.openWindow) {
              return clients.openWindow(url);
          }
      })
  );
});

