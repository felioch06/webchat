// Manejo del evento 'push'
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Notificación Push";
  const message = data.message || "Tienes una nueva notificación.";
  const options = {
      body: message,
      icon: "https://images.vexels.com/media/users/3/185261/isolated/preview/873be62e1bc5fb522c68b6cf3d7aa92a-pink-flower-large-petals-flat.png",
      badge: "https://images.vexels.com/media/users/3/185261/isolated/preview/873be62e1bc5fb522c68b6cf3d7aa92a-pink-flower-large-petals-flat.png",
      data: { url: location.origin }, // URL para abrir al hacer clic
      actions: [{ action: "open_url", title: "Leer Ahora" }],
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

  // Recuperar la URL del 'data' de la notificación
  const url = event.notification.data?.url || location.origin;

  // Abrir una nueva ventana o enfocar una existente
  event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
          for (const client of clientList) {
              if (client.url === url && "focus" in client) {
                  return client.focus();
              }
          }
          if (clients.openWindow) {
              return clients.openWindow(url);
          }
      })
  );
});
