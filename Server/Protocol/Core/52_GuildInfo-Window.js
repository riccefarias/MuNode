

var Engine = {};



var ProtoCore = {
	Code: 0x52,
	Proccess: function(aIndex,data){
		
				
				var me = Engine['ObjectManager'].get(aIndex);
				
				if(me.lpGuild==0){
					var size = 6;
					var guildResponse = new Buffer([0xC2,(size >> 8),(size),0x52,0x00,0x00]);
					
					
					Engine.ObjectManager.DataSend(aIndex,guildResponse);
				}else{
					
					Engine['ObjectManager'].getGuild(me.lpGuild,function(gInfo){
					
					



				
						
						var size = 24 + (gInfo.gMembers.length * 13);
						//gInfo.score
						var guildResponse = new Buffer([0xC2,(size >> 8),(size),0x52,0x01,gInfo.gMembers.length,0x10,0x20,(10),(10 >> 8),(10 >> 16),(10 >> 24),3]);
						
								
						
							
						var rname = new Buffer(8);
							rname.fill(0x00,0,8);
							rname.write("HOSTILIZ");
							
						
						
						var memberbuf = new Buffer([]);
						for(var m in gInfo.gMembers){
							
							var pname = new Buffer(10);
								pname.fill(0x00,0,10);
								pname.write(gInfo.gMembers[m].Name);
								
							switch(gInfo.gMembers[m].Status){
											case 5:{
												pTemp = 128; // guild status
											}
											break;
											case 4:{
												pTemp = 64; // guild status
											}
											break;
											case 3:{
												pTemp = 32; // guild status
											}
											break;
											case 1:{
												pTemp = 1; // guild status
											}
											break;
							}
							
							var srv = 1;
							
							memberbuf = Buffer.concat([memberbuf,pname,new Buffer([srv,srv & 0x7F | 0x80,pTemp])]);
						}
						
						guildResponse = Buffer.concat([guildResponse,rname,new Buffer([0x30,0x40,0x50]),memberbuf]);
						
						
						Engine.ObjectManager.DataSend(aIndex,guildResponse);

					});
				}
			
	}
}

exports.Init = function(E){ Engine = E; return ProtoCore; };