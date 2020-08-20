
				var fs = require('fs');

var Engine = {}
var Decryption = require('../decryptor.js');


var ProtoCore = {
	Code: 0x00,
	Proccess: function(aIndex,data){
		
				
				
				var me = Engine.ObjectManager.get(aIndex);
				var lpObj = Engine.ObjectManager.get(4001);
				
				
				
				var msg = new Buffer(data.length-12);
				data.copy(msg,0,11,data.length);
				
				
				//var msg = Decryption.readS(data,11, data.length-12);
				
				
				console.log("MSG: "+msg.toString());
				
				
				var cmd = (msg.toString()).split(" ");
				
				
				if(cmd[0]=="/move"){
					if(cmd.length<4){
						var msg ="Digite /move MapID X Y";
					}else{
				/*	
	pMsg.h.c = 0xC3;
	pMsg.h.size = sizeof(pMsg);
	pMsg.h.headcode = 0x1C;
	pMsg.MoveNumber = MoveNumber;
	pMsg.MapNumber = MapNumber;
	pMsg.MapX = MapX;
	pMsg.MapY = MapY;
	pMsg.Dir = Dir;
					*/
						Engine['ObjectManager'].DataSend(aIndex,new Buffer([0xC3,8,0x1C,parseInt(cmd[1]),parseInt(cmd[1]),parseInt(cmd[2]),parseInt(cmd[3]),0]));
					}
				}
				
				
				if(cmd[0]=="/trademe"){
					var name = new Buffer(10);
					name.fill(0x00,0,10);
					name.write(me.getName());
					
				
					var response = Buffer.concat([new Buffer([0xC3,(13),0x36]),name]);
					
					Engine['ObjectManager'].DataSend(aIndex,response);
				}
				
				if(cmd[0]=="/atk"){
					
					var bt = Engine.ObjectManager.get(cmd[1]);
					
					var response = new Buffer([0xC1,0x09,0x18,(((bt.getObjId() >> 8) & 0xFF)) ,
												((bt.getObjId()) & 0xFF ),cmd[2],120,
												(((me.getObjId() >> 8) & 0xFF)) ,((me.getObjId()) & 0xFF )]);
												
												
					Engine.ObjectManager.DataSendV2(bt,response);
				}
				
				
				if(cmd[0]=="/mv"){
					
					
					
						Engine.ObjectManager.get(cmd[1]).setXY(cmd[2],cmd[3]);
					
				}
				
				
				
				if(cmd[0]=="/attr"){
					
					
					
					var attr = me.getWorld().GetAttr(me.getX(),me.getY());
					
					var msg = "Attr: "+attr;
					
				}
				
				
				if(cmd[0]=="/ml"){
					
							Engine['ObjectManager'].DataSend(aIndex, new Buffer([0xC1,0x07,0xD7,(((cmd[1] >> 8) & 0xFF)) ,
													((cmd[1]) & 0xFF ),cmd[2],cmd[3]]));
				}
				
				if(cmd[0]=="/test"){
					
					var bot = new Engine.Player(0,2);
						bot.setName(cmd[1]);
					var bIndex = Engine.ObjectManager.addPlayer(bot);
	

						bot.setStatus(3);
						bot.setMap(0);


					var name = new Buffer(10);
						name.fill(0x00,0,10);
						name.write(me.getName());
						
					var msg ="BotID: "+bIndex;
						
					
					
					var response = Buffer.concat([new Buffer([0xC1,(msg.length+14),0x00]),name,new Buffer(msg),new Buffer([0x00])]);
						
				
					
					Engine.ObjectManager.DataSend(aIndex,response);

					
					return false;
				}

				
				var name = new Buffer(10);
					name.fill(0x00,0,10);
					name.write(me.getName());
					
				
				
				var response = Buffer.concat([new Buffer([0xC1,(msg.length+14),0x00]),name,new Buffer(msg),new Buffer([0x00])]);
					
			
				
				Engine.ObjectManager.DataSend(aIndex,response);
				Engine.ObjectManager.DataSendV2(me,response);

	}
}

exports.Init = function(E){ Engine = E; return ProtoCore};