var gkm = require('./customgkm.js');
const express = require('express');
const path = require('path');
const app = express();
const init = Date.now()
app.get('/stats', function(req, res){
    res.send(200, {
        since: init,
        for: process.uptime(),
        mouseMoveTotal: totalCMx + totalCMy,
        mouseMoveX: totalCMx,
        mouseMoveY: totalCMy,
        mouseMovePerSecond: ((totalCMx + totalCMy) / process.uptime()),
        keyStrokes: keystrokes,
        keyStrokesPerSecond: keystrokes / process.uptime(),
        mouseClicks: mouseclicks,
        mouseClicksPerSecond: mouseclicks.all / process.uptime(),
        allKeyStrokes: muk
    })
})
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/static/index.html'));
  });
app.get('/axios.min.js', function(req, res) {
    res.header('Content-Type', 'application/javascript')
    res.sendFile(path.join(__dirname, '/static/axios.min.js'));
  });
app.get('/bootstrap.min.css', function(req, res) {
    res.header('Content-Type', 'text/css')
    res.sendFile(path.join(__dirname, '/static/bootstrap.min.css'));
  });
let muk = {}
app.listen(2202)
const pressedKeys    = new Set()

// Listen to all key events (pressed, released, typed)
gkm.events.on('key.pressed', function(data) {
    data = data[0]
    if (!pressedKeys.has(data)) {
        pressedKeys.add(data)
    }
    // console.log(this.event + ' ' + data);
});
gkm.events.on('key.released', function(data) {
    data = data[0]
    if (pressedKeys.has(data)) {
        pressedKeys.delete(data)
        keystrokes++
        let keydata = muk[data]
        if (keydata) {
            muk[data] = {pressed: keydata.pressed + 1}
        } else {
            muk [data] = {pressed: 1}
        }
    }
    // console.log(this.event + ' ' + data);
});
let totalCMx = 0
let totalCMy = 0
let lastxcent = 0
let lastycent = 0
let keystrokes = 0
let mouseclicks = {
    left: 0,
    right: 0,
    middle: 0,
    all: 0
}
// Listen to all mouse events (click, pressed, released, moved, dragged)
gkm.events.on('mouse.moved', function(data) {
    // console.log(this.event + ' ' + data);
    let x = parseInt(data[0].split(",")[0]);
    let y = parseInt(data[0].split(",")[1]);
    // console.log(x, y);
    let xcent = (x / 100) / 3.42 //1.8
    let ycent = (y / 100) / 3.42 //1.8
    // console.log(xcent, ycent);
    totalCMx = totalCMx + Math.abs(lastxcent - xcent)
    totalCMy = totalCMy + Math.abs(lastycent - ycent)
    lastxcent =  xcent
    lastycent =  ycent
});
gkm.events.on('mouse.*', function(data) {
    if (this.event === "mouse.pressed") {
        // console.log(this.event, data);
        if (parseInt(data[0]) === 1) {
            mouseclicks.left++
        }
        if (parseInt(data[0]) === 2) {
            mouseclicks.right++
        }
        if (parseInt(data[0]) === 3) {
            mouseclicks.middle++
        }
    }
});
gkm.events.on('mouse.clicked', function(data) {
    mouseclicks.all++
});

setInterval(() => {
    // console.log(totalCMx);
    // console.log(totalCMy);
    // console.log(keystrokes);
}, 1000);