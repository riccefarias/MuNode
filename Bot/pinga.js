var net = require('net');

var fs = require('fs')

os = require('os');



_started = new Date().getTime();

var client; 
var client2; 


function reconnectCS(port,ip,cb){
	client2 = new net.Socket();
	//client.setNoDelay(true);
	//55444
	client2.connect(port,ip, cb);


	client2.on('data', function(_in) {
			
			var head = _in[0];
			
			//console.log(head);
			var size = (((head==0xc1)||(head==0xc3))? _in.readInt8(1):(_in[2] | (_in[1] << 8)));
			var pos = (((head==0xc1)||(head==0xc3))? 2:3);
			
			
			
			var incoming = new Buffer(size-pos);
			_in.copy(incoming,0,pos,size);
			
			switch(incoming[0]){
				case 0xFF:
					var ping = new Date().getTime() - time;					
					console.log("Ping: "+ping);
					
				
					
				break;
				default:
					
				break;
			}
	});
}


var time = 0;

var IsInCS = true;
reconnectCS(10779, 'grtb.ddns.net',function() {
	//reconnectCS(44405, '127.0.0.1',function() {
		console.log('Connected');
		
		setInterval(function(){
			
			
		time = new Date().getTime();
		var requestServers = Buffer.concat([new Buffer([0xC1,0x03,0xFF])]);
			client2.write(requestServers);
		},1000);
});

//