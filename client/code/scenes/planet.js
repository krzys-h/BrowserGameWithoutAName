function ScenePlanet(game) {
	this.game = game;
	
	this.skybox = new Skybox(this.game.scene, "resources/textures/skybox/space-*.png");
	this.terrain = new Terrain(this.game.scene, "resources/textures/terrain.png");
	
	this.objects = new ObjectManager(this.game, this.game.conn);
	
	this.terrainloader = new TerrainLoader(this.terrain, function(x, y) {
		this.game.conn.server.emit('request terrain', [{x: x, y: y}]);
	}.bind(this));
	
	this.game.conn.addHandler('server', 'terrain', this, function(data) {
		this.terrain.loadChunk(data);
		this.terrainloader.onLoaded(data.x, data.y);
	});
	
	this.map = new Map(this.game.ui, this.game.conn, this);
	
	var ambient = new THREE.AmbientLight(0xFFFFFF);
	this.game.scene.add(ambient);
}

ScenePlanet.prototype.update = function() {
	var c = this.terrain.posToChunk(this.game.player.object.position.x, this.game.player.object.position.z);
	this.terrainloader.load(c.x, c.y, 5);
	this.terrainloader.autoUnload();
	
	this.map.update();
}

if(typeof module !== 'undefined') module.exports = SceneGame;
