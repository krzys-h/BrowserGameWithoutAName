function Connection(ready_cb, objects_cb) {
	this.objects_cb = objects_cb;
	this.master = io.connect("http://"+window.location.hostname+":8888/master");
	var conn = this;
	this.master.on("welcome", function(data) {
		conn.hashkey = data.hashkey;
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
	var conn = this;
	this.server = io.connect("http://"+serverdata.ip+":"+serverdata.port+"/");
	this.server.on("connect", function() {
		conn.server.emit("login", {login: conn.user, session: conn.sessionid, server: serverdata.serverid}, function(data) {
			if(data.error) {
				console.error(data.message);
				ready_cb(false, data.message);
			} else {
				console.log("Connected to server");
				conn.server.on("objects update", function(data) {
					conn.objects_cb(data);
				});
				ready_cb(true);
			}
		});
	});
}
