var renderer;
var menu, game;
var ui, input, conn;
var map, chat;

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var VIEW_ANGLE = 45;
var NEAR = 0.1;
var FAR = 10000;

window.onload = function() {
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);
	renderer.autoClear = false;
	document.body.appendChild(renderer.domElement);
	
	ui = new UI();
	input = new Input();
	menu = new SceneMenu();
	
	render();
	
	conn = new Connection(function() {
		status("Master server ready");
		document.getElementById("login_form").style.display="block";
		conn.master.on('server message', function(data) {
			chat.addMessage(data.text, "MASTER SERVER");
		});
		conn.master.on('chat', function(data) {
			chat.addMessage(data.message, data.from);
		});
	}, function(data) {
		if(typeof game == "undefined" || typeof game.player == "undefined") return; //TODO: don't send if not spawned
		game.objects.net_update(game, data);
	});
	chat = new Chat(conn);
	status("Connecting to master server...");
}

window.onresize = function() {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	
	if(typeof menu != "undefined") {
		menu.onResize();
	}
	if(typeof game != "undefined") {
		game.onResize();
	}
	ui.onResize();
	
	renderer.setSize(WIDTH, HEIGHT);
}

var renderTimer = new FPS();
function render() {
	var dt = renderTimer.update();
	document.getElementById("fps_render").innerHTML = Math.round(renderTimer.getAvgFPS());
	renderer.clear();
	if(typeof menu != "undefined") {
		menu.render(renderer, dt);
	}
	if(typeof game != "undefined") {
		game.render(renderer, dt);
	}
	renderer.clearDepth();
	ui.render(renderer);

	input.update();
	if(isKeyDown("T")) {
		chat.focus();
	}
	resetKeysAfterUpdate();
	
	requestAnimationFrame(render);
}

var chunkQueue = [];
function update(dt) {
	document.getElementById("fps_physics").innerHTML = Math.round(game.timer.getAvgFPS());
	
	
	if(typeof game != "undefined" && typeof game.player != "undefined") {
		var inputData = input.getInputState();
		if(!game.player.grounded) inputData.jump = false; //TODO: serverside
		conn.server.emit('control', inputData);
		
		var cx = Math.floor((game.player.object.position.x+32)/64);
		var cy = Math.floor((-game.player.object.position.z+32)/64);
		terrainloader.load(cx, cy, 5);
		terrainloader.autoUnload();
		
		var s = "";
		if(terrainloader.queue.length > 0) s = "Loading chunks: ";
		for(var i = 0; i < terrainloader.queue.length; i++) {
			if(i != 0) s += ", ";
			s += "("+terrainloader.queue[i].x+"; "+terrainloader.queue[i].y+")";
		}
		document.getElementById("chunk_state").innerHTML = s;
		map.update();
		
		game.player.update();
	}
}

function login()
{
	status("Logging in...");
	document.getElementById("login_form").style.display="none";
	conn.login(document.getElementById("login").value, "", function(success, msg) {
		if(!success) return status(msg);
		status("Waiting on spawn terrain data...");
		delete menu;
		menu = undefined; //TODO: Why "delete" doesn't work?
		game = new SceneGame(update);
		terrainloader = new TerrainLoader(game.terrain, function(x, y) {
			conn.server.emit('request terrain', [{x: x, y: y}]);
		});
		conn.server.on('terrain', function(data) {
			game.terrain.loadChunk(data);
			terrainloader.onLoaded(data.x, data.y);
			if(data.x == 0 && data.y == 0) {
				status("Spawning...");
				conn.server.emit('spawn', {}, function() {
					status("Logged in as <b>"+conn.user+"</b>");
					game.spawnPlayer(conn.user);
					map = new Map(ui, game.player, game.terrain, terrainloader);
					game.startSimulation();
				});
			}
		});
		conn.server.on('server message', function(data) {
			chat.addMessage(data.text, "SERVER");
		});
		conn.server.on('terrain generation status', function(data) {
			if(typeof map !== "undefined") {
				map.generatorData(data);
			}
		});
		conn.server.on('server status', function(data) {
			var s = "<b>Server status</b><br />";
			s += data.hostname+"<br />";
			s += "Avg load: "+data.load[0].toFixed(2)+" "+data.load[1].toFixed(2)+" "+data.load[2].toFixed(2)+"<br />";
			s += "Mem usage: "+((data.totalmem-data.freemem)/1024/1024).toFixed(2)+" MB / "+(data.totalmem/1024/1024).toFixed(2)+" MB";
			document.getElementById("server_status").innerHTML = s;
		});
	});
}

function status(s) {
	if(typeof s !== "undefined") {
		console.log(s);
		document.getElementById("status").innerHTML = s;
		chat.addMessage(s, "GAME");
	} else {
		document.getElementById("status").innerHTML = "";
	}
}
