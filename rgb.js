'use strict';

const five = require('johnny-five');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

let led = null;

app.use(express.static(__dirname + '/public'))
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html')
});

five.Board().on('ready', function() {
  console.log('Arduino is ready.');

  // Initial state
  let state = {
    red: 1, green: 1, blue: 1
  };

  // Map pins to digital inputs on the board
  led = new five.Led.RGB({
    pins: {
      red: 6,
      green: 3,
      blue: 5
    }
  });

  // Helper function to set the colors
  let setStateColor = function(state) {
    led.color({
      red: state.red,
      blue: state.blue,
      green: state.green
    });
  };

  io.on('connection', function(client) {
    client.on('join', function(handshake) {
      console.log(handshake);
    });

    // Set initial state
    setStateColor(state);

    client.on('rgb', function(data) {
      state.red = data.color === 'red' ? data.value : state.red;
      state.green = data.color === 'green' ? data.value : state.green;
      state.blue = data.color === 'blue' ? data.value : state.blue;

      // Set the new colors
      setStateColor(state);

      client.emit('rgb', data);
      client.broadcast.emit('rgb', data);
    });

    // Turn on the RGB LED
    led.on();
  });
});

const port = process.env.PORT || 3000;

server.listen(port);
console.log(`Server listening on http://localhost:${port}`);
