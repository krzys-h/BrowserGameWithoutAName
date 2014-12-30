Stats = function(conn)
{
	conn.addHandler('server', 'server status', this, function(data) {
		this.serverStatus = data;
		this.updateDisplay();
	});
}

Stats.prototype.updateDisplay = function() {
	var s = "";
	if(typeof this.status != "undefined")
		s += "<b><u>"+this.status+"</u></b><br /><br />";
	
	s += "<b>Client status</b><br />";
	if(typeof this.renderFPS != "undefined")
		s += "Render: "+Math.round(this.renderFPS)+" FPS<br />";
	if(typeof this.physicsFPS != "undefined")
		s += "Physics: "+Math.round(this.physicsFPS)+" FPS<br />";
	s += "<br />";
	
	if(typeof this.serverStatus != "undefined") {
		s += "<b>Server status</b><br />";
		s += this.serverStatus.hostname+"<br />";
		s += "Avg load: "+this.serverStatus.load[0].toFixed(2)+" "+this.serverStatus.load[1].toFixed(2)+" "+this.serverStatus.load[2].toFixed(2)+"<br />";
		s += "Mem usage: "+((this.serverStatus.totalmem-this.serverStatus.freemem)/1024/1024).toFixed(2)+" MB / "+(this.serverStatus.totalmem/1024/1024).toFixed(2)+" MB";
	}
	
	document.getElementById("status").innerHTML = s;
}

Stats.prototype.updateRenderFPS = function(fps) {
	this.renderFPS = fps;
	this.updateDisplay();
}

Stats.prototype.updatePhysicsFPS = function(fps) {
	this.physicsFPS = fps;
	this.updateDisplay();
}

Stats.prototype.updateStatus = function(status) {
	this.status = status;
	this.updateDisplay();
}
