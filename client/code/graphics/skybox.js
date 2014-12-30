function Skybox(scene, image_path)
{
	this.image_path = image_path;
	
	this.geometry = new THREE.CubeGeometry(10000, 10000, 10000);
	
	var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
	var materialArray = [];
	for (var i = 0; i < 6; i++) {
		materialArray.push(new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture(this.image_path.replace("*", directions[i])),
			side: THREE.BackSide
		}));
	}
	this.material = new THREE.MeshFaceMaterial(materialArray);
	
	this.object = new THREE.Mesh(this.geometry, this.material);
	scene.add(this.object);
}

if(typeof module !== 'undefined') module.exports = Skybox;
