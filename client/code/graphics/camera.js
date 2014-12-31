// Based on https://github.com/mrdoob/three.js/blob/master/examples/js/controls/PointerLockControls.js

Camera = function(conn, player) {
	this.conn = conn;
	this.player = player;
	
	//this.player.object.visible = false;
	this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, WIDTH/HEIGHT, NEAR, FAR);

	this.yawObject = new THREE.Object3D();
	this.yawObject.position.y = 2.5;
	this.yawObject.add(this.camera);
	
	this.player.object.add(this.yawObject);
	
	this.conn.addHandler('server', 'reset camera', this, function() {
		this.yawObject.rotation.y = 0;
	});
	
	this.lastPlayerRotation = this.player.object.rotation.y;
}

Camera.prototype.onResize = function() {
	this.camera.aspect = WIDTH/HEIGHT
	this.camera.updateProjectionMatrix();
}

Camera.prototype.mouseUpdate = function(delta) {
	this.yawObject.rotation.y -= delta.x * 0.002;
	this.camera.rotation.x -= delta.y * 0.002;
}

Camera.prototype.update = function() {
	this.yawObject.rotation.y -= this.player.object.rotation.y-this.lastPlayerRotation;
	this.lastPlayerRotation = this.player.object.rotation.y;
}

Camera.prototype.getDirection = function() {
	return this.player.object.rotation.y + this.yawObject.rotation.y;
}
