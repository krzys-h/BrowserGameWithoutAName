var Config = require('../server-common/config.js');

var crypto = require('crypto');

// HTTP server
//TODO: This will be hosted by Apache at some point
var static_files = new (require('node-static').Server)('../client');
require('http').createServer(
	function (req, res) {
		static_files.serve(req, res);
	}
).listen(Config.HTTP_PORT);
console.log('HTTP server is now running at http://'+Config.MASTERSERVER_HOST+':'+Config.HTTP_PORT+'/')


var io_server = require('socket.io').listen(Config.MASTERSERVER_PORT);
var io_client = require('socket.io-client');
console.log('Successfully started socket.io server at '+Config.MASTERSERVER_HOST+':'+Config.MASTERSERVER_PORT)

function Watchdog(func, time) {
	this.func = func
	this.time = time
}
Watchdog.prototype.start = function() {
	this.stop();
	var wd = this;
	this.timer = setTimeout(function() {
		wd.func();
		delete wd.timer;
	}, this.time);
}
Watchdog.prototype.stop = function() {
	if(typeof this.timer != "undefined") {
		clearTimeout(this.timer);
		delete this.timer;
	}
}
Watchdog.prototype.reset = function() {
	this.stop();
	this.start();
}

var servers = {}
var io_s = io_server.of('/masterserver');
io_s.on('connection', function(socket) {
	console.log('server connection');
	
	var timeout = new Watchdog(function() {
		console.log('Server timed out')
		socket.disconnect('timeout');
	}, 30000);
	timeout.start();
	
	var serverid;
	socket.on('register', function(data) {
		timeout.reset();
		//TODO: check data.serverid format
		serverid = data.serverid;
		console.log('Server register request '+data.serverid+' - '+data.ip+':'+data.port)
		var conn_timeout = new Watchdog(function() {
			console.log('Server disconnected, no response in time');
			conn.disconnect();
			socket.disconnect('register ping timeout')
		}, 5000);
		conn_timeout.start();
		var conn = io_client.connect('http://'+data.ip+':'+data.port+'/');
		conn.on('connect', function() {
			conn.emit('serverping', {}, function() {
				conn_timeout.stop();
				conn.disconnect();
				console.log('New server '+data.serverid+' connected - '+data.ip+':'+data.port);
				servers[data.serverid] = {serverid: data.serverid, ip: data.ip, port: data.port};
			});
		});
	});
	
	socket.on('ping', function(data, reply) {
		if(typeof serverid == 'undefined') return;
		timeout.reset();
		//console.log('Ping - '+serverid);
		reply();
	});
	
	socket.on('verifysession', function(data, reply) {
		if(typeof serverid == 'undefined') return;
		timeout.reset();
		console.log('Session validate request from '+serverid+' for '+data.login);
		for(var i=0; i<sessions.length; i++) {
			if(sessions[i].login == data.login && sessions[i].sessionid == data.session) {
				reply({error: false});
				return;
			}
		}
		reply({error: true, message: "Invalid session"});
	});
	
	socket.on('unregister', function() {
		if(typeof serverid == 'undefined') return;
		timeout.reset();
		console.log('Server unregister - '+serverid);
		delete servers[serverid];
		socket.disconnect('unregistered');
	});

	socket.on('disconnect', function() {
		console.log('server disconnection');
		if(typeof serverid != 'undefined') {
			delete servers[serverid];
		}
		timeout.stop();
	});
});
console.log('Master server server interface is now running at '+Config.MASTERSERVER_HOST+':'+Config.MASTERSERVER_PORT+'/masterserver');

function pickRandomProperty(obj) {
	var result;
	var count = 0;
	for (var prop in obj)
		if (Math.random() < 1/++count)
		   result = prop;
	return result;
}

var sessions = [];
var io_c = io_server.of('/master');
io_c.on('connection', function(socket) {
	console.log('connection');
	
	var hashkey = "randomstring";
	socket.emit('welcome', {hashkey: hashkey});
	socket.emit('server message', {text: "There are "+Object.keys(servers).length+" servers currently online"});
	
	var login;
	socket.on('login', function(data, reply) {
		//if(data.login == "krzys_h" && data.password == crypto.createHash('md5').update("test"+hashkey).digest('hex')) {
		if(true) {
			login = data.login;
			socket.emit('server message', {text: "Welcome, "+data.login+"!"});
			var sessionid = "somesessionid";
			var server = servers[pickRandomProperty(servers)];
			if(typeof server == "undefined") {
				reply({error: true, message: "No servers available"});
				console.log("No servers available!");
				return;
			}
			console.log("Sending "+data.login+" to server "+server.serverid);
			sessions.push({login: data.login, sessionid: sessionid});
			reply({error: false, session: sessionid, server: server});
		} else {
			reply({error: true, message: "Bad username or password"});
		}
	});
	
	socket.on('chat', function(message) {
		var from = "(Anonymous)";
		if(typeof login != "undefined") from = login;
		io_c.emit('chat', {from: from, message: message});
	});

	socket.on('disconnect', function() {
		console.log('disconnection');
	});
});
console.log('Master server client interface is now running at '+Config.MASTERSERVER_HOST+':'+Config.MASTERSERVER_PORT+'/master');
