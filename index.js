var gkm = require('./customgkm.js');
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(require('cors')())
const init = Date.now()
let lud = null;
let muk = {}
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

if (fs.existsSync('./lud.json')) {
        lud  = (JSON.parse(fs.readFileSync("./lud.json", "utf8")));
        mouseMoveX = lud.mouseMoveX;
        mouseMoveY = lud.mouseMoveY;
        keystrokes = lud.keyStrokes;
        mouseclicks = lud.mouseClicks;
        muk = lud.allKeyStrokes
}
app.get('/stats', function(req, res){
    res.send(200, 
        userData()
    )
})

function userData() { 
    return {
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
    }
}

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
app.listen(2202)
const pressedKeys = new Set()

// Listen to all key events (pressed, released, typed)
gkm.events.on('key.pressed', function(data) {
    data = data[0]
    if (!pressedKeys.has(data)) {
        pressedKeys.add(data)
    }
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
});

// Listen to all mouse events (click, pressed, released, moved, dragged)
gkm.events.on('mouse.moved', function(data) {
    let x = parseInt(data[0].split(",")[0]);
    let y = parseInt(data[0].split(",")[1]);
    let xcent = (x / 100) / 3.42 //1.8
    let ycent = (y / 100) / 3.42 //1.8
    totalCMx = totalCMx + Math.abs(lastxcent - xcent)
    totalCMy = totalCMy + Math.abs(lastycent - ycent)
    lastxcent =  xcent
    lastycent =  ycent
});
gkm.events.on('mouse.*', function(data) {
    if (this.event === "mouse.pressed") {
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
    fs.writeFileSync("./lud.json", JSON.stringify(userData()))
}, 5000);