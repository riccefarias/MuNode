

var	Decryption = require('../decryptor.js');

var Engine = {};



var ProtoCore = {
	Code: 0xF3,
	Proccess: function(aIndex,data){
		//console.log(data);
		switch(data[1]){
			case 0x00:{
				// list 
				var me = Engine.ObjectManager.get(aIndex);
					me.setStatus(2); //seta tela de login
				
				
				Engine.DataServer.LoadCharacters(me.getAccount(),function(cList){
				
					var totalChars = cList.length;
					
					var response = new Buffer([0xC1,(7 + ((totalChars) * 34)),0xF3,0x00,0x04,0x00,totalChars]);
					
					//																	 MG
					//new Buffer().copy(response,0,0,6);
				
					var cPos = 0;
					for(var c in cList){
						//console.log(cList[c])
						
						var _cBuffer = new Buffer(4);
						
						var name = new Buffer(10);
							name.fill(0x00,0,10);
							name.write(cList[c].name,0);
						//(new Buffer("Ricce")).copy(name,0,0,5);
						
						_cBuffer = Buffer.concat([new Buffer([cPos]),name,_cBuffer]);
						
						_cBuffer[11] = 0x60;
						_cBuffer.writeInt16LE(cList[c].cLevel,12); // c level
						_cBuffer.writeInt8(cList[c].Ctl,14); //ctl
					//	_cBuffer[15] = 0x60; // class
						
						
						var _wear = new Engine.Wear(cList[c].Class,cList[c].inventory);
						
						//255 = Normal
						//128 = GuildMaster
						// 64 = Asisstente
						// 32 = Battle MAster
						// 16 = MuOnline
						//  8 = MuOnline
						//  4 = MuOnline
						// 	2 = MuOnline
						//  0 = Membro
						
						response = Buffer.concat([response,_cBuffer,_wear,new Buffer([255])]);
						
						
						cPos++;
					}
				
					console.log(response);
					Engine.ObjectManager.DataSend(aIndex,response);
					Engine['WS'].send({cmd: 'CHL',Id: aIndex,chars: cList});
				});
				
			}
			break;
			case 0x01:{
				// new
			}break;
			case 0x02:{
				// delete
			}
			break;
			case 0x03:{
				// join
				
				var me = Engine.ObjectManager.get(aIndex);
				var jName = Decryption.readS(data,2, 10);
				
				
				Engine.DataServer.LoadCharacter(me.getAccount(),jName,function(cData){
				
					me.setChar(cData);
					
					Engine['WS'].send({cmd: 'CHR',Id: aIndex,'char': cData});
					
					
					var X = cData.X;
					var Y = cData.Y;
					var Map = cData.Map;
					var Status= 0;
					
					//try{
					
					
					var response = new Buffer(54);
					
						response.writeUInt32LE(cData.Exp,0); //exp
						response.writeUInt32LE(120,4); //next exp
						
						response.writeUInt16LE(cData.UpPoints,8); // level up
						response.writeUInt16LE(cData.Str,10); // str
						response.writeUInt16LE(cData.Agi,12); // agi
						response.writeUInt16LE(cData.Vit,14); // vit
						
						response.writeUInt16LE(cData.Ene,16); // ene
						response.writeUInt16LE(cData.MaxHp,18); // hp
						response.writeUInt16LE(cData.MaxHp,20); // maxhp
						response.writeUInt16LE(cData.MaxMana,22); // mana
						
						
						response.writeUInt16LE(cData.MaxMana,24); // max mana
						response.writeUInt16LE(cData.MaxSp,26);  // sp
						response.writeUInt16LE(cData.MaxSp,28); // max sp
						response.writeUInt16LE(cData.MaxBp,30); // energia
						response.writeUInt16LE(cData.MaxBp,32); // max energia
						
						// faltam 4 bytes
						
						response.writeUInt8(0x81,34); // unknow
						response.writeUInt8(0x81,35); // unknow
						//
						
						
						response.writeUInt32LE(cData.Zen,36); // zen
						
						response.writeUInt8(cData.PkLevel,40); // pk
						response.writeUInt8(cData.Ctl,41); // ctl code
						response.writeUInt16LE(0,42); // spare
						response.writeUInt16LE(0,44); // spare
						
						
						response.writeUInt16LE(cData.Cmd,46); // cmd novo
						
						response.writeUInt16LE(0,48); // minus novo
						response.writeUInt16LE(16,50); // minus novo
						
						response.writeUInt8(0x00,52);
						response.writeUInt8(0x6A,53);
						
						response = Buffer.concat([new Buffer([0xC3,0x3E,0xF3,0x03,(X & 0xFF),(Y & 0xFF),(Map & 0xFF),(Status & 0xFF)]),response]);
						//console.log("[");
						//console.log(response);
						//console.log("]");
						
						
						Engine.ObjectManager.DataSend(aIndex,response);
						
						
						
						Engine.DataServer.LoadInventory(jName,function(iData){
							
							me.setItems(iData);
						
							var inventoryResponse = new Buffer([]);
							
							var iCount = 0;
						
							for(var i in iData){
								iCount++;
								var itm = new Engine.Item(iData[i].group,iData[i].index,iData[i].level,iData[i].dur,1,0,1,[1,1,1,1,1,1],123);
								
								inventoryResponse = Buffer.concat([inventoryResponse,new Buffer([i]),itm.getHex()]);
							}
							console.log(inventoryResponse);
							var size_s = 6 + (iCount * (8));
							
								
								//console.log(itm.getHex());
								
								//i++;
							//}
						
							
							
							inventoryResponse = Buffer.concat([new Buffer([0xC4,(size_s >> 8),(size_s),0xF3,0x10,(iCount & 0xFF)]),inventoryResponse]);
						
							Engine.ObjectManager.DataSend(aIndex,inventoryResponse);
							
						});
						
						
						//Engine.DataServer.LoadSkill(jName,function(iData){
							
							
							var skillList = new Buffer([]);
							
							skillList = Buffer.concat([skillList,new Buffer([0x00, 0x03, 0x01])]);
							skillList = Buffer.concat([skillList,new Buffer([0x01, 0x09, 0x01])]);
						
							var skillResponse = Buffer.concat([new Buffer([0xc1, 12, 0xf3, 0x11, // header
								0x02, 0x00, // count skills
								]),skillList]);
								
								
							Engine.ObjectManager.DataSend(aIndex,skillResponse);
						//});
														
						
														
														
						var configResponse = new Buffer([0xc1,0x13,0xf3, 0x30, // header
															0x00, 0x00,0x00,0x00,0x00,0x00,0x00, 0x00, 0x00, 0x00,
															0x09, 0x00, 0x04, // skill
															0x08, 0x04]);
						
						
						
						Engine.ObjectManager.DataSend(aIndex,configResponse);
						
						
						
						Engine.DataServer.LoadMyGuild(jName,function(gData){
							if(gData.GuildId){
								var guildResponse = new Buffer([0xC2,(17 >> 8),(17),0x65,0x01,(gData.GuildId >> 24),(gData.GuildId >> 16),(gData.GuildId >> 8),(gData.GuildId),0x00,0x00,0x00,(((aIndex >> 8) & 0xFF) & 0x7F ),(((aIndex) & 0xFF )),0x00,0x00,0x00]);
						
								if(gData.GuildStatus==5){
									guildResponse[12] |= 0x80;
									guildResponse[9] |= 0x80;
								}
								
								me.setGuild(gData.GuildId,gData.GuildStatus);
						
								Engine.ObjectManager.DataSend(aIndex,guildResponse);
							}
						});
						
						
						me.setStatus(3); //seta playing
						me.setMap(cData.Map,cData.X,cData.Y);
					//}catch(e){
						
					//	console.log(e);
					//}
				});
			}
			break;
			case 0x06:{
				// add point
			}
			break;
			case 0x30:{
				// save request
				console.log(data);
			}
			break;
			
		}
	}
}

exports.Init = function(E){ Engine = E; return ProtoCore; };