function Terrain(scene, texture_path)
{
	this.scene = scene;
	this.debug = false;
	
	this.texture = new THREE.ImageUtils.loadTexture(texture_path);
	this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping; 
	this.texture.repeat.set(5, 5);
	this.material = Physijs.createMaterial(
		new THREE.MeshLambertMaterial({map: this.texture, side: THREE.DoubleSide}),
		.8, // high friction
		.4 // low restitution
	);
	
	this.chunks = {};
}

Terrain.prototype.loadChunk = function(chunk) {
	if(typeof this.chunks[chunk.x] == "undefined") this.chunks[chunk.x] = {};
	console.log("loading chunk "+chunk.x+","+chunk.y);
	this.chunks[chunk.x][chunk.y] = new TerrainChunk(chunk, this.scene, this.material);
	if(typeof this.chunks[chunk.x][chunk.y].gridX != "undefined")
		this.chunks[chunk.x][chunk.y].gridX.visible = this.debug;
	if(typeof this.chunks[chunk.x][chunk.y].gridY != "undefined")
		this.chunks[chunk.x][chunk.y].gridY.visible = this.debug;
	this.alignChunks(this.chunks[chunk.x][chunk.y]);
}

Terrain.prototype.alignChunks = function(chunk) {
	if(this.chunkLoaded(chunk.x+1, chunk.y)) chunk.align('x', this.chunks[chunk.x+1][chunk.y]);
	if(this.chunkLoaded(chunk.x, chunk.y+1)) chunk.align('y', this.chunks[chunk.x][chunk.y+1]);
	if(this.chunkLoaded(chunk.x-1, chunk.y)) this.chunks[chunk.x-1][chunk.y].align('x', chunk);
	if(this.chunkLoaded(chunk.x, chunk.y-1)) this.chunks[chunk.x][chunk.y-1].align('y', chunk);
}

Terrain.prototype.chunkLoaded = function(x, y) {
	if(typeof this.chunks[x] == "undefined") return false;
	if(typeof this.chunks[x][y] == "undefined") return false;
	return true;
}

Terrain.prototype.unloadChunk = function(x, y) {
	if(!this.chunkLoaded(x, y)) return;
	this.scene.remove(this.chunks[x][y].object);
	this.chunks[x][y].unload();
	delete this.chunks[x][y];
}

Terrain.prototype.posToChunk = function(x, z, round) {
	if(typeof round == "undefined") round = true;
	var c = {
		x: ( x+TerrainConstants.WORLDSIZE/2)/TerrainConstants.WORLDSIZE,
		y: (-z+TerrainConstants.WORLDSIZE/2)/TerrainConstants.WORLDSIZE
	}
	if(round) {
		c.x = Math.floor(c.x);
		c.y = Math.floor(c.y);
	}
	return c;
}

Terrain.prototype.chunkToPos = function(x, y) {
	return {x: x*TerrainConstants.WORLDSIZE, z: y*TerrainConstants.WORLDSIZE};
}

Terrain.prototype.toggleDebug = function(debug) {
	this.debug = debug;
	for(var x in this.chunks) {
		for(var y in this.chunks[x]) {
			if(typeof this.chunks[x][y].gridX != "undefined")
				this.chunks[x][y].gridX.visible = this.debug;
			if(typeof this.chunks[x][y].gridY != "undefined")
				this.chunks[x][y].gridY.visible = this.debug;
		}
	}
}

Terrain.prototype.unload = function() {
	for(var x in this.chunks) {
		for(var y in this.chunks[x]) {
			this.scene.remove(this.chunks[x][y].object);
			this.chunks[x][y].unload();
		}
	}
	this.chunks = [];
	this.material.dispose();
	this.texture.dispose();
}

if(typeof module !== 'undefined') module.exports = Terrain;
