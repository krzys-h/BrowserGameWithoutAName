function Skybox(scene, image_path)
{
	this.scene = scene;
	this.image_path = image_path;
	
	// Create geometry
	this.geometry = new THREE.CubeGeometry(5000, 5000, 5000);
	
	// Create material
	var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
	var materialArray = [];
	for (var i = 0; i < 6; i++) {
		materialArray.push( new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture(this.image_path.replace("*", directions[i])),
			side: THREE.BackSide
		}));
	}
	this.material = new THREE.MeshFaceMaterial(materialArray);
	
	// Create object
	this.object = new THREE.Mesh(this.geometry, this.material);
	scene.add(this.object);
}

if(typeof module !== 'undefined') module.exports = Skybox;
