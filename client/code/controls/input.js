function Input() {
	this.movement = new THREE.Vector2(0, 0);
	this.jump = false;
	this.mouse = new Mouse(Input.prototype.mouseMove.bind(this));
	this.mouseMove = new THREE.Vector2(0, 0);
}

Input.prototype.mouseMove = function(dx, dy) {
	this.mouseMove.x += dx;
	this.mouseMove.y += dy;
}

Input.prototype.getMouseDelta = function() {
	var r = this.mouseMove.clone();
	this.mouseMove.set(0, 0);
	return r;
}

Input.prototype.update = function() {
	this.movement.set(0, 0);
	
	if(isKeyPressed("W"))
		this.movement.x -= 1;
	if(isKeyPressed("S"))
		this.movement.x += 1;
	if(isKeyPressed("A"))
		this.movement.y += 1;
	if(isKeyPressed("D"))
		this.movement.y -= 1;
	
	this.jump = isKeyDown(" ");
}

Input.prototype.enableMouse = function(enable) {
	this.mouse.toggleCapture(enable);
}

Input.prototype.getInputState = function() {
	return {movement: this.movement, jump: this.jump};
}
