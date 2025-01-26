const WebSocket = require('ws');

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server });
    const clients = new Set();

    wss.on('connection', (ws) => {
        console.log('Notificación: Nuevo cliente conectado');
        clients.add(ws);

        ws.on('message', (message) => {
            console.log('Notificación: Nuevo mensaje');
            // Broadcast a todos los clientes conectados
            clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        });

        ws.on('close', () => {
            console.log('Notificación: Cliente desconectado');
            clients.delete(ws);
        });
    });
}

module.exports = setupWebSocket;
