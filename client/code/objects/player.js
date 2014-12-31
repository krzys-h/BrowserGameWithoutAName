function Player(scene, name, nametag)
{
	if(typeof nametag == "undefined") nametag = true;
	this.grounded = false;
	this.name = name;
	this.scene = scene;

	var materialArray = [];
	materialArray.push(new THREE.MeshBasicMaterial({color: 0xff3333}));
	materialArray.push(new THREE.MeshBasicMaterial({color: 0xff8800}));
	materialArray.push(new THREE.MeshBasicMaterial({color: 0xffff33}));
	materialArray.push(new THREE.MeshBasicMaterial({color: 0x33ff33}));
	materialArray.push(new THREE.MeshBasicMaterial({color: 0x3333ff}));
	materialArray.push(new THREE.MeshBasicMaterial({color: 0x8833ff}));
	this.material = new THREE.MeshFaceMaterial(materialArray);
	
	this.geometry = new THREE.CubeGeometry(1, 1, 1, 1, 1, 1);
	
	this.object = new Physijs.CapsuleMesh(this.geometry, this.material);
	this.object.position.set(0, TerrainConstants.MAXHEIGHT+5, 0); //TODO: Detect terrain height
	
	this.object.setCcdMotionThreshold(1);
	this.object.setCcdSweptSphereRadius(0.2);
	
	if(nametag) {
		var materialFront = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
		var materialSide = new THREE.MeshBasicMaterial( { color: 0x000088 } );
		var materialArray = [ materialFront, materialSide ];
		this.labelGeometry = new THREE.TextGeometry(this.name, 
		{
			size: 0.5, height: 0.2, curveSegments: 3,
			font: "helvetiker", weight: "bold", style: "normal",
			bevelThickness: 0.1, bevelSize: 0.1, bevelEnabled: true,
			material: 0, extrudeMaterial: 1
		})
	
		this.labelMaterial = new THREE.MeshFaceMaterial(materialArray);
		this.label = new THREE.Mesh(this.labelGeometry, this.labelMaterial);
	
		this.labelGeometry.computeBoundingBox();
		var textWidth = this.labelGeometry.boundingBox.max.x - this.labelGeometry.boundingBox.min.x;
	
		this.label.position.set(-0.5 * textWidth, 2.5, 0);
		this.object.add(this.label);
	}
	
	this.scene.add(this.object);
}

Player.prototype.update = function(dt) {
	/*var ray = new THREE.Raycaster(this.object.position, new THREE.Vector3(0, -1, 0));
	var collisions = ray.intersectObjects([this.terrain.object]);
	this.grounded = collisions.length > 0 && collisions[0].distance < 1;*/
	this.grounded = true; //TODO
	
	this.object.rotation.x = 0;
	this.object.rotation.z = 0;
	this.object.__dirtyRotation = true;
}

Player.prototype.unload = function() {
	if(typeof this.label != "undefined") {
		this.object.remove(this.label);
		this.labelGeometry.dispose();
		for(var i = 0; i < this.labelMaterial.materials.length; i++)
			this.labelMaterial.materials[i].dispose();
	}
	this.scene.remove(this.object);
	this.geometry.dispose();
	for(var i = 0; i < this.material.materials.length; i++)
		this.material.materials[i].dispose();
}

if(typeof module !== 'undefined') module.exports = Player;
