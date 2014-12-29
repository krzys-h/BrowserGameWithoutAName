function FPS() {
	this.last = Date.now();
	this.frametime = [];
}

FPS.prototype.update = function() {
	var now = Date.now();
	var delta = now - this.last;
	this.last = now;
	delta /= 1000;
	if(delta > 0.05) {
		delta = 0.05;
	}
	
	this.frametime.push(delta);
	if(this.frametime.length > 10) {
		this.frametime.shift();
	}
	
	return delta;
}

FPS.prototype.getAvgFPS = function() {
	var avgTime = 0;
	for(var i=0; i<this.frametime.length; i++) avgTime += this.frametime[i];
	avgTime /= this.frametime.length;
	return 1/avgTime;
}

if(typeof module !== 'undefined') module.exports = FPS;
