
var Engine = {};


var wss = require("nodejs-websocket");

CONNECTION = null;




WS = {connect: function(srv,cb){
		CONNECTION = wss.connect(srv,cb);
		CONNECTION.on("text", this.receive);
	},send: function(j){
	
		CONNECTION.sendText(JSON.stringify(j));
	},
	receive: function(s){
		var cmd = JSON.parse(s);
	}
}


exports.Init = function(E){
	Engine = E;
	return WS;
};