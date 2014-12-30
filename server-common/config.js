var defaults = {
	HTTP_PORT: 8080,
	MASTERSERVER_HOST: "localhost",
	MASTERSERVER_PORT: 8888,
	SERVER_ID: "1234",
	SERVER_HOST: "localhost",
	SERVER_PORT: 8090,
};

var fs = require('fs');
var Config = JSON.parse(fs.readFileSync('../config.json'));
for(var i in defaults) {
	if(typeof Config[i] == "undefined") {
		Config[i] = defaults[i];
	}
}
if(typeof Config["GENERATOR_SEED"] == "undefined") {
	Config["GENERATOR_SEED"] = "TODO: generate random seed";
}
for(var i in Config) {
	if(typeof defaults[i] == "undefined" && i != "GENERATOR_SEED") {
		delete Config[i];
	}
}
fs.writeFileSync('../config.json', JSON.stringify(Config, undefined, 4));

console.log("Using configuration: ", Config);
module.exports = Config;
