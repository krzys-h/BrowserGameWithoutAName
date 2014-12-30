function Game(ui, input, conn, update_cb) {
	this.ui = ui;
	this.input = input;
	this.conn = conn;
	this.update_cb = update_cb;
	
	this.scene = new Physijs.Scene();
	
	this.running = true;
	this.timer = new FPS();
	this.scene.addEventListener('update', function() {
		var dt = this.timer.update();
		if(!this.running) return;
		
		this.update_cb(dt);
		this.player.update();
		this.scene.simulate();
	}.bind(this));
	
	this.conn.addHandler('server', 'spawn', this, function() {
		status("Logged in as <b>"+this.conn.user+"</b>");
		this.spawnPlayer(this.conn.user);
		this.startSimulation();
	});
	
	//TODO: Separate file for handling stats
	this.conn.addHandler('server', 'server status', function(data) {
		var s = "<b>Server status</b><br />";
		s += data.hostname+"<br />";
		s += "Avg load: "+data.load[0].toFixed(2)+" "+data.load[1].toFixed(2)+" "+data.load[2].toFixed(2)+"<br />";
		s += "Mem usage: "+((data.totalmem-data.freemem)/1024/1024).toFixed(2)+" MB / "+(data.totalmem/1024/1024).toFixed(2)+" MB";
		document.getElementById("server_status").innerHTML = s;
	});
}

Game.prototype.startSimulation = function() {
	this.running = true;
	this.scene.simulate();
}

Game.prototype.stopSimulation = function() {
	this.running = false;
}

Game.prototype.render = function(renderer, dt) {
	if(typeof this.camera == "undefined") return;
	
	renderer.render(this.scene, this.camera);
}

Game.prototype.spawnPlayer = function(username) {
	this.gamescene = new ScenePlanet(this);
	this.player = new Player(this.scene, this.gamescene.terrain, username);
	this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, WIDTH/HEIGHT, NEAR, FAR);
	this.camera.position.set(0, 2.5, 10)
	this.player.object.add(this.camera);
	this.player.label.visible = false;
	this.gamescene.objects.registerObject(username, this.player);
}

Game.prototype.onResize = function() {
	if(typeof this.camera != "undefined") {
		this.camera.aspect = WIDTH/HEIGHT
		this.camera.updateProjectionMatrix();
	}
}

Game.prototype.update = function() {
	if(typeof this.gamescene != "undefined") {
		this.gamescene.update();
		
		var inputData = this.input.getInputState();
		if(!this.player.grounded) inputData.jump = false; //TODO: serverside
		this.conn.server.emit('control', inputData);
	}
}
