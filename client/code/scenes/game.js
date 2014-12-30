function SceneGame(conn, update_cb) {
	this.update_cb = update_cb;
	
	this.scene = new Physijs.Scene();
	
	this.skybox = new Skybox(this.scene, "resources/textures/skybox/space-*.png");
	this.terrain = new Terrain(this.scene, "resources/textures/terrain.png");
	
	this.objects = new ObjectManager(this, conn);
	
	var ambient = new THREE.AmbientLight(0xFFFFFF);
	this.scene.add(ambient);
	
	this.running = true;
	this.timer = new FPS();
	this.scene.addEventListener('update', function() {
		var dt = this.timer.update();
		if(!this.running) return;
		
		this.update_cb(dt);
		this.scene.simulate();
	}.bind(this));
}

SceneGame.prototype.startSimulation = function() {
	this.running = true;
	this.scene.simulate();
}

SceneGame.prototype.stopSimulation = function() {
	this.running = false;
}

SceneGame.prototype.render = function(renderer, dt) {
	if(typeof this.camera == "undefined") return;
	
	renderer.render(this.scene, this.camera);
}

SceneGame.prototype.spawnPlayer = function(username) {
	this.player = new Player(this.scene, this.terrain, username);
	this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, WIDTH/HEIGHT, NEAR, FAR);
	this.camera.position.set(0, 2.5, 10)
	this.player.object.add(this.camera);
	this.player.label.visible = false;
	this.objects.registerObject(username, this.player);
}

SceneGame.prototype.onResize = function() {
	if(typeof this.camera != "undefined") {
		this.camera.aspect = WIDTH/HEIGHT
		this.camera.updateProjectionMatrix();
	}
}

if(typeof module !== 'undefined') module.exports = SceneGame;
