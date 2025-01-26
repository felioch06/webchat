const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = require('http').Server(app);

// Servir archivos estáticos desde la carpeta 'assets'
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Ruta para el archivo index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
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
