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
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      const isClientFocused = clientList.some((client) => client.focused);

      if (!isClientFocused) {
        return self.registration.showNotification(title, options);
      }
    })
  );
});

self.addEventListener("notificationclick", (event) => {

  event.notification.close();

  const url = event.notification.data?.url || location.origin;

  event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
          let matchingClient = null;

          for (const client of clientList) {
              if (client.url.startsWith(url) && "focus" in client) {
                  matchingClient = client;
                  break;
              }
          }

          if (matchingClient) {
              return matchingClient.focus();
          }

          if (clients.openWindow) {
              return clients.openWindow(url);
          }
      })
  );
});

