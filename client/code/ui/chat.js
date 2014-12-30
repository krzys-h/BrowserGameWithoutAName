Chat = function(conn, command_callback)
{
	this.conn = conn;
	this.command_callback = command_callback;
	
	this.element = document.createElement("div");
	this.element.id = "chat";
	this.element.style.position = "absolute";
	this.element.style.bottom = 0;
	this.element.style.right = 0;
	this.element.style.color = "#FFFFFF";
	this.element.style.background = "rgba(0, 0, 0, 0.5)";
	this.element.style.borderRadius = "10px";
	this.element.style.margin = "10px";
	this.element.style.padding = "10px";
	this.element.style.paddingBottom = "20px";
	this.element.style.width = "30%";
	this.element.style.height = "40%";
	this.element.style.display = "table-cell";
	this.element.style.verticalAlign = "bottom";
	this.element.style.cursor = "default";
	this.element.style.overflowY = "scroll";
	this.element.style.overflowX = "hidden";
	this.element.onselectstart = function() { return false; };
	this.element.innerHTML = "";
	
	this.input = document.createElement("input");
	this.input.id = "chat_input";
	this.input.type = "text";
	this.input.style.position = "absolute";
	this.input.style.bottom = 0;
	this.input.style.left = 0;
	this.input.style.width = "100%";
	//TODO: Why doesn't this.input.onkeypress work?
	window.onkeypress = function(e) {
		var focused = document.querySelector(":focus");
		if(e.keyCode == 13 && focused != null && focused.id == this.input.id) {
			if(focused.value == "") return;
			this.submitMessage(focused.value);
			focused.value = "";
		}
	}.bind(this);
	this.element.appendChild(this.input);
	
	this.addMessage("Welcome!");
	
	document.body.appendChild(this.element);
	
	this.conn.addHandler("master", "chat", this, Chat.prototype.messageReceived);
	this.conn.addHandler("master", "server message", Chat.prototype.serverMessageReceived.bind(this, "MASTER SERVER"));
	this.conn.addHandler("server", "server message", Chat.prototype.serverMessageReceived.bind(this, "SERVER"));
}

Chat.prototype.addMessage = function(message, source, color)
{
	var m = message;
	if(typeof source != "undefined") m = "<span style=\"font-style: italic;\">"+source+":</span> "+m;
	if(typeof color != "undefined") m = "<span style=\"color: "+color+"\">"+m+"</span>";
	this.element.innerHTML += m+"<br />";
	this.element.scrollTop = this.element.scrollHeight;
}

Chat.prototype.messageReceived = function(data)
{
	this.addMessage(data.message, data.from);
}

Chat.prototype.serverMessageReceived = function(type, data)
{
	this.addMessage(data.text, type);
}

Chat.prototype.submitMessage = function(message)
{
	if(message[0] == "/") {
		this.command_callback(message.slice(1));
	} else {
		this.conn.master.emit('chat', message);
	}
}

Chat.prototype.focus = function() {
	document.getElementById(this.input.id).focus();
}

Chat.prototype.update = function() {
	if(isKeyDown("T")) {
		chat.focus();
	}
}
