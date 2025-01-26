const PUBLIC_VAPID_KEY = "BLVOl7Ni6vt6JIvtKhIcHm0aRnm9bD92HNTABXI8QHinzmQwMjwzzJZaNLwkzSWV7IthRFJW6pp5HUXc3O6tKdA";

let socket;
let username = '';

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const subscription = async () => {
    // Service Worker
    const register = await navigator.serviceWorker.register("/service-worker.js")

    setTimeout(async () => {
        // Listen Push Notifications
        const subscription = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
        });
    
        localStorage.setItem("subscription", JSON.stringify(subscription));
    
        // Send Notification
        await fetch("/subscribe", {
            method: "POST",
            body: JSON.stringify(subscription),
            headers: {
                "Content-Type": "application/json"
            }
        });
    
        console.log("Subscribed!");
    },1000);

};



async function showNotification(messageData) {
    if ('Notification' in window && navigator.serviceWorker) {
        await fetch('/new-message', {
           method: 'POST',
           body: JSON.stringify({message: messageData.message, username: messageData.username, subscription: JSON.parse(localStorage.getItem('subscription'))}),
           headers: {
           'Content-Type': 'application/json'
           }
       });
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
                        console.log({data});
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
                    console.log({data});
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
    if (data.username === username) {
        messageEl.classList.add('sender');
    }
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

function setEventEnter() {
    const messageInput = document.getElementById('message');
    messageInput.addEventListener('keyup', (el) => {
        if (el.key === 'Enter') {
            el.preventDefault();
            sendMessage();
        }
    });

}

window.onload = function () {
    // Service Worker Support
    if ("serviceWorker" in navigator) {
        subscription().catch(err => console.log(err));
    }
    setEventEnter()
    loadUsername();
};