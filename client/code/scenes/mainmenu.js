function SceneMenu() {
	this.scene = new THREE.Scene();
	
	this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, WIDTH/HEIGHT, NEAR, FAR);
	this.camera.position.set(0, 0, 0);
	this.scene.add(this.camera);
	
	this.skybox = new Skybox(this.scene, "resources/textures/skybox/space-*.png");
}

SceneMenu.prototype.render = function(renderer, dt) {
	this.camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), -0.1*dt);
	this.camera.rotateOnAxis(new THREE.Vector3(0, 0, 1), 0.05*dt);
	
	renderer.render(this.scene, this.camera);
}

SceneMenu.prototype.onResize = function() {
	if(typeof this.camera != "undefined") {
		this.camera.aspect = WIDTH/HEIGHT
		this.camera.updateProjectionMatrix();
	}
}
