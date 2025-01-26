let socket;
let username = '';

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
    if (Notification.permission === 'granted') {
        const notification = new Notification('Nuevo mensaje', {
            body: `${messageData.username}: ${messageData.message}`,
            icon: 'assets/images/icon.png'  
        });

        notification.onclick = function () {
            window.focus(); 
        };
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