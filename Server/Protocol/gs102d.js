
var Engine = {};

var Decryption = require('./decryptor.js');

var fs = require('fs');

var CoreCode = {};



var v99b = {
		handshake: function(id){
			var vv= Buffer.concat([new Buffer([0xC1,0x0C,0xF1,0x00,(0x01 & 0xFF),(id >> 8),(id)]),new Buffer("10213"),new Buffer([0x00])]);
			//var vv= Buffer.concat([new Buffer([0xC1,0x0C,0xF1,0x00,(0x01 & 0xFF),(id >> 8),(id)]),new Buffer("09703")]);
			
			return vv;
		},
		getCore: function(id){
			return CoreCode[id];
		},
		Core: function(aIndex,data){
			
			
			
			if(CoreCode[data[0]]){
				CoreCode[data[0]](aIndex,data);
			}else{
				console.log("Invalid Packet "+data[0]);
			}
			
			/*switch(data[0]){
				case 0xF1:{
					
				}
			}*/
			
			
			
		},ItemMoveResultSend: function(aIndex, result, pos, ItemInfo){
		
			console.log("move: "+result+" "+pos);
			var r = Buffer.concat([new Buffer([0xC3,(12),0x24,0,pos]),ItemInfo]);
			
			console.log(r);

			Engine['ObjectManager'].DataSend(aIndex, r);
		},
		GCInventoryItemOneSend: function(aIndex, pos){
			if ( !Engine['ObjectManager'].get(aIndex).pInventory[pos].IsItem()){
				return;
			}

			//PMSG_INVENTORYITEMMODIFY pMsg;

			//PHeadSubSetB((LPBYTE)&pMsg, 0xF3, 0x14, sizeof(pMsg));
			//pMsg.Pos = pos;
			//ItemByteConvert(pMsg.ItemInfo, gObj[aIndex].pInventory[pos]);

			//DataSend(aIndex, (UCHAR *)&pMsg, pMsg.h.size);
		},
		GCDamageSend: function(aIndex, TargetIndex, AttackDamage, MSBFlag, MSBDamage, iShieldDamage){
			
			var response = new Buffer([0xC1,10,0xDC,(TargetIndex >> 8) & 0xFF,(TargetIndex) & 0xFF,(AttackDamage >> 8) & 0xFF,(AttackDamage) & 0xFF,MSBDamage,(iShieldDamage >> 8) & 0xFF,(iShieldDamage) & 0xFF]);
			
		

			if ( MSBFlag != false )
			{
				response[3] &= 0x7F;
				response[3] |= 0x80;
			}


			if ( Engine['ObjectManager'].get(TargetIndex).Type == 1 ){
				Engine['ObjectManager'].DataSend(TargetIndex, response);
			}

			//if ( cManager.WatchTargetIndex == TargetIndex || cManager.WatchTargetIndex == aIndex )
			//{
			//	cManager.DataSend((LPBYTE)&pResult, pResult.h.size);
			//}

			if (  Engine['ObjectManager'].get(aIndex).Type == 1){
				Engine['ObjectManager'].DataSend(aIndex, response);
			}

		}
}


exports.Init = function(E){
						Engine = E;
						fs.readdir("./Protocol/Core/",function(err,files){
							for(var I in files){
								console.log("LoadModule: "+files[I]);
							
								var temp = require("./Core/"+files[I]).Init(Engine);
								CoreCode[temp.Code] = temp.Proccess;
							}

						});
						return v99b ;
				};