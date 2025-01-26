const {Router} = require('express');
const path = require('path');
const router = Router();

const webpush = require("../server/webPush");
let pushSubscripton;

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './../public/index.html'));
});

router.post('/subscribe', (req, res) => {
    pushSubscripton = req.body;
    res.status(201).json();
  });

router.post('/new-message', async (req, res) => {
    const { message, username } = req.body;
    
    let payload = JSON.stringify({
      title: username,
      message
    });

    res.status(200).json();
    try {
        await webpush.sendNotification(pushSubscripton, payload);
    } catch (error) {
        console.error('Error al enviar la notificación:', error);
    }
   
  
  });


module.exports = router;