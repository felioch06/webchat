require('dotenv').config();

const express = require('express');
const socket = require('./socket');
const morgan = require('morgan');
const path = require('path');
const app = express();


const PORT = process.env.PORT || 8080;
const server = require('http').Server(app); 

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(require('../routes/index'));
app.use(express.static(path.join(__dirname, '../public')));

socket(server);

server.listen(PORT, () => {
    console.log(`Servidor WebSocket y Express corriendo en el puerto ${PORT}`);
});
