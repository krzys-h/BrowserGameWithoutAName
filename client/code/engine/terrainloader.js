function TerrainLoader(terrain, load_func)
{
	this.terrain = terrain;
	this.load_func = load_func;
	this.queue = [];
	this.requested = [];
}

TerrainLoader.prototype.load = function(cx, cy, d)
{
	var radius = Math.ceil(d/2);
	for(var i = 0; i <= radius; i++) {
		this.loadRing(cx, cy, i);
	}
}

TerrainLoader.prototype.loadRing = function(cx, cy, radius)
{
	for(var x = cx-radius; x <= cx+radius; x++) {
		for(var y = cy-radius; y <= cy+radius; y++) {
			this.requested.push({x: x, y: y});
			if(this.terrain.chunkLoaded(x, y)) continue;
			if(this.isQueued(x, y)) continue;
			console.log("Requesting chunk "+x+","+y);
			this.load_func(x, y);
			this.queue.push({x: x, y: y});
		}
	}
}

TerrainLoader.prototype.autoUnload = function(x, y)
{
	for(var x in this.terrain.chunks) {
		for(var y in this.terrain.chunks[x]) {
			var unload = true;
			for(var i = 0; i < this.requested.length; i++) {
				if(this.requested[i].x == x && this.requested[i].y == y) {
					unload = false;
					break;
				}
			}
			if(unload) {
				this.terrain.unloadChunk(x, y);
			}
		}
	}
	this.requested = [];
}

TerrainLoader.prototype.onLoaded = function(x, y)
{
	for(var i = 0; i < this.queue.length; i++) {
		if(this.queue[i].x == x && this.queue[i].y == y) {
			this.queue.splice(i, 1);
			break;
		}
	}
}

TerrainLoader.prototype.isQueued = function(x, y)
{
	for(var i = 0; i < this.queue.length; i++) {
		if(this.queue[i].x == x && this.queue[i].y == y) {
			return true;
		}
	}
	return false;
}

if(typeof module !== 'undefined') module.exports = TerrainLoader;
