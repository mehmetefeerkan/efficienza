'use strict';

// console.log("modified gkm loaded.");
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var path = require('path');
var spawn = require('child_process').spawn;

var events = new EventEmitter2({wildcard: true});
var gkm = spawn('javaw', ['-jar', path.join(__dirname, 'node_modules/gkm/lib/gkm.jar')]);

gkm.stdout.on('data', function(data) {
	data = data.toString().split(/\r\n|\r|\n/).filter(function(item) { return item; });
	for (var i in data) {
		var parts = data[i].split(':');
		events.emit(parts[0], parts.slice(1));
	}
});

module.exports = {
	events: events
};