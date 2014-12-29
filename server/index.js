var SERVER_PORT = 8890;
var SERVERID = "1234";
var MASTERSERVER = "localhost";
var SERVERHOST = "localhost";

global.Image = function() {return {addEventListener: function() {}}};
var THREE = global.THREE = require('./lib/three.js');
var Ammo = global.Ammo = require('./lib/ammo.js');
var Physijs = global.Physijs = require('./lib/physi.js')(THREE, Ammo);

var FPS = require('../client/code/common/fps.js');
global.TerrainChunk = require('../client/code/graphics/terrainchunk.js');
var Terrain = require('../client/code/graphics/terrain.js');
var Player = require('../client/code/objects/player.js');
var TerrainLoader = require('../client/code/engine/terrainloader.js');

var os = require('os');

var scene = new Physijs.Scene();
var terrain = new Terrain(scene, "resources/textures/terrain.png");
var TerrainGenerator = require('./TerrainGenerator.js');
var terraingen = new TerrainGenerator("to jest test", function(chunk) {
	var status;
	if(typeof chunk.status == "undefined") {
		terrain.loadChunk(chunk);
		status = "FINISHED";
	} else {
		status = chunk.status.status;
		if(status == "generating initial table") {
			status += " ("+chunk.status.currentRow+"/"+65+")";
		}
		if(status == "generating octaves") {
			status += " ("+chunk.status.currentOctave+"/"+6+")";
		}
	}
	console.log("["+chunk.x+","+chunk.y+"]: "+status);
});
var terrainloader = new TerrainLoader(terrain, function(x, y) {
	terraingen.generate(x, y);
});
terrainloader.load(0, 0, 10);

var io = require('socket.io').listen(SERVER_PORT);
console.log('Successfully started socket.io server at '+SERVERHOST+':'+SERVER_PORT)

var playerObjects = [];
io.on('connection', function(socket) {
	console.log('connection');
	
	socket.on('serverping', function(data, reply) {
		reply();
	});
	
	var login, session;
	socket.on('login', function(data, reply) {
		if(data.server != SERVERID) return reply({error: true, message: "Incorrect server ID"});
		console.log("Connection attempt from "+data.login);
		masterserver.emit('verifysession', {login: data.login, session: data.session}, function(data2) {
			if(data2.error) {
				reply({error: true, message: data2.message});
			} else {
				login = data.login;
				sessionid = data.session;
				console.log(login+" is now connected");
				reply({error: false});
				sendChunk(0, 0); //send spawn chunk
			}
		});
	});
	
	socket.on('request terrain', function(data, reply) {
		for(var i = 0; i < data.length; i++) {
			sendChunk(data[i].x, data[i].y);
		}
	});
	
	function sendChunk(x, y) {
		var send = function() {
			var chunk = terrain.chunks[x][y];
			var chunkdata = {x: chunk.x, y: chunk.y, data: chunk.data};
			socket.emit('terrain', chunkdata);
		}	
		if(terrain.chunkLoaded(x, y)) {
			send();
		} else {
			terraingen.generate(x, y, send);
		}
		
	}
	
	var player
	socket.on('spawn', function(data, reply) {
		if(typeof login == "undefined") return;
		console.log(login+" is spawning");
		player = {login: login, object: new Player(scene, terrain, login, false)}
		playerObjects.push(player);
		reply();
	});
	
	socket.on('control', function(data) {
		player.input = data;
		if(player.input.jump/* && player.object.grounded*/)
			player.object.object.applyCentralImpulse(new THREE.Vector3(0, 10, 0));
	});
	
	socket.on('disconnect', function() {
		console.log('disconnection');
		if(typeof player !== "undefined") {
			for(var i=0; i<playerObjects.length; i++) {
				if(playerObjects[i].object == player) {
					playerObjects.splice(i, 1);
					break;
				}
			}
		}
	});
});
console.log('Server interface is now running at '+SERVERHOST+':'+SERVER_PORT+'/');

var io_client = require('socket.io-client');
var masterserver = io_client('http://'+MASTERSERVER+':8888/masterserver');
masterserver.on('connect', function() {
	masterserver.emit('register', {serverid: SERVERID, ip: SERVERHOST, port: SERVER_PORT});
});

setInterval(function() {
	masterserver.emit('ping', {}, function() {
		//console.log('Ping response');
	});
}, 10000);

var timer = new FPS();
function physics() {
	var dt = timer.update();
	for(var i=0; i<playerObjects.length; i++) {
		var player = playerObjects[i].object;
		var input = playerObjects[i].input;
		if(typeof input == "undefined") continue;
		
		var moveDistance = 10 * dt;
		var rotateAngle = Math.PI*2 * 0.15 * dt;
		
		var rotObjectMatrix = new THREE.Matrix4();
		rotObjectMatrix.makeRotationAxis(new THREE.Vector3(0, 1, 0), input.movement.y*rotateAngle);
		player.object.matrix.multiply(rotObjectMatrix);
		player.object.rotation.setEulerFromRotationMatrix(player.object.matrix);
		
		player.object.translateZ(input.movement.x*moveDistance);
			
		player.object.setAngularVelocity(new THREE.Vector3(0, 0, 0));
		
		player.object.__dirtyPosition = true;
		player.object.__dirtyRotation = true;
		
		player.update();
		
		var cx = Math.floor((player.object.position.x+32)/64);
		var cy = Math.floor((-player.object.position.z+32)/64);
		terrainloader.load(cx, cy, 10);
	}
	scene.simulate();
	
	var objdata = [];
	for(var i=0; i<playerObjects.length; i++) {
		var obj = {}
		obj.owner = playerObjects[i].login;
		obj.position = playerObjects[i].object.object.position;
		obj.rotation = playerObjects[i].object.object.rotation;
		obj.velocity = playerObjects[i].object.object.getLinearVelocity();
		objdata.push(obj);
	}
	io.sockets.emit('objects update', objdata);
	
	var chunk_work_data = [];
	for(var i=0; i<terraingen.generateQueue.length; i++) {
		var job = terraingen.generateQueue[i];
		var c = {x: job.x, y: job.y, ready: false, working: (typeof job.status != "undefined")};
		if(c.working) {
			c.status = job.status.status;
		}
		chunk_work_data.push(c);
	}
	for(var x in terrain.chunks) {
		for(var y in terrain.chunks[x]) {
			var chunk = terrain.chunks[x][y];
			chunk_work_data.push({x: chunk.x, y: chunk.y, ready: true});
		}
	}
	io.sockets.emit('terrain generation status', chunk_work_data); //TODO: only to admins
	
	var server_status = {};
	server_status.hostname = os.hostname();
	server_status.load = os.loadavg();
	server_status.freemem = os.freemem();
	server_status.totalmem = os.totalmem();
	io.sockets.emit('server status', server_status);
	
	terraingen.run();
}
setInterval(physics, (1/60)*1000);
