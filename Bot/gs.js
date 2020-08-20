var net = require('net');

var fs = require('fs')
var colors = require('colors')
var MuPkt = require("./mupacket/").Methods;

var Decryption = require('./decryptor.js');

var t = new Buffer(2);

t[0] = 12 << 4;

console.log(t) ;

			/*
process.on('uncaughtException', function (exception) {
	console.log(exception); // to see your exception details in the console
  // if you are on production, maybe you can send the exception details to your
  // email as well ?
});
*/
var s = 0;

_started = new Date().getTime();

DataSend = function(_buf){
		var c3c4 = false;
		if(_buf[0]==0xC3 || _buf[0]==0xC4){
			c3c4 = true;
			if(_buf[0]==0xC3){
				_buf[0]=0xC1;
			}else{
				_buf[0]=0xC2
			}
		}
		
		
		var head = _buf[0];
		var size = (((head==0xc1)||(head==0xc3))? _buf.readInt8(1):(_buf[2] | (_buf[1] << 8)));
		var pos = (((head==0xc1)||(head==0xc3))? 2:3);
		
		var head2= new Buffer(pos);
		var incoming = new Buffer(size-pos);
		_buf.copy(head2,0,0,pos);
		_buf.copy(incoming,0,pos,size);
		

		var dec = Decryption.enc(incoming,pos);
	
		
		_buf = Buffer.concat([head2,dec]);
		
		if(c3c4==true){
			//console.log("Encode TRUE! "+s);
			_buf = MuPkt.client_encode(_buf,s).buffer;
			
			s++;
		}
		//console.log("OUT: ");
		
		
		setTimeout(function(_buf){
			console.log(_buf);
			client.write(_buf);
		},1000,_buf);
}
var client; 
var client2; 


function reconnectCS(port,ip,cb){
	client2 = new net.Socket();
	//client.setNoDelay(true);
	//55444
	client2.connect(port,ip, cb);


	client2.on('data', function(_in) {
	console.log(_in);
			
			var head = _in[0];
			
			//console.log(head);
			var size = (((head==0xc1)||(head==0xc3))? _in.readInt8(1):(_in[2] | (_in[1] << 8)));
			var pos = (((head==0xc1)||(head==0xc3))? 2:3);
			
			console.log("Head: "+head+" | Size: "+size+" | Pos: "+pos);
			
			
			var incoming = new Buffer(size-pos);
			_in.copy(incoming,0,pos,size);
			
			console.log(incoming);
			switch(incoming[0]){
				case 0x00:{
					
					var requestServers = Buffer.concat([new Buffer([0xC1,0x04,0xF4,0x02])]);
						client2.write(requestServers);
				}
				break;
				case 0xF4:{
					switch(incoming[1]){
						case 0x02:{
							var totalServers = incoming[2];
							var i = 0;
							var srvList = [];
							while(i<totalServers){
								var srvId = (incoming[4 + (i*4)] | (incoming[3 + (i*4)] << 8));
								srvList.push({id: srvId});
								i++;
							}
							console.log(srvList);
							
							
							var requestServers = Buffer.concat([new Buffer([0xC1,0x04,0xF4,0x03,0x00,0x00])]);
								client2.write(requestServers);
						}
						break;
						case 0x03:{
							
							var ip = Decryption.readS(incoming,2, 15);
							var port = (incoming[18] | (incoming[19] << 8));
							console.log("Conecting to "+ip+":"+port);
							
							
							setTimeout(function(port,ip){
								reconnect(port, ip, function() {
									console.log('Connected to GS'+ip+":"+port);
									IsInCS = false;
									//client.write('Hello, server! Love, Client.');
								});
							},1000,port,ip);
						}
					}
				}
			}
	});
}


function reconnect(port,ip,sck,cb){
	var _sock = sck;
	client = new net.Socket();
	//client.setNoDelay(true);
	//55444
	client.connect(port,ip, cb);


	client.on('data', function(_in) {
			_sock.write(_in);
		
			var headO = _in[0];
			var srvSerial = 0;
			
			if((_in[0]!=0xC1) && (_in[0]!=0xC2) && (_in[0]!=0xC3) && (_in[0]!=0xC4) ){
				console.log(_in);
				
				return false;
			}
			
			if(_in[0]==0xC3 || _in[0]==0xC4){
				var _data = MuPkt.client_decode(_in);
				var data = _data.buffer;
				srvSerial = _data.serial;
			}else{
				var data = _in;
			}
				
					
			var head = data[0];
			var size = (((head==0xc1)||(head==0xc3))? data.readInt8(1):(data[2] | (data[1] << 8)));
			var pos = (((head==0xc1)||(head==0xc3))? 2:3);
					
			//console.log("Head: "+head+" | Size: "+size+" | Pos: "+pos);
					
					
			var incoming = new Buffer(size-pos);
			data.copy(incoming,0,pos,size);
			
			//var dec = Decryption.dec(incoming,pos);
			console.log("("+headO+", "+srvSerial+") SERVER -> CLIENT: [ ")
			console.log(incoming);
			console.log("]")
		
		//client.destroy(); // kill client after server's response
	});

	client.on('close', function() {
		console.log('Connection closed');
	});

}
/*
var IsInCS = true;
//reconnect(44405, '45.125.66.35',function() {
	reconnect(55901, '127.0.0.1',function() {
		console.log('Connected');
		//client.write('Hello, server! Love, Client.');
	});*/
	
	
net.createServer(function(sock) {
	sock.setNoDelay(true);
	  //  console.log('[GameServer] Conexão de ' + sock.remoteAddress +':'+ sock.remotePort);
		
		reconnect(55444, '45.125.66.35',sock,function() {
			console.log('Connected');
			//client.write('Hello, server! Love, Client.');
		});
	
		//console.log(Engine.Colors.yellow("[GameServer] Novo Player"));
	
		
		sock.on('error',function(err){
			console.log(err);
		});
		
		sock.on('data', function(_in) {
			client.write(_in);
			
			var headO = _in[0];
			var cliSerial = 0;
			
			if(_in[0]==0xC3 || _in[0]==0xC4){
				var _data = MuPkt.server_decode(_in);
				
				var data = _data.buffer;
				//Engine.ObjectManager.get(aIndex).setSerial(_data.serial);
				cliSerial = _data.serial;
				//console.log("Serial: "+_data.serial);
			}else{
				var data = _in;
			}
			
			//console.log(data);
		
			
			var head = data[0];
			var size = (((head==0xc1)||(head==0xc3))? data.readInt8(1):data.readInt16(1));
			var pos = (((head==0xc1)||(head==0xc3))? 2:3);
			
			//console.log("Head: "+head+" | Size: "+size+" | Pos: "+pos);
			
			
			
			var incoming = new Buffer(size-pos);
			data.copy(incoming,0,pos,size);

			var dec = Decryption.dec(incoming,pos);
			
			console.log("("+headO+", "+cliSerial+") CLIENT -> SERVER: [ ")
			console.log(dec);
			console.log("]");
			
		});
		
		sock.on('end', function() {
			
		});
		
}).listen(44406);

