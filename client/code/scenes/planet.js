function ScenePlanet(game) {
	this.game = game;
	this.type = "planet";
	
	this.skybox = new Skybox(this.game.scene, "resources/textures/skybox/space-*.png");
	this.terrain = new Terrain(this.game.scene, "resources/textures/terrain.png");
	
	this.objects = new ObjectManager(this.game, this.game.conn);
	
	this.terrainloader = new TerrainLoader(this.terrain, function(x, y) {
		this.game.conn.server.emit('request terrain', [{x: x, y: y}]);
	}.bind(this));
	
	this.game.conn.addHandler('server', 'terrain', this, ScenePlanet.prototype.receiveTerrain);
	
	this.map = new Map(this.game.ui, this.game.conn, this);
	
	this.light = new THREE.AmbientLight(0xFFFFFF);
	this.game.scene.add(this.light);
}

ScenePlanet.prototype.update = function() {
	var c = this.terrain.posToChunk(this.game.player.object.position.x, this.game.player.object.position.z);
	this.terrainloader.load(c.x, c.y, 5);
	this.terrainloader.autoUnload();
	
	this.map.update();
}

ScenePlanet.prototype.receiveTerrain = function(data) {
	this.terrain.loadChunk(data);
	this.terrainloader.onLoaded(data.x, data.y);
}

ScenePlanet.prototype.unload = function() {
	this.game.scene.remove(this.light);
	this.map.unload();
	this.game.conn.removeHandlers('server', 'terrain');
	this.objects.unload();
	this.terrain.unload();
	this.skybox.unload();
}
