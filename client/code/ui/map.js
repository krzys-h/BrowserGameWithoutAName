Map = function(ui, conn, planet)
{
	this.planet = planet;
	
	this.generatorStatus = [];
	
	this.canvas = document.createElement("canvas");
	this.canvas.width = this.canvas.height = 768;
	this.ctx = this.canvas.getContext("2d");
	
	this.texture = new THREE.Texture(this.canvas);
	this.texture.needsUpdate = true;
	this.material = new THREE.SpriteMaterial({map: this.texture});
	this.object = new THREE.Sprite(this.material);
	this.object.position.set(-WIDTH/2+128, HEIGHT/2-128, 1);
	this.object.scale.set(256, 256, 1);
	ui.scene.add(this.object);
	
	conn.addHandler('server', 'terrain generation status', this, Map.prototype.generatorData);
}

Map.prototype.update = function()
{
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	
	if(typeof this.planet.game.player != "undefined") {
		var center = this.planet.terrain.posToChunk(this.planet.game.player.object.position.x, this.planet.game.player.object.position.z, false);
	
		for(var i = 0; i < this.generatorStatus.length; i++) {
			var job = this.generatorStatus[i];
			if(this.planet.terrain.chunkLoaded(job.x, job.y)) continue;
	
			var map_x = (job.x-center.x)*TerrainConstants.CHUNKSIZE+(this.canvas.width/2);
			var map_y = (job.y-center.y)*TerrainConstants.CHUNKSIZE+(this.canvas.height/2);
			if(map_x < -TerrainConstants.CHUNKSIZE || map_y < -TerrainConstants.CHUNKSIZE || map_x > this.canvas.width || map_y > this.canvas.height) continue;
		
			this.ctx.fillStyle = (job.ready ? "#00FF00" : (job.working ? "#FF0000" : "#0000FF"));
			this.ctx.fillRect(map_x, map_y, 64, 64);
		
			if(this.planet.terrainloader.isQueued(job.x, job.y)) {
				this.ctx.beginPath();
				this.ctx.arc(map_x+(TerrainConstants.CHUNKSIZE/2), map_y+(TerrainConstants.CHUNKSIZE/2), 5, 0, 2 * Math.PI, false);
				this.ctx.fillStyle = "#660066";
				this.ctx.fill();
			}
		}
	
		for(var x in this.planet.terrain.chunks) {
			for(var y in this.planet.terrain.chunks[x]) {
				var map_x = (x-center.x)*TerrainConstants.CHUNKSIZE+(this.canvas.width/2);
				var map_y = (y-center.y)*TerrainConstants.CHUNKSIZE+(this.canvas.height/2);
				if(map_x < -TerrainConstants.CHUNKSIZE || map_y < -TerrainConstants.CHUNKSIZE || map_x > this.canvas.width || map_y > this.canvas.height) continue;
				this.renderChunk(this.planet.terrain.chunks[x][y], map_x, map_y);
			}
		}
	
		this.ctx.beginPath();
		this.ctx.arc(this.canvas.width/2, this.canvas.height/2, 5, 0, 2 * Math.PI, false);
		this.ctx.fillStyle = "#990033";
		this.ctx.fill();
	}
	
	this.texture.needsUpdate = true;
}

Map.prototype.renderChunk = function(chunk, map_x, map_y)
{
	if(typeof chunk.imageData == "undefined") {
		chunk.imageData = this.ctx.createImageData(TerrainConstants.CHUNKSIZE, TerrainConstants.CHUNKSIZE);
		for(var i = 0; i < TerrainConstants.CHUNKSIZE; i++) {
			for(var j = 0; j < TerrainConstants.CHUNKSIZE; j++) {
				var index = 4*(i+j*TerrainConstants.CHUNKSIZE);
				for(var k = 0; k <= 2; k++)
					chunk.imageData.data[index+k] = chunk.getAt(i, j)*255;
				chunk.imageData.data[index+3] = 255;
			}
		}
	}
	this.ctx.putImageData(chunk.imageData, map_x, map_y);
}

Map.prototype.generatorData = function(data) {
	this.generatorStatus = data;
}
