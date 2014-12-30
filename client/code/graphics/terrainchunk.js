function TerrainChunk(chunk, scene, material) {
	this.x = chunk.x;
	this.y = chunk.y;
	this.material = material;
	
	this.geometry = new THREE.PlaneGeometry(TerrainConstants.WORLDSIZE, TerrainConstants.WORLDSIZE, TerrainConstants.CHUNKSIZE, TerrainConstants.CHUNKSIZE);
	this.geometry.dynamic = true;
	for(var x = 0; x < TerrainConstants.CHUNKSIZE; x++) {
		for(var y = 0; y < TerrainConstants.CHUNKSIZE; y++) {
			this.setAt(x, y, chunk.data[x][y]);
		}
	}
	
	this.object = new Physijs.HeightfieldMesh(this.geometry, this.material, 0, TerrainConstants.CHUNKSIZE, TerrainConstants.CHUNKSIZE);
	this.object.position.x = TerrainConstants.WORLDSIZE*this.x;
	this.object.position.y = -0.5;
	this.object.position.z = -TerrainConstants.WORLDSIZE*this.y;
	this.object.rotation.x = Math.PI / 2;
	scene.add(this.object);
	
	if(typeof THREE.GridHelper.prototype.setColors != "undefined") {
		this.gridX = new THREE.GridHelper(TerrainConstants.WORLDSIZE, 16);
		this.gridX.setColors(new THREE.Color(0x006600), new THREE.Color(0x006600));
		this.gridX.position.set(0, 0.5*TerrainConstants.WORLDSIZE, 0);
		this.object.add(this.gridX);
	
		this.gridY = new THREE.GridHelper(TerrainConstants.WORLDSIZE, 16);
		this.gridY.setColors(new THREE.Color(0x660000), new THREE.Color(0x660000));
		this.gridY.position.set(0.5*TerrainConstants.WORLDSIZE, 0, 0);
		this.gridY.rotation.z = Math.PI / 2;
		this.object.add(this.gridY);
	}
}

TerrainChunk.prototype.align = function(axis, other) {
	console.log("Aligning chunk "+this.x+","+this.y+" to "+other.x+","+other.y+" on "+axis);
	if(axis == 'x') {
		for(var y = 0; y < TerrainConstants.CHUNKSIZE; y++) {
			this.setAt(TerrainConstants.CHUNKSIZE, y, other.getAt(0, y));
		}
		this.setAt(TerrainConstants.CHUNKSIZE, TerrainConstants.CHUNKSIZE, other.getAt(0, TerrainConstants.CHUNKSIZE-1)); //TODO: this still leaves small holes
	}
	if(axis == 'y') {
		for(var x = 0; x < TerrainConstants.CHUNKSIZE; x++) {
			this.setAt(x, TerrainConstants.CHUNKSIZE, other.getAt(x, 0));
		}
		this.setAt(TerrainConstants.CHUNKSIZE, TerrainConstants.CHUNKSIZE, other.getAt(TerrainConstants.CHUNKSIZE-1, 0)); //TODO: this still leaves small holes
	}
	this.geometry.verticesNeedUpdate = true;
}

TerrainChunk.prototype.getAt = function(x, y) {
	return (this.geometry.vertices[y*(TerrainConstants.CHUNKSIZE+1)+x].z+TerrainConstants.MAXHEIGHT)/TerrainConstants.MAXHEIGHT;
}

TerrainChunk.prototype.setAt = function(x, y, v) {
	this.geometry.vertices[y*(TerrainConstants.CHUNKSIZE+1)+x].z = -TerrainConstants.MAXHEIGHT + v * TerrainConstants.MAXHEIGHT;
}

TerrainChunk.prototype.unload = function() {
	if(typeof this.object._eventListeners.removed != "undefined") {
		this.object._eventListeners.removed[0]({target: this.object}); //TODO: This is some bug in Physijs/Three.JS, causing a memory leak
	}
	delete this.object;
	if(typeof this.geometry.dispose != "undefined") {
		this.geometry.dispose();
	} else {
		this.geometry.deallocate();
	}
	delete this.geometry;
	if(typeof this.imageData != "undefined") {
		delete this.imageData;
	}
}

if(typeof module !== 'undefined') module.exports = TerrainChunk;
