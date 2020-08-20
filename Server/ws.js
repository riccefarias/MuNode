var ws = require("nodejs-websocket")



var server = ws.createServer(function (conn) {
    	
	console.log(conn.path);
		
    conn.on("text", function (s) {
			var cmd = JSON.parse(s);
			console.log(cmd);
	});
	
	
	conn.on("close", function (code, reason) {
		//console.log("Connection closed")
	})
	
	
	conn.on("error", function (code, reason) {
		console.log("Connection closed")
	})
		
}).listen(8003);