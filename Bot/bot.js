var net = require('net');

var fs = require('fs')
var MuPkt = require("./mupacket/").Methods;

var Decryption = require('./decryptor.js');
os = require('os');



var stepDirections = [-1, -1, 0, -1, 1, -1, 1, 0,
		1, 1, 0, 1, -1, 1, -1, 0 ];
		
		
function GetPathPacketDirPos(px, py)
{
	var pos = 0;

	if (px <= -1 && py <= -1)
	{
		pos=0;
	}
	else if (px <= -1 && py == 0)
	{
		pos=7;
	}
	else if ( px <= -1 && py >= 1)
	{
		pos=6;
	}
	else if ( px == 0 && py <= -1)
	{
		pos= 1;
	}
	else if ( px == 0 && py >= 1)
	{
		pos = 5;
	}
	else if ( px >= 1 && py <=-1)
	{
		pos=2;
	}
	else if ( px >= 1 && py == 0)
	{
		pos = 3;
	}
	else if ( px >=1  && py >= 1)
	{
		pos = 4;
	}

	return pos;
}


function reverseBack(_x,_y,d){
	var stepDirection = 0;
	var stepCount = d.t;
	var data = d.p;
	
	
	for (var i = 0; i < stepCount; i++) {
		if ((i % 2) == 0) {
			stepDirection = ((data[Math.floor(i / 2)] >> 4));
		} else {
			stepDirection = (data[Math.floor(i / 2)] & 0x0F);
		}
				
		console.log(stepDirection);
						
		_x += stepDirections[stepDirection * 2];
		_y += stepDirections[(stepDirection * 2) + 1];
						
						
		console.log("XY: "+_x+" "+_y);
	}
}		
		
function WalkFromTo(x,y,tx,ty){
	dirX = (x<tx)?1:-1;
	dirY = (y<ty)?1:-1;
	
	nX = x;
	nY = y;
	
	sX = x;
	sY = y;
	
	var path = new Buffer(15);
	var stopNext = -1;
	
	var i = 0;
	while(i<15){
		
		
		var pos = GetPathPacketDirPos( (tx-sX), (ty-sY)) * 2;
		
		if(nX!=tx){
			nX = nX + dirX;
		}
		if(nY!=ty){
			nY = nY + dirY;
		}
		
		sX = sX + stepDirections[pos];
		sY = sY + stepDirections[pos+1];
		//if(i!=-1){
			if((i%2)==0){
				path[Math.floor(i / 2)] = pos/2 << 4; 
			}else{
				path[Math.floor(i / 2)] |= pos/2 & 0x0F;
			}
		//}
		
		
		console.log(sX+" "+sY+" "+pos);
		if((sX==tx) && (sY==ty)){
			stopNext = 2;
		}
		
		if(stopNext>-1){
			stopNext--;
			if(stopNext==0){
				break;
			}
		}
		
		i++;
	}
	//if((nX==tx) && (nY==ty)){
		return {p:path,t: i};
	//}
	
}

//console.log(reverseBack(125,125,));




var s = 0;

_started = new Date().getTime();

DataSend = function(_buf,noDelay){
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
		},((noDelay==true)?1:700),_buf);
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


