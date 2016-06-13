'use strict';

var five = require('johnny-five');
var led;
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'))
app.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/index.html')
});

five.Board().on('ready', function() {
  console.log('Arduino is ready.');

  var state = {
      red: 1, green: 1, blue: 1
  };

  led = new five.Led.RGB({
    pins: {
      red: 6,
      green: 3,
      blue: 5
    }
  });

  var setStateColor = function(state) {
      led.color({
          red: state.red,
          blue: state.blue,
          green: state.green
      });
  }

  io.on('connection', function(client) {
      client.on('join', function(handshake) {
          console.log(handshake);
      });

      // Set initial state
      setStateColor(state);

      client.on('rgb', function(data) {
          console.log(data);

          state.red = data.color === 'red' ? data.value : state.red;
          state.green = data.color === 'green' ? data.value : state.green;
          state.blue = data.color === 'blue' ? data.value : state.blue;

          setStateColor(state);

          client.emit('rgb', data);
          client.broadcast.emit('rgb', data);
      });

      led.on();
  });
});

server.listen(process.env.PORT || 3000);
