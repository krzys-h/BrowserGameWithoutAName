function Player(scene, terrain, name, nametag)
{
	if(typeof nametag == "undefined") nametag = true;
	this.terrain = terrain;
	this.grounded = false;
	this.name = name;

	var materialArray = [];
	materialArray.push(new THREE.MeshBasicMaterial({color: 0xff3333}));
	materialArray.push(new THREE.MeshBasicMaterial({color: 0xff8800}));
	materialArray.push(new THREE.MeshBasicMaterial({color: 0xffff33}));
	materialArray.push(new THREE.MeshBasicMaterial({color: 0x33ff33}));
	materialArray.push(new THREE.MeshBasicMaterial({color: 0x3333ff}));
	materialArray.push(new THREE.MeshBasicMaterial({color: 0x8833ff}));
	this.material = Physijs.createMaterial(
		new THREE.MeshFaceMaterial(materialArray),
		.4, // medium friction
		.4 // medium restitution
	);
	
	this.geometry = new THREE.CubeGeometry(1, 1, 1, 1, 1, 1);
	
	this.object = new Physijs.BoxMesh(this.geometry, this.material);
	this.object.position.set(0, 20, 0);
	
	this.object.setCcdMotionThreshold(1);
	this.object.setCcdSweptSphereRadius(0.2);
	
	if(nametag) {
		var materialFront = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
		var materialSide = new THREE.MeshBasicMaterial( { color: 0x000088 } );
		var materialArray = [ materialFront, materialSide ];
		var textGeom = new THREE.TextGeometry(this.name, 
		{
			size: 0.5, height: 0.2, curveSegments: 3,
			font: "helvetiker", weight: "bold", style: "normal",
			bevelThickness: 0.1, bevelSize: 0.1, bevelEnabled: true,
			material: 0, extrudeMaterial: 1
		});
		// font: helvetiker, gentilis, droid sans, droid serif, optimer
		// weight: normal, bold
	
		var textMaterial = new THREE.MeshFaceMaterial(materialArray);
		this.label = new THREE.Mesh(textGeom, textMaterial);
	
		textGeom.computeBoundingBox();
		var textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;
	
		this.label.position.set(-0.5 * textWidth, 2.5, 0);
		this.object.add(this.label);
	}
	
	scene.add(this.object);
}

Player.prototype.update = function(dt) {
	/*var ray = new THREE.Raycaster(this.object.position, new THREE.Vector3(0, -1, 0));
	var collisions = ray.intersectObjects([this.terrain.object]);
	this.grounded = collisions.length > 0 && collisions[0].distance < 1;*/
	this.grounded = true; //TODO
}

if(typeof module !== 'undefined') module.exports = Player;