function reconnect(port,ip,cb){
	client = new net.Socket();
	//client.setNoDelay(true);
	//55444
	client.connect(port,ip, cb);


	client.on('data', function(_in) {
		
			
			if((_in[0]!=0xC1) && (_in[0]!=0xC2) && (_in[0]!=0xC3) && (_in[0]!=0xC4) ){
				console.log(_in);
				
				return false;
			}
			
			if(_in[0]==0xC3 || _in[0]==0xC4){
				var _data = MuPkt.client_decode(_in);
				var data = _data.buffer;
			}else{
				var data = _in;
			}
				
					
			var head = data[0];
			var size = (((head==0xc1)||(head==0xc3))? data.readInt8(1):(data[2] | (data[1] << 8)));
			var pos = (((head==0xc1)||(head==0xc3))? 2:3);
					
			console.log("Head: "+head+" | Size: "+size+" | Pos: "+pos);
					
					
			var incoming = new Buffer(size-pos);
			data.copy(incoming,0,pos,size);
			
			//var dec = Decryption.dec(incoming,pos);
			
			switch(incoming[0]){
				case 0xF1:{
					switch(incoming[1]){
						case 0x00:{
							console.log(incoming);
							
						var gId  = incoming[4];
							gId |= (incoming[3] << 8);
						
						
						var _version = Decryption.readS(incoming,5, 5);
						
						console.log("ID: "+gId+" "+_version);
							
							var _use = new Buffer(10);
								_use.fill(0x00,0,10);
								_use.write("ricce");
								
								
							var _pas = new Buffer(10);
								_pas.fill(0x00,0,10);
								_pas.write("aiwprton");
								
							_use = Decryption.Dec3bit(_use,0, 10);
							_pas = Decryption.Dec3bit(_pas,0, 10);
							
							
								
							var up = Math.round(os.uptime()*1000);
							
							console.log("UP: "+up);
							
							var login = Buffer.concat([new Buffer([0xC3,0x31,0xF1,0x01]),_use,_pas,new Buffer([(up),(up >> 8),(up >> 16),(up >> 24)]),new Buffer("09703DarksTeam97d99i+")]);
							
							console.log(login);
							
							DataSend(login);
						}
						break;
						case 0x01:{
							switch(incoming[2]){
								case 0x01:
										console.log("Login ok!");
										var requestChars = new Buffer([0xC1,0x04,0xF3,0x00]);
										DataSend(requestChars);
								break;
								default:
									console.log(incoming);
							}
						}
						break;
					}
				}
				break;
				case 0xF3:{
					switch(incoming[1]){
						case 0x00:{
							var tChars = incoming.readInt8(2);
							var i = 0;
							//console.log(tChars);
							//console.log(incoming.toString());
							while(i<tChars){
								
								var charName = Decryption.readS(incoming,(i*26)+4, 10);
								
								console.log(charName);
								
								i++;
							}
							
							
							var requestChars = Buffer.concat([new Buffer([0xC1,0x0E,0xF3,0x03]),new Buffer("Ricce")]);
								DataSend(requestChars);
								
								
							/*setInterval(function(){
								
								tm = new Date().getTime();
								
								var requestChars = Buffer.concat([new Buffer([0xC1,0x0C,0x0E,0x00,(tm >> 24),(tm >> 16),(tm >> 8),(tm)],0x00)]);
									DataSend(requestChars);
								
							},1000);*/
						}
						break;
						default:
							console.log("UNK F3: "+incoming[1]);
							console.log(incoming);
					}	
				}
				break;
						case 0x27:{
								DataSend(new Buffer([0xC3,0x08,0x03,0x00,0xDA,0x97,0x74,0x3f]));
								
								setInterval(function(){
									
									var up = Math.round(os.uptime()*1000);
							
									console.log("UP: "+up);
									
									
									DataSend(new Buffer([0xC3,12,0x0E,0x00,(up),(up >> 8),(up >> 16),(up >> 24),0x00,0x00,0x01,0x00]));
									
								},15000);
						}
						break;
				case 0x0D:{
					
						var _msg = Decryption.readS(incoming,10, incoming.length-11);
						console.log(_msg);
				}
				break;
				case 0x02:{
					
						var _name = Decryption.readS(incoming,1, 10);
						var _msg = Decryption.readS(incoming,11, incoming.length-11);
						
						console.log("Whisper: "+_name+":"+_msg);
						if(_name=="UnderScore"){
							var cmd = _msg.split(" ");
							if(cmd[0]=="move"){
								console.log("move cmd");
								Path = WalkFromTo(__x,__y,cmd[1],cmd[2]);
								
								var walkBuf = Buffer.concat([new Buffer([0xC1,(6+Math.ceil(Path.t/2)),0x10,__x,__y,(Path.t & 0x0F)]),Path.p]);
								//var walkBuf = new Buffer([0xC1,7,0x10,__x,__y,cmd[1],cmd[2]]);
								DataSend(walkBuf,true);
								
								__x = cmd[1];
								__y = cmd[2];
								
							}
						}
				}
				default:
					console.log(incoming);
				
			}
		
		//client.destroy(); // kill client after server's response
	});

	client.on('close', function() {
		console.log('Connection closed');
	});

}

var __x = 125;
var __y = 125;

var IsInCS = true;
reconnectCS(44405, '45.125.66.35',function() {
	//reconnectCS(44405, '127.0.0.1',function() {
		console.log('Connected');
		//client.write('Hello, server! Love, Client.');
});

//