function ObjectManager(game, conn) {
	this.game = game;
	this.objects = {};
	conn.addHandler("server", "objects update", this, ObjectManager.prototype.net_update);
}

ObjectManager.prototype.net_update = function(data) {
	if(typeof this.game.player == "undefined") return; //TODO: don't send
	var updated = [];
	for(var i=0; i<data.length; i++) {
		var o = data[i];
		if(typeof this.objects[o.owner] == "undefined") {
			this.objects[o.owner] = new Player(this.game.scene, o.owner);
		}
		this.objects[o.owner].object.position.set(o.position.x, o.position.y, o.position.z);
		this.objects[o.owner].object.rotation.set(o.rotation.x, o.rotation.y, o.rotation.z);
		this.objects[o.owner].object.setLinearVelocity(new THREE.Vector3(o.velocity.x, o.velocity.y, o.velocity.z));
		this.objects[o.owner].object.setAngularVelocity(new THREE.Vector3(0, 0, 0));
		this.objects[o.owner].object.__dirtyPosition = true;
		this.objects[o.owner].object.__dirtyRotation = true;
		updated.push(o.owner);
	}
	for(var i in this.objects) {
		if(typeof this.objects[i].persistent != "undefined" && this.objects[i].persistent) continue;
		if(updated.indexOf(i) === -1) {
			this.objects[i].unload();
			delete this.objects[i];
		}
	}
}

ObjectManager.prototype.registerObject = function(name, object, persistent) {
	this.objects[name] = object;
	this.objects[name].persistent = persistent;
}

ObjectManager.prototype.unload = function() {
	conn.removeHandlers("server", "objects update");
	for(var i in this.objects) {
		if(typeof this.objects[i].persistent != "undefined" && this.objects[i].persistent) continue;
		this.objects[i].unload();
	}
	this.objects = {};
}

if(typeof module !== 'undefined') module.exports = ObjectManager;
