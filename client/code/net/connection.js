function Connection(ready_cb) {
	this.handlers = {master: {}, server: {}};
	
	this.master = io.connect("http://"+window.location.hostname+":8888/master");
	var conn = this;
	this.addHandler("master", "welcome", this, function(data) {
		this.hashkey = data.hashkey;
		ready_cb();
	});
}

Connection.prototype.login = function(login, password, ready_cb) {
	var conn = this;
	this.user = login;
	this.master.emit("login", {login: login, password: CryptoJS.MD5(password+this.hashkey).toString()}, function(data) {
		if(data.error) {
			console.error(data.message);
			ready_cb(false, data.message);
		} else {
			conn.sessionid = data.session;
			console.log('Logged in to master server');
			conn.connectToServer(data.server, function(success, msg) {
				ready_cb(success);
			});
		}
	});
}

Connection.prototype.connectToServer = function(serverdata, ready_cb) {
	this.server = io.connect("http://"+serverdata.ip+":"+serverdata.port+"/");
	this.attachHandlers("server", this.server);
	this.addHandler("server", "connect", this, function() {
		this.server.emit("login", {login: conn.user, session: conn.sessionid, server: serverdata.serverid}, function(data) {
			if(data.error) {
				console.error(data.message);
				ready_cb(false, data.message);
			} else {
				console.log("Connected to server");
				ready_cb(true);
			}
		}.bind(this));
	});
}

Connection.prototype.addHandler = function(type, event, handler_object, handler)
{
	if(type != "master" && type != "server")
		return console.error("Incorrect type!");
	if(typeof handler == "undefined") {
		handler = handler_object;
		handler_object = undefined;
	}
	if(typeof this.handlers[type][event] == "undefined") this.handlers[type][event] = [];
	var new_handler = handler;
	if(typeof handler_object != "undefined")
		new_handler = new_handler.bind(handler_object);
	this.handlers[type][event].push({handler: new_handler, attached: false});
	if(typeof this[type] != "undefined") {
		this.attachHandlers(type, this[type]);
	}
}

Connection.prototype.attachHandlers = function(type, socket) {
	for(event in this.handlers[type]) {
		for(var i = 0; i < this.handlers[type][event].length; i++) {
			if(this.handlers[type][event][i].attached) continue;
			socket.on(event, this.handlers[type][event][i].handler);
			this.handlers[type][event][i].attached = true;
		}
	}
}

Connection.prototype.removeHandlers = function(type, event) {
	for(var i = 0; i < this.handlers[type][event].length; i++) {
		if(!this.handlers[type][event][i].attached) continue;
		this[type].removeListener(event, this.handlers[type][event][i].handler);
	}
	this.handlers[type][event] = [];
}
