const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const webpush = require('web-push');


const app = express();
const server = require('http').Server(app);

const vapidKeys = webpush.generateVAPIDKeys()

  // Configura las claves VAPID
webpush.setVapidDetails(
    'mailto:felipipe88806@gmail.com', // tu correo electrónico
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );

// Servir archivos estáticos desde la carpeta 'assets'
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Ruta para el archivo index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Endpoint para recibir la suscripción del cliente
app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    console.log('Suscripción recibida:', subscription);
  
    // Enviar notificación push de ejemplo
    const payload = JSON.stringify({
      title: '¡Hola!',
      message: 'Tienes una nueva notificación.'
    });
  
    webpush.sendNotification(subscription, payload)
      .then(() => {
        res.status(200).json({ message: 'Notificación enviada con éxito' });
      })
      .catch((err) => {
        console.error('Error al enviar la notificación', err);
        res.status(500).json({ error: 'Error al enviar la notificación' });
      });
  });

// Crear servidor WebSocket
const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);

    ws.on('message', (message) => {
        // Broadcast a todos los clientes conectados
        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        clients.delete(ws);
    });
});

// Iniciar el servidor en el puerto 8080 o en el puerto configurado en el entorno
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Servidor WebSocket y Express corriendo en el puerto ${PORT}`);
});
