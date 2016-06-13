(function() {
    var socket = io.connect(window.location.hostname + ':' + 3000);
    var red = document.getElementById('red');
    var green = document.getElementById('green');
    var blue = document.getElementById('blue');

    function emitValue(color, e) {
        socket.emit('rgb', {
            color: color,
            value: e.target.value
        });
    }

    red.addEventListener('change', emitValue.bind(null, 'red'));
    blue.addEventListener('change', emitValue.bind(null, 'blue'));
    green.addEventListener('change', emitValue.bind(null, 'green'));

    socket.on('connect', function(data) {
        socket.emit('join', 'Client is connected!');
    });

    socket.on('rgb', function(data) {
        var color = data.color;
        document.getElementById(color).value = data.value;
    });
}());
