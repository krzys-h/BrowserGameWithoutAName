if(!('pointerLockElement' in document)) {
	alert("Pointer lock not supported! Update your browser!");
}

Mouse = function(mouse_cb) {
	this.mouse_cb = mouse_cb;
	this.enabled = false;
	document.body.addEventListener("click", function() {
		if(this.enabled)
			document.body.requestPointerLock();
	}.bind(this), false);
	document.addEventListener("pointerlockchange", function(e) {
		if (document.pointerLockElement === document.body) {
			this.handler = Mouse.prototype.mousemove.bind(this);
			document.addEventListener("mousemove", this.handler, false);
		} else {
			if(typeof this.handler == "undefined") return;
			document.removeEventListener("mousemove", this.handler, false);
		}
	}.bind(this), false);
}

Mouse.prototype.toggleCapture = function(enable) {
	this.enabled = enable;
	if(!enable) {
		document.exitPointerLock();
	}
}

Mouse.prototype.mousemove = function(e)
{
	this.mouse_cb(e.movementX, e.movementY);
}
