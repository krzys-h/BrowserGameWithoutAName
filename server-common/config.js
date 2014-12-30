var defaults = {
	HTTP_PORT: 8080,
	MASTERSERVER_HOST: "localhost",
	MASTERSERVER_PORT: 8888,
	SERVER_HOST: "localhost",
	SERVER_PORT: 8090,
	GENERATOR_OCTAVES: 7,
};

var fs = require('fs');
var randomString = require('../client/code/common/randomstring.js');
var Config = {};
if(fs.existsSync('../config.json'))
	Config = JSON.parse(fs.readFileSync('../config.json'));
for(var i in defaults) {
	if(typeof Config[i] == "undefined") {
		Config[i] = defaults[i];
	}
}
if(typeof Config["GENERATOR_SEED"] == "undefined") {
	Config["GENERATOR_SEED"] = randomString(16);
}
if(typeof Config["SERVER_ID"] == "undefined") {
	Config["SERVER_ID"] = randomString(16);
}
for(var i in Config) {
	if(typeof defaults[i] == "undefined" && i != "GENERATOR_SEED" && i != "SERVER_ID") {
		delete Config[i];
	}
}
fs.writeFileSync('../config.json', JSON.stringify(Config, undefined, 4));

console.log("Using configuration: ", Config);
module.exports = Config;
