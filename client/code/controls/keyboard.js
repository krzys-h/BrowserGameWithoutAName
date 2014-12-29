var keys = [];
var keysDown = [];
var keysUp = [];

window.onkeydown = function(e)
{
	if(!keys[e.keyCode])
		keysDown[e.keyCode] = true;
	keys[e.keyCode] = true;
}

window.onkeyup = function(e)
{
	if(keys[e.keyCode])
		keysUp[e.keyCode] = true;
	keys[e.keyCode] = false;
}

window.onblur = function()
{
	for(var i=0; i<keys.length; i++) {
		if(keys[i]) {
			keys[i] = false;
			keysDown[i] = true;
		}
	}
}

function resetKeysAfterUpdate()
{
	keysDown = [];
	keysUp = [];
}

function isKeyPressed(k)
{
	if(typeof k == "string") {
		if(k.length > 1)
			console.error("isKeyPressed string >1")
		k = k.toUpperCase().charCodeAt(0);
	}
	if(typeof keys[k] == "undefined") return false;
	return keys[k];
}

function isKeyDown(k)
{
	if(typeof k == "string") {
		if(k.length > 1)
			console.error("isKeyDown string >1")
		k = k.toUpperCase().charCodeAt(0);
	}
	if(typeof keysDown[k] == "undefined") return false;
	return keysDown[k];
}

function isKeyUp(k)
{
	if(typeof k == "string") {
		if(k.length > 1)
			console.error("isKeyUp string >1")
		k = k.toUpperCase().charCodeAt(0);
	}
	if(typeof keysUp[k] == "undefined") return false;
	return keysUp[k];
}
