function UI() {
	this.scene = new THREE.Scene();
	this.camera = new THREE.OrthographicCamera(-WIDTH/2, WIDTH/2, HEIGHT/2, -HEIGHT/ 2, 1, 10);
	this.camera.position.z = 10;
	this.scene.add(this.camera);
	
	/*this.materialTest = new THREE.SpriteMaterial({map: THREE.ImageUtils.loadTexture("resources/textures/checkerboard.png")});
	this.test = new THREE.Sprite(this.materialTest);
	this.test.position.set(-WIDTH/2+50, HEIGHT/2-50, 1);
	this.test.scale.set(100, 100, 1);
	this.scene.add(this.test);*/
}

UI.prototype.render = function(renderer) {
	renderer.render(this.scene, this.camera);
}

UI.prototype.onResize = function() {
	this.camera.left = -WIDTH/2;
	this.camera.right = WIDTH/2;
	this.camera.top = HEIGHT/2;
	this.camera.bottom = -HEIGHT/2;
	this.camera.updateProjectionMatrix();
}
