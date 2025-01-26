require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const WebSocket = require('ws');
const path = require('path');
const app = express();


const PORT = process.env.PORT || 8080;
const server = require('http').Server(app); 

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.use(require('./../routes/index'));


app.use(express.static(path.join(__dirname, '../public')));


// // Endpoint para recibir la suscripción del cliente

// // Crear servidor WebSocket
const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on('connection', (ws) => {
    console.log({ws});
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
server.listen(PORT, () => {
    console.log(`Servidor WebSocket y Express corriendo en el puerto ${PORT}`);
});
