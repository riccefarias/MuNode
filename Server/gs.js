var net = require('net');
var fs = require('fs')
var MuPkt = require("./mupacket.node");

var	Decryption = require('./Protocol/decryptor.js');

var Engine = {}
Engine['Colors'] = require('colors/safe');


console.log(Engine.Colors.red.bold("[GameServer] Inicializando"));

Engine['WS'] = require('./Protocol/WS.js').Init(Engine);
Engine['Protocol'] = require('./Protocol/gs102d.js').Init(Engine);
Engine['DataServer'] = require('./DataServer/MySql.js').Init(Engine);
Engine['MuRegion'] = require("./Objects/Regions.js").Init(Engine);
Engine['ObjectViewport'] = require("./Managers/Viewport.js").Init(Engine);
Engine['Wear'] = require("./Objects/Wear.js").Init(Engine);

Engine['Player'] = require("./Objects/Player.js").Init(Engine);
Engine['Monster'] = require("./Objects/Monster.js").Init(Engine);
Engine['Item'] = require("./Objects/Item.js").Init(Engine);

Engine['ObjectManager'] = require("./Managers/Objects.js").Init(Engine);

Engine['AttackManager'] = require("./Managers/AttackManager.js").Init(Engine);


Engine['ItemManager'] = require("./Managers/ItemManager.js").Init(Engine);

Engine['World'] = require("./Objects/World.js").Init(Engine);
Engine['Config'] = require("./Managers/Loader.js").Init(Engine);
Engine['MonsterAI'] = require("./Managers/MonsterAI.js").Init(Engine);
Engine['TMonsterSkillManager'] = require("./Managers/TMonsterSkillManager.js").Init(Engine);
Engine['BattleSoccer'] = require("./Managers/BattleSoccerManager.js").Init(Engine);



Engine['WS'].connect("ws://127.0.0.1:8003/",function(){

	Engine.ObjectManager.addMap(0,"Lorencia");
	Engine.ObjectManager.addMap(1,"Dungeon");	
	Engine.ObjectManager.addMap(2,"Davias");	
	Engine.ObjectManager.addMap(3,"Noria");	
	
	Engine.ObjectManager.addMap(4,"LostTower");	
	Engine.ObjectManager.addMap(5,"Davias");	
	Engine.ObjectManager.addMap(6,"Arena");
	Engine.ObjectManager.addMap(7,"Atlans");	
	Engine.ObjectManager.addMap(8,"Tarkan");	
	Engine.ObjectManager.addMap(9,"DevilSquare");	
	Engine.ObjectManager.addMap(10,"Icarus");	
	Engine.ObjectManager.addMap(11,"Blood Castle I");	
	Engine.ObjectManager.addMap(12,"Blood Castle II");	
	Engine.ObjectManager.addMap(13,"Blood Castle III");	
	Engine.ObjectManager.addMap(14,"Blood Castle IV");	
	Engine.ObjectManager.addMap(15,"Blood Castle V");	
	Engine.ObjectManager.addMap(16,"Blood Castle VI");
	
	
	Engine.ObjectManager.addMap(17,"--");	
	
	Engine.ObjectManager.addMap(18,"Chaos Castle I");	
	Engine.ObjectManager.addMap(19,"Chaos Castle II",17);	
	Engine.ObjectManager.addMap(20,"Chaos Castle III",17);	
	Engine.ObjectManager.addMap(21,"Chaos Castle IV",17);	
	Engine.ObjectManager.addMap(22,"Chaos Castle V",17);	
	Engine.ObjectManager.addMap(23,"Chaos Castle VI",17);	


	Engine.ObjectManager.addMap(24,"Kalima I");
	Engine.ObjectManager.addMap(25,"Kalima II",24);
	Engine.ObjectManager.addMap(26,"Kalima II",24);
	Engine.ObjectManager.addMap(27,"Kalima IV",24);
	Engine.ObjectManager.addMap(28,"Kalima V",24);
	Engine.ObjectManager.addMap(29,"Kalima VI",24);	
	
	Engine.ObjectManager.addMap(30,"Valey of Loren");
	
	Engine.ObjectManager.addMap(38,"Davias");	
	
	
	Engine.ObjectManager.addMap(36,"Davias");	
	
	Engine.ObjectManager.addMap(39,"Davias");	
	Engine.ObjectManager.addMap(40,"Davias");	


	Engine.ObjectManager.addMap(33,"Aida",40);	
	Engine.ObjectManager.addMap(37,"Aida",40);		
	
	Engine['Config'].LoadMonsters(function(){
	
		Engine['Config'].LoadMonstersSet(function(mList,mCount){
			for(var m in mList){
				//console.log("Add Map: "+mList[m].m_MapNumber);
				Engine['MonsterAI'].AddMonster(m,mList[m].m_MapNumber,mList[m].m_Type,mList[m].m_X,mList[m].m_Y,mList[m].m_Dir);
			}
			
		});
	});

	
	//Engine['MonsterAI'].AddMonster(0,1,false,false);
	

	//console.log(ObjectManager.getMap(0).getViews(125,125));


	net.createServer(function(sock) {
		sock.setNoDelay(true);
		//sock.setEncoding('hex');
		  //  console.log('[GameServer] Conexão de ' + sock.remoteAddress +':'+ sock.remotePort);
			
			var aPlayer = new Engine.Player(sock);
			var aIndex = Engine.ObjectManager.addPlayer(aPlayer);
			
		
			console.log(Engine.Colors.yellow("[GameServer] Novo Player (#"+aIndex+")"));
		 
			
			sock.write(Engine.Protocol.handshake(aIndex));
			
			
			sock.on('error',function(err){
				console.log(err);
			});
			
			sock.on('data', function(_in) {
				console.log(_in);
				if(_in[0]==0xC3 || _in[0]==0xC4){
					var _data = MuPkt.server_decode(_in);
					
					var data = _data.buffer;
					Engine.ObjectManager.get(aIndex).setSerial(_data.serial);
					
					console.log("Serial: "+_data.serial);
				}else{
					var data = _in;
				}
				
				console.log(data);
			
				
				var head = data[0];
				var size = (((head==0xc1)||(head==0xc3))? data.readInt8(1):data.readInt16(1));
				var pos = (((head==0xc1)||(head==0xc3))? 2:3);
				
				console.log("Head: "+head+" | Size: "+size+" | Pos: "+pos);
				
				
				
				var incoming = new Buffer(size-pos);
				data.copy(incoming,0,pos,size);

				var dec = Decryption.dec(incoming,pos);
				Engine.Protocol.Core(aIndex,dec);
			});
			
			sock.on('end', function() {
				
			});
			
	}).listen(44405,function(){
		
		setInterval(function(Engine){
			var allObject = Engine['ObjectManager'].getAllObjects();
			for(var o in allObject){
				
				Engine.ObjectViewport.createVp(allObject[o]);
				Engine.ObjectViewport.VpProtocol(allObject[o]);
			}
		},1000,Engine);
		
		
		setInterval(function(Engine){
			Engine['MonsterAI'].MonsterMove();
		},500,Engine);
		
		Engine['WS'].send({cmd: 'SRV',room: {id: 0, name: 'Sala-1'}});
	});
});
