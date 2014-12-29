Map = function(ui, player, terrain, terrainldr)
{
	this.player = player;
	this.terrain = terrain;
	this.terrainldr = terrainldr;
	
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
}

Map.prototype.update = function()
{
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	
	var center_x = (this.player.object.position.x+32)/64;
	var center_y = (-this.player.object.position.z+32)/64;
	
	for(var i = 0; i < this.generatorStatus.length; i++) {
		var job = this.generatorStatus[i];
	
		var map_x = (job.x-center_x)*64+(this.canvas.width/2);
		var map_y = (job.y-center_y)*64+(this.canvas.height/2);
		if(map_x < -64 || map_y < -64 || map_x > this.canvas.width || map_y > this.canvas.height) continue;
		
		this.ctx.fillStyle = (job.ready ? "#00FF00" : (job.working ? "#FF0000" : "#0000FF"));
		this.ctx.fillRect(map_x, map_y, 64, 64);
		
		if(this.terrainldr.isQueued(job.x, job.y)) {
			this.ctx.beginPath();
			this.ctx.arc(map_x+32, map_y+32, 5, 0, 2 * Math.PI, false);
			this.ctx.fillStyle = "#660066";
			this.ctx.fill();
		}
	}
	
	for(var x in this.terrain.chunks) {
		for(var y in this.terrain.chunks[x]) {
			var map_x = (x-center_x)*64+(this.canvas.width/2);
			var map_y = (y-center_y)*64+(this.canvas.height/2);
			if(map_x < -64 || map_y < -64 || map_x > this.canvas.width || map_y > this.canvas.height) continue;
			this.renderChunk(this.terrain.chunks[x][y], map_x, map_y);
		}
	}
	
	this.ctx.beginPath();
	this.ctx.arc(this.canvas.width/2, this.canvas.height/2, 5, 0, 2 * Math.PI, false);
	this.ctx.fillStyle = "#990033";
	this.ctx.fill();
	
	this.texture.needsUpdate = true;
}

Map.prototype.renderChunk = function(chunk, map_x, map_y)
{
	if(typeof chunk.imageData == "undefined") {
		chunk.imageData = this.ctx.createImageData(64, 64);
		for(var i = 0; i < 64; i++) {
			for(var j = 0; j < 64; j++) {
				var index = 4*(i+j*64);
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
