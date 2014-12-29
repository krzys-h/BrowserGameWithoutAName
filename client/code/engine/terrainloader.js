function TerrainLoader(terrain, load_func)
{
	this.terrain = terrain;
	this.load_func = load_func;
	this.queue = [];
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
			if(this.terrain.chunkLoaded(x, y)) continue;
			if(this.isQueued(x, y)) continue;
			console.log("Requesting chunk "+x+","+y);
			this.load_func(x, y);
			this.queue.push({x: x, y: y});
		}
	}
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
