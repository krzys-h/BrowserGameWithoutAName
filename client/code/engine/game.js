function Game(ui, input, conn, update_cb) {
	this.ui = ui;
	this.input = input;
	this.conn = conn;
	this.update_cb = update_cb;
	
	this.input.enableMouse(true);
	
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
	
	this.conn.addHandler('server', 'move to', this, function(target) {
		if(target == "universe")
			this.flyOutOfPlanet();
		else
			this.landOnPlanet();
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
	
	renderer.render(this.scene, this.camera.camera);
}

Game.prototype.spawnPlayer = function(username) {
	this.gamescene = new ScenePlanet(this);
	this.player = new Player(this.scene, username);
	this.player.label.visible = false;
	this.camera = new Camera(this.conn, this.player);
	this.gamescene.objects.registerObject(username, this.player, true);
}

Game.prototype.onResize = function() {
	if(typeof this.camera != "undefined") {
		this.camera.onResize();
	}
}

Game.prototype.update = function() {
	if(typeof this.camera != "undefined") {
		var md = this.input.getMouseDelta();
		this.camera.mouseUpdate(md);
		this.camera.update();
	}
	
	if(typeof this.gamescene != "undefined") {
		this.gamescene.update();
		
		var inputData = this.input.getInputState();
		if(!this.player.grounded) inputData.jump = false; //TODO: serverside
		inputData.lookDirection = this.camera.getDirection();
		this.conn.server.emit('control', inputData);
	}
	
	if(typeof this.player != "undefined") {
		this.player.render_update();
	}
}

Game.prototype.flyOutOfPlanet = function() {
	if(this.gamescene.type != "planet") return console.error("Not on planet");
	this.gamescene.unload();
	this.conn.server.emit('move to', 'universe');
	this.gamescene = new SceneUniverse(this);
	this.gamescene.objects.registerObject(this.conn.user, this.player, true);
}

Game.prototype.landOnPlanet = function() {
	if(this.gamescene.type != "universe") return console.error("Not in universe!");
	this.gamescene.unload();
	this.conn.server.emit('move to', 'planet');
	this.gamescene = new ScenePlanet(this);
	this.gamescene.objects.registerObject(this.conn.user, this.player, true);
}
