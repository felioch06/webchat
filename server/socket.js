const WebSocket = require('ws');

/**
 * Configura un servidor WebSocket ligado al servidor HTTP/S proporcionado y retransmite los mensajes entrantes a todos los clientes conectados.
 * Gestiona el conjunto de clientes conectados y elimina conexiones cerradas.
 * @param {import('http').Server|import('https').Server} server - Servidor HTTP o HTTPS sobre el que se debe montar el WebSocket.
 */
function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server });
    const clients = new Set();
var a = 1;
    var b = 2;
    var c = 1 + a + b
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
