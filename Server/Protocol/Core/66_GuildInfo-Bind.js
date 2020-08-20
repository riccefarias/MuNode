
var Engine = {};


var ProtoCore = {
	Code: 0x66,
	Proccess: function(aIndex,data){
		console.log(data);
		switch(data[1]){
			case 0x00:{
				
				var me = Engine.ObjectManager.get(aIndex);
				
				var gId  = data[5];
				    gId |= (data[4] << 8);
				    gId |= (data[3] << 16);
				    gId |= (data[2] << 24);
					
					
				Engine['ObjectManager'].getGuild(gId,function(gInfo){
				
				
					console.log(gInfo);
					
					var guildResponse = new Buffer([0xC1,0x39,0x66,0x00,(gInfo.gId >> 24),(gInfo.gId >> 16),(gInfo.gId >> 8),(gInfo.gId),0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);
					
							
					var name = new Buffer(8);
						name.fill(0x00,0,8);
						name.write(gInfo.gName);
					
					
					var logo = new Buffer(32);
						logo.fill(0x05,0,32);
					
					guildResponse = Buffer.concat([guildResponse,name,logo]);
					
					
					Engine.ObjectManager.DataSend(aIndex,guildResponse);
				});
					
			}
			break;
		}
	}
}

exports.Init = function(E){ Engine = E; return ProtoCore; };