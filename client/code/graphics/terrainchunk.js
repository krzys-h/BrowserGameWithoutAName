function TerrainChunk(chunk, scene, material) {
	this.x = chunk.x;
	this.y = chunk.y;
	this.material = material;
	
	this.geometry = new THREE.PlaneGeometry(64, 64, 64, 64);
	this.geometry.dynamic = true;
	for(var x = 0; x < 64; x++) {
		for(var y = 0; y < 64; y++) {
			this.setAt(x, y, chunk.data[x][y]);
		}
	}
	
	this.object = new Physijs.HeightfieldMesh(this.geometry, this.material, 0, 64, 64);
	this.object.position.x = 64*this.x;
	this.object.position.y = -0.5;
	this.object.position.z = -64*this.y;
	this.object.rotation.x = Math.PI / 2;
	scene.add(this.object);
}

TerrainChunk.prototype.align = function(axis, other) {
	console.log("Aligning chunk "+this.x+","+this.y+" to "+other.x+","+other.y+" on "+axis);
	if(axis == 'x') {
		for(var y = 0; y < 64; y++) {
			this.geometry.vertices[y*65+64].z = other.geometry.vertices[y*65+0].z;
		}
		this.geometry.vertices[64*65+64].z = other.geometry.vertices[63*65+0].z; //TODO: this still leaves small holes
	}
	if(axis == 'y') {
		for(var x = 0; x < 64; x++) {
			this.geometry.vertices[64*65+x].z = other.geometry.vertices[0*65+x].z;
		}
		this.geometry.vertices[64*65+64].z = other.geometry.vertices[0*65+63].z; //TODO: this still leaves small holes
	}
	this.geometry.verticesNeedUpdate = true;
}

TerrainChunk.prototype.getAt = function(x, y) {
	return (this.geometry.vertices[y*65+x].z+20)/20;
}

TerrainChunk.prototype.setAt = function(x, y, v) {
	this.geometry.vertices[y*65+x].z = -20 + v * 20;
}

if(typeof module !== 'undefined') module.exports = TerrainChunk;
