class ChatApp {
    constructor() {
        this.PUBLIC_VAPID_KEY = "BLVOl7Ni6vt6JIvtKhIcHm0aRnm9bD92HNTABXI8QHinzmQwMjwzzJZaNLwkzSWV7IthRFJW6pp5HUXc3O6tKdA";
        this.socket = null;
        this.username = '';
        this.init();
    }

    urlBase64ToUint8Array(base64String) {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
        const rawData = window.atob(base64);
        return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
    }

    async unsubscribe() {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
        console.log("Todos los Service Workers antiguos han sido desregistrados.");
    }

    async subscription() {
        const register = await navigator.serviceWorker.register("/service-worker.js");
        setTimeout(async () => {
            const subscription = await register.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.PUBLIC_VAPID_KEY)
            });
            localStorage.setItem("subscription", JSON.stringify(subscription));
            await fetch("/subscribe", {
                method: "POST",
                body: JSON.stringify(subscription),
                headers: { "Content-Type": "application/json" }
            });
            console.log("Subscribed!");
        }, 1000);
    }

    async showNotification(messageData) {
        if ('Notification' in window && navigator.serviceWorker) {
            await fetch('/new-message', {
                method: 'POST',
                body: JSON.stringify({
                    message: messageData.message,
                    username: messageData.username,
                    subscription: JSON.parse(localStorage.getItem('subscription'))
                }),
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    loadMessages() {
        const messages = JSON.parse(localStorage.getItem('messages')) || [];
        messages.forEach(this.displayMessage.bind(this));
    }

    saveMessage(data) {
        const messages = JSON.parse(localStorage.getItem('messages')) || [];
        if (!messages.some(msg => msg.message === data.message && msg.username === data.username && msg.timestamp === data.timestamp)) {
            messages.push(data);
            localStorage.setItem('messages', JSON.stringify(messages));
        }
    }

    startChat() {
        this.username = document.getElementById('username').value.trim();
        if (this.username) {
            this.saveUsername();
            document.getElementById('login').style.display = 'none';
            document.getElementById('chat').style.display = 'flex';
            this.socket = new WebSocket(`wss://${location.hostname}/`);
            this.socket.onopen = () => console.log('Conectado al servidor');
            this.socket.onmessage = this.handleMessage.bind(this);
            this.loadMessages();
        }
    }

    handleMessage(event) {
        const processMessage = (data) => {
            this.displayMessage(data);
            this.saveMessage(data);
            if (data.username !== this.username) {
                this.showNotification(data);
            }
        };

        if (event.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    processMessage(JSON.parse(reader.result));
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            };
            reader.readAsText(event.data);
        } else {
            try {
                processMessage(JSON.parse(event.data));
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        }
    }

    displayMessage(data) {
        const messagesDiv = document.getElementById('chat-messages');
        const messageEl = document.createElement('div');
        messageEl.innerHTML = `<strong>${data.username}</strong>: ${data.message} <small>(${data.timestamp})</small>`;
        messageEl.classList.toggle('sender', data.username === this.username);
        messagesDiv.appendChild(messageEl);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    sendMessage() {
        const messageInput = document.getElementById('message');
        const message = messageInput.value.trim();
        if (message && this.socket) {
            const messageData = {
                username: this.username,
                message,
                timestamp: new Date().toLocaleTimeString()
            };
            this.socket.send(JSON.stringify(messageData));
            messageInput.value = '';
            this.saveMessage(messageData);
        }
    }

    loadUsername() {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            this.username = storedUsername;
            document.getElementById('username').value = this.username;
            this.startChat();
        }
    }

    saveUsername() {
        if (this.username) {
            localStorage.setItem('username', this.username);
        }
    }

    cambiarNombre() {
        ['messages', 'subscription', 'username'].forEach(item => localStorage.removeItem(item));
        this.username = document.getElementById('username').value.trim();
        this.saveUsername();
        document.getElementById('chat-messages').innerHTML = '';
        document.getElementById('login').style.display = 'flex';
        document.getElementById('chat').style.display = 'none';
        this.socket.close();
    }

    setEvent() {
        document.getElementById('startChat').onclick = () => this.startChat();
        document.getElementById('cambiarNombre').onclick = () => this.cambiarNombre();
        document.getElementById('sendMessage').onclick = () => this.sendMessage();
        document.getElementById('message').onkeyup = (el) => {
            if (el.key === 'Enter') {
                el.preventDefault();
                this.sendMessage();
            }
        };
    }

    async init() {
        window.onload = async () => {
            if ("serviceWorker" in navigator) {
                await this.unsubscribe().catch(console.log);
                await this.subscription().catch(console.log);
            }
            this.setEvent();
            this.loadUsername();
        };
    }
}

const chatApp = new ChatApp();
