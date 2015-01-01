function SceneUniverse(game) {
	this.game = game;
	this.type = "universe";
	
	this.game.scene.setGravity(0, 0, 0);
	
	this.skybox = new Skybox(this.game.scene, "resources/textures/skybox/space-*.png");
	
	this.objects = new ObjectManager(this.game, this.game.conn);
	
	this.light = new THREE.AmbientLight(0xFFFFFF);
	this.game.scene.add(this.light);
	
	this.planet = new Planet(this.game.scene, "resources/textures/terrain.png");
}

SceneUniverse.prototype.update = function() {
}

SceneUniverse.prototype.unload = function() {
	this.game.scene.remove(this.light);
	this.objects.unload();
	this.skybox.unload();
}
