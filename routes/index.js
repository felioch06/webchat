const { Router } = require('express');
const path = require('path');
const router = Router();

const webpush = require("../server/webPush");
let pushSubscripton = [];

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './../public/index.html'));
});

router.post('/subscribe', (req, res) => {
  let subscription = pushSubscripton.find(sub => sub.endpoint === req.body.endpoint)
  if(!subscription) {
    pushSubscripton.push(req.body);
  }
  res.status(201).json();
});

router.post('/new-message', async (req, res) => {
  const { message, username, subscription } = req.body;

  let payload = JSON.stringify({
    title: username,
    click_action: location.origin,
    message
  });

  res.status(200).json();
  try {
    pushSubscripton.forEach(async (sub) => {
      if(subscription.endpoint == sub.endpoint) {
        await webpush.sendNotification(sub, payload);
      }
    });
  } catch (error) {
    console.error('Error al enviar la notificación:', error);
  }


});


module.exports = router;