function Input() {
	this.movement = new THREE.Vector2(0, 0);
	this.jump = false;
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

Input.prototype.getInputState = function() {
	return {movement: this.movement, jump: this.jump};
}
