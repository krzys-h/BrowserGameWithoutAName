function Skybox(scene, image_path)
{
	this.scene = scene;
	
	this.geometry = new THREE.CubeGeometry(10000, 10000, 10000);
	
	var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
	var materialArray = [];
	for (var i = 0; i < 6; i++) {
		materialArray.push(new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture(image_path.replace("*", directions[i])),
			side: THREE.BackSide
		}));
	}
	this.material = new THREE.MeshFaceMaterial(materialArray);
	
	this.object = new THREE.Mesh(this.geometry, this.material);
	this.scene.add(this.object);
}

Skybox.prototype.unload = function() {
	this.scene.remove(this.object);
	for(var i = 0; i < this.material.materials.length; i++)
		this.material.materials[i].dispose();
	this.geometry.dispose();
}
