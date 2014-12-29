function Terrain(scene, texture_path)
{
	this.scene = scene;
	
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

if(typeof module !== 'undefined') module.exports = Terrain;
