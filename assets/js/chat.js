let socket;
let username = '';

// Verificar si el navegador soporta notificaciones push
if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Push notifications are supported!');
  
    // Registra el service worker
    navigator.serviceWorker.register('/assets/js/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado con éxito:', registration);
      })
      .catch(error => {
        console.error('Error al registrar el Service Worker:', error);
      });
  
    // Manejar la suscripción al hacer clic en el botón
    document.getElementById('subscribe').addEventListener('click', () => {
      // Solicitar permisos de notificación
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Permiso concedido para notificaciones push.');
  
          // Obtener la suscripción
          navigator.serviceWorker.ready.then(registration => {
            registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: localStorage.getItem('publicKey') // Public key VAPID
            })
            .then(subscription => {
              console.log('Suscripción:', subscription);
  
              // Enviar la suscripción al servidor
              fetch('/subscribe', {
                method: 'POST',
                body: JSON.stringify(subscription),
                headers: {
                  'Content-Type': 'application/json'
                }
              })
              .then(response => response.json())
              .then(data => {
                console.log('Respuesta del servidor:', data);
              })
              .catch(error => {
                console.error('Error al enviar la suscripción al servidor:', error);
              });
            })
            .catch(error => {
              console.error('Error al suscribirse:', error);
            });
          });
        } else {
          console.log('Permiso denegado para notificaciones push.');
        }
      });
    });
  } else {
    console.log('El navegador no soporta notificaciones push.');
  }
  
function requestNotificationPermission() {
    if ('Notification' in window && navigator.serviceWorker) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notificaciones habilitadas');
            } else {
                console.log('Notificaciones denegadas');
            }
        });
    }
}

function showNotification(messageData) {
    fetch('/subscribe', { method: 'post' })
    if ('Notification' in window) {
        // El navegador soporta notificaciones
        if (Notification.permission === 'granted') {
            const notification = new Notification('Nuevo mensaje', {
                body: `${messageData.username}: ${messageData.message}`
            });
    
            notification.onclick = function () {
                window.focus(); 
            };
        }
    } else {
        alert('Las notificaciones no son soportadas en este navegador.');
        console.log('Las notificaciones no son soportadas en este navegador.');
    }
}

function loadMessages() {
    const messages = JSON.parse(localStorage.getItem('messages')) || [];
    messages.forEach(displayMessage);
}

function saveMessage(data) {
    let messages = JSON.parse(localStorage.getItem('messages')) || [];
    const messageExists = messages.some(msg => msg.message === data.message && msg.username === data.username && msg.timestamp === data.timestamp);
    if (!messageExists) {
        messages.push(data);
        localStorage.setItem('messages', JSON.stringify(messages));
    }
}

function startChat() {
    username = document.getElementById('username').value.trim();
    if (username) {
        saveUsername()
        document.getElementById('login').style.display = 'none';
        document.getElementById('chat').style.display = 'flex';

        socket = new WebSocket(`wss://${location.hostname}/`);

        socket.onopen = () => {
            console.log('Conectado al servidor');
        };

        socket.onmessage = (event) => {
            if (event.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = function () {
                    try {
                        const data = JSON.parse(reader.result);
                        displayMessage(data);
                        saveMessage(data);
                        
                        if (data.username !== username) {
                            showNotification(data);
                        }
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                };
                reader.readAsText(event.data);
            } else {
                try {
                    const data = JSON.parse(event.data);
                    displayMessage(data);
                    saveMessage(data);
                    
                    if (data.username !== username) {
                        showNotification(data);
                    }
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            }
        };

        loadMessages(); 
    }
}

function displayMessage(data) {
    const messagesDiv = document.getElementById('chat-messages');
    const messageEl = document.createElement('div');
    messageEl.innerHTML = `
        <strong>${data.username}</strong>: 
        ${data.message} 
        <small>(${data.timestamp})</small>
    `;
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value.trim();

    if (message && socket) {
        const messageData = {
            username,
            message,
            timestamp: new Date().toLocaleTimeString()
        };

        socket.send(JSON.stringify(messageData));
        messageInput.value = '';
        saveMessage(messageData); 
    }
}

window.onload = function() {
    loadUsername();
    requestNotificationPermission();  
};

function loadUsername() {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
        username = storedUsername;
        document.getElementById('username').value = username;
        startChat(); 
    }
}

function saveUsername() {
    if (username) {
        localStorage.setItem('username', username);
    }
}

function cambiarNombre() {
    username = document.getElementById('username').value.trim();
    saveUsername();

    document.getElementById('login').style.display = 'flex';
    document.getElementById('chat').style.display = 'none';

}