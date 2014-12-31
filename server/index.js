var Config = global.Config = require('../server-common/config.js');

global.Image = function() {return {addEventListener: function() {}}};
var THREE = global.THREE = require('./lib/three.js');
var Ammo = global.Ammo = require('./lib/ammo.js');
var Physijs = global.Physijs = require('./lib/physi.js')(THREE, Ammo);

var FPS = require('../client/code/common/fps.js');
global.TerrainConstants = require('../client/code/engine/terrainconstants.js');
global.TerrainChunk = require('../client/code/graphics/terrainchunk.js');
var Terrain = require('../client/code/graphics/terrain.js');
var Player = require('../client/code/objects/player.js');
var TerrainLoader = require('../client/code/engine/terrainloader.js');

var os = require('os');
var fs = require('fs');

if(!fs.existsSync('./save')) fs.mkdirSync('./save');

var scene = new Physijs.Scene();
var terrain = new Terrain(scene, "resources/textures/terrain.png");
var TerrainGenerator = require('./TerrainGenerator.js');
var terraingen = new TerrainGenerator(Config.GENERATOR_SEED, function(chunk) {
	var status;
	if(typeof chunk.status == "undefined") {
		fs.writeFile("./save/terrain."+chunk.x+"."+chunk.y+".json", JSON.stringify(chunk.data), function(err) {
			if(err) {
				console.log("Failed to write terrain file "+chunk.x+","+chunk.y);
			} else {
				console.log("Saved terrain chunk "+chunk.x+","+chunk.y+" to disk");
			}
		});
		terrain.loadChunk(chunk);
		status = "FINISHED";
	} else {
		status = chunk.status.status;
		if(status == "generating initial table") {
			status += " ("+chunk.status.currentRow+"/"+(TerrainConstants.CHUNKSIZE+1)+")";
		}
		if(status == "generating octaves") {
			status += " ("+chunk.status.currentOctave+"/"+Config.GENERATOR_OCTAVES+")";
		}
	}
	console.log("["+chunk.x+","+chunk.y+"]: "+status);
});
var terrainloader = new TerrainLoader(terrain, function(x, y) {
	if(fs.existsSync("./save/terrain."+x+"."+y+".json")) {
		console.log("Loading chunk "+x+","+y+" from disk...");
		fs.readFile("./save/terrain."+x+"."+y+".json", function(err, jsonData) {
			console.log("Chunk "+x+","+y+" loaded from disk");
			var data = JSON.parse(jsonData);
			terrain.loadChunk({x: x, y: y, data: data});
		});
	} else {
		terraingen.generate(x, y);
	}
});
terrainloader.load(0, 0, 7);
var objects = {universe: [], planet: []};

var io = require('socket.io').listen(Config.SERVER_PORT);
console.log('Successfully started socket.io server at '+Config.SERVER_HOST+':'+Config.SERVER_PORT)

io.on('connection', function(socket) {
	console.log('connection');
	
	socket.on('serverping', function(data, reply) {
		reply();
	});
	
	var login, session;
	var player;
	var location = "planet";
	socket.on('login', function(data, reply) {
		if(data.server != Config.SERVER_ID) return reply({error: true, message: "Incorrect server ID"});
		console.log("Connection attempt from "+data.login);
		masterserver.emit('verifysession', {login: data.login, session: data.session}, function(data2) {
			if(data2.error) {
				reply({error: true, message: data2.message});
			} else {
				login = data.login;
				sessionid = data.session;
				socket.emit('server message', {text: login+" connected"});
				console.log(login+" is now connected");
				reply({error: false});
				
				player = new Player(scene, login, false) // create player object
				player.socket = socket;
				objects[location].push(player);
				socket.emit('spawn'); // and spawn
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
			var chunkdata = {x: chunk.x, y: chunk.y, data: []};
			for(var bx = 0; bx < 64; bx++) {
				chunkdata.data[bx] = [];
				for(var by = 0; by < 64; by++) {
					chunkdata.data[bx][by] = chunk.getAt(bx, by);
				}
			}
			socket.emit('terrain', chunkdata);
		}	
		if(terrain.chunkLoaded(x, y)) {
			send();
		} else {
			terraingen.generate(x, y, send);
		}
	}
	
	socket.on('control', function(data) {
		player.input = data;
		if(player.input.jump/* && player.object.grounded*/)
			player.object.applyCentralImpulse(new THREE.Vector3(0, 10, 0));
	});
	
	socket.on('move to', function(target) {
		var from = location;
		location = target;
		for(var i=0; i<objects[from].length; i++) {
			if(objects[from][i] == player) {
				objects[from].splice(i, 1);
				break;
			}
		}
		objects[location].push(player);
	});
	
	socket.on('disconnect', function() {
		console.log('disconnection');
		player.unload();
		if(typeof player !== "undefined") {
			for(var i=0; i<objects[location].length; i++) {
				if(objects[location][i] == player) {
					objects[location].splice(i, 1);
					break;
				}
			}
		}
	});
});
console.log('Server interface is now running at '+Config.SERVER_HOST+':'+Config.SERVER_PORT+'/');

var io_client = require('socket.io-client');
var masterserver = io_client('http://'+Config.MASTERSERVER_HOST+':'+Config.MASTERSERVER_PORT+'/masterserver');
masterserver.on('connect', function() {
	masterserver.emit('register', {serverid: Config.SERVER_ID, ip: Config.SERVER_HOST, port: Config.SERVER_PORT});
});

setInterval(function() {
	masterserver.emit('ping', {}, function() {
		//console.log('Ping response');
	});
}, 10000);

var timer = new FPS();
function physics() {
	var dt = timer.update();
	
	terrainloader.load(0, 0, 7);
	for(var i=0; i<objects["planet"].length; i++) {
		var player = objects["planet"][i];
		var input = player.input;
		if(typeof input == "undefined") continue;
		
		var moveDistance = 10 * dt;
		var rotateAngle = Math.PI*2 * 0.15 * dt;
		
		/*var rotObjectMatrix = new THREE.Matrix4();
		rotObjectMatrix.makeRotationAxis(new THREE.Vector3(0, 1, 0), input.movement.y*rotateAngle);
		player.object.matrix.multiply(rotObjectMatrix);
		player.object.rotation.setEulerFromRotationMatrix(player.object.matrix);*/
		if(input.movement.x != 0) {
			player.object.rotation.y = input.lookDirection;
		}
		
		player.object.translateZ(input.movement.x*moveDistance);
			
		player.object.setAngularVelocity(new THREE.Vector3(0, 0, 0));
		
		player.object.__dirtyPosition = true;
		player.object.__dirtyRotation = true;
		
		player.update();
		
		var c = terrain.posToChunk(player.object.position.x, player.object.position.z);
		terrainloader.load(c.x, c.y, 7);
	}
	terrainloader.autoUnload();
	scene.simulate();
	
	var objdata = [];
	for(var i=0; i<objects["planet"].length; i++) {
		var obj = {}
		obj.owner = objects["planet"][i].name;
		obj.position = objects["planet"][i].object.position;
		obj.rotation = objects["planet"][i].object.rotation;
		obj.velocity = objects["planet"][i].object.getLinearVelocity();
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
	io.sockets.emit('server status', server_status); //TODO: only to admins
	
	terraingen.run();
}
setInterval(physics, (1/60)*1000);
