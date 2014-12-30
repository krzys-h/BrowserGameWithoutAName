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
	});
	chat = new Chat(conn, chat_command);
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
		game.update();
		game.render(renderer, dt);
	}
	renderer.clearDepth();
	ui.render(renderer);

	input.update();
	if(typeof chat != "undefined") {
		chat.update();
	}
	resetKeysAfterUpdate();
	
	requestAnimationFrame(render);
}

function update(dt) {
	document.getElementById("fps_physics").innerHTML = Math.round(game.timer.getAvgFPS());
}

function login()
{
	status("Logging in...");
	document.getElementById("login_form").style.display="none";
	conn.login(document.getElementById("login").value, "", function(success, msg) {
		if(!success) return status(msg);
		status("Spawning...");
		delete menu;
		menu = undefined; //TODO: Why "delete" doesn't work?
		game = new Game(ui, input, conn, update);
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

function chat_command(command) {
	if(command == "debugterrain") {
		if(typeof game != "undefined" && typeof game.gamescene != "undefined" && typeof game.gamescene.terrain != "undefined") {
			game.gamescene.terrain.toggleDebug(!game.terrain.debug);
		} else {
			chat.addMessage("Game not started", "COMMAND");
		}
		return;
	}
	chat.addMessage("Unknown command", "COMMAND");
}
