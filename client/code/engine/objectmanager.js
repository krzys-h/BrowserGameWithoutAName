function ObjectManager(game, conn) {
	this.game = game;
	this.objects = {};
	conn.addHandler("server", "objects update", this, ObjectManager.prototype.net_update);
}

ObjectManager.prototype.net_update = function(data) {
	if(typeof this.game.player == "undefined") return; //TODO: don't send
	for(var i=0; i<data.length; i++) {
		var o = data[i];
		if(typeof this.objects[o.owner] == "undefined") {
			this.objects[o.owner] = new Player(this.game.scene, this.game.terrain, o.owner);
		}
		this.objects[o.owner].object.position.set(o.position.x, o.position.y, o.position.z);
		this.objects[o.owner].object.rotation.set(o.rotation.x, o.rotation.y, o.rotation.z);
		this.objects[o.owner].object.setLinearVelocity(new THREE.Vector3(o.velocity.x, o.velocity.y, o.velocity.z));
		this.objects[o.owner].object.setAngularVelocity(new THREE.Vector3(0, 0, 0));
		this.objects[o.owner].object.__dirtyPosition = true;
		this.objects[o.owner].object.__dirtyRotation = true;
	}
}

ObjectManager.prototype.registerObject = function(name, object) {
	this.objects[name] = object;
}

if(typeof module !== 'undefined') module.exports = ObjectManager;
