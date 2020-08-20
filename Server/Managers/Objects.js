var net = require('net');


var Engine = {};

var MuPkt = require("../node_modules/mupacket/").Methods;


MIN_PLAYER_ID = 4000;
MAX_PLAYER_ID = 6000;
PLAYER_COUNT = 0;
MOB_COUNT = 0;

allMaps = {};

allAcounts = {};
allObjects = {}
allParty = {}
allItems = {}
allGuilds = {};


var ObjManagers = {
	addMap: function(mapId,mapName,tId){
		allMaps[mapId] = new Engine.World(mapId,mapName,tId);
	},
	getMap: function(mapId){
		return allMaps[mapId];
	},
	addGuild: function(g){
		allGuilds[g.gId] = g;
	},
	getGuild: function(gid,cb){
		if(allGuilds[gid]){
			cb(allGuilds[gid]);
		}else{
			Engine['DataServer'].LoadGuildInfo(gid,function(gInfo){
				if(gInfo!=false){
					Engine['ObjectManager'].addGuild(gInfo);
				}
				cb(gInfo);
			});
		}
	},
	DataSend: function(aIndex,_buf){
		var c3c4 = false;
		if(_buf[0]==0xC3 || _buf[0]==0xC4){
			c3c4 = true;
			if(_buf[0]==0xC3){
				_buf[0]=0xC1;
			}else{
				_buf[0]=0xC2
			}
		}
		
		LPOBJ = this.get(aIndex);
		
		if(c3c4==true){
			var s = LPOBJ.getSerialSend();
			//console.log("Encode TRUE! "+s);
			_buf = MuPkt.server_encode(_buf,s).buffer;
		}
		//console.log("OUT: ");
		//console.log(_buf);
		
		
		LPOBJ.send(_buf);
	},
	DataSendV2: function(lpObj,_buf){
		var tmpVp = lpObj.VpPlayer2;
		
		for(var vp in tmpVp){
			if(tmpVp[vp].type == 1){
				if(tmpVp[vp].state!=0){
					this.DataSend(tmpVp[vp].number,_buf);
				}
			}
		}
	},
	addAccount: function(Account,ObjectId){
		allAcounts[Account] = ObjectId;
	},
	addPlayer: function(Player){
		
		PLAYER_COUNT++;
		
		var Index = (MIN_PLAYER_ID+PLAYER_COUNT);
		
		Player.objId = Index;
		
		allObjects[Index] = Player;
		
		
		return Index;
	},
	addMob: function(Player){
		
		MOB_COUNT++;
		
		var Index = (MOB_COUNT);
		if(Index>4000){
			console.log(Engine.Colors.red("[MonsterAI] Excedeu 40000 NPCs"));
			return false;
		}else{
			Player.objId = Index;
		
			allObjects[Index] = Player;
		
			return Index;
		}
	},
	getByAccount: function(Account){
		return ((allAccounts[Account])?((allObjects[allAccounts[Account]])?allObjects[allAccounts[Account]]:false):false);
	},
	get: function(aIndex){
		return ((allObjects[aIndex])?allObjects[aIndex]:false);
	},
	getAllObjects: function(){
		return allObjects;
	}
	
}


exports.Init = function(E){ Engine = E; return ObjManagers;};