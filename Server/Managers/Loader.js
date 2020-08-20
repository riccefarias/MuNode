

var fs = require('fs');
			
var Engine = {};


var MonsterConf = {};
var MonsterSpots = {};
var SpotCount = 0;

var LoadManagers = {
	DS_MAP_RANGE: function(map){
		return ( ( ((map)) == 0x09  )?true:( ((map)) == 0x20  )?true:false );
	},
	CC_MAP_RANGE: function(mapnumber){
		return ( ((mapnumber) < 0x12)?false:((mapnumber) > 0x17 )?false:true );
	},
	BC_MAP_RANGE: function(mapnumber){
		//( (( (value)   )<MAP_INDEX_BLOODCASTLE1)?FALSE:(( (value)  )>MAP_INDEX_BLOODCASTLE7)?FALSE:TRUE  )
		return ( ((mapnumber) < 0xb)?false:((mapnumber) > 0x11 )?false:true );
	},
	BC_STATUE_RANGE: function(x){
		return ((x<0)?false:((x>2)?false:true));
	},
	GetWarehouseUsedHowMuch: function(UserLevel, IsLock){
		var rZen=0;
		rZen = (UserLevel * UserLevel)* 0.1 * 0.4;

		if (this.bCanWarehouseLock == true){
			if ( IsLock != 0){
				rZen = rZen + ( UserLevel * 2 );
			}
		}
		if ( rZen < 1 ){
			rZen=1;
		}

		if ( rZen >= 1000 ){
			rZen = (rZen/100)*100;
		}
		
		else if ( rZen >= 100 ){
			rZen = (rZen/10)*10;
		}
		
		if ( rZen == 0 ){
			rZen=1;
		}
		
		return rZen;
	},
	IsCanNotItemDtopInDevilSquare: function(ItemType){
		var checkitemtype = ItemType  /512;
		var checkitemindex = ItemType % 512;

		if ( checkitemtype >= 7 && checkitemtype <= 11 )
		{
			if (checkitemindex== 17 ||checkitemindex == 18||checkitemindex== 19 )
			{
				return false;
			}
		}
		else if ( checkitemtype == 0 )
		{
			if (checkitemindex == 17 || checkitemindex == 18)
			{
				return false;
			}
		}
		else if (checkitemtype == 12 )
		{
			if (checkitemindex== 12 || checkitemindex == 13 || checkitemindex == 14||
		checkitemindex == 16 || checkitemindex == 17 || checkitemindex == 18||
		checkitemindex == 19)
			{
				return false;
			}
		}
		else if ( ItemType == Engine['ItemManager'].ItemGetNumberMake(4,17)  || ItemType == Engine['ItemManager'].ItemGetNumberMake(5,9)  )
		{
			return false;
		}

		return false;

	},
	LoadMonsters: function(cb){
		fs.readFile("Data/Monster.txt", 'utf8', function(err, data) {
			  if (err) throw err;
			  
			  var lines = data.split("\r\n");
			  for(var l in lines){
				  if(lines[l].substring(0,2)!='//'){
					  var sp = lines[l].split("\t");
					  
					  
					  if(sp.length>24){
												//Index	Rate	Name			Level	HP	MP	DamMin	
												//DamMax	Defence	Magic	Attack	Success	MoveRg	
												//A.Type 	A.Range	V.Range	MoveSP	A.Speed	RegTime	
												//Attrib	ItemRat	M.Rate	MaxItem	Skill

						MonsterConf[sp[0]] = {Index: sp[0],Rate: sp[1],Name: sp[2],Level: sp[3],HP: sp[4],MP: sp[5],DamMin: sp[6],
												DamMax: sp[7],Defense: sp[8],Magic: sp[9],Attack: sp[10],Success: sp[11],MoveRg: sp[12],
												AType: sp[13],ARange: sp[14],VRange: sp[15],MoveSP: sp[16],ASpeed: sp[17],RegTime: sp[18],
												Attrib: sp[19],ItemRate: sp[20],MRate: sp[21],MaxItem: sp[22],Skill: sp[23]};
					  }
				  }
			  }
			  
			  
			  cb();
			 // console.log(MonsterConf);
		});
	},
	LoadMonstersSet: function(cb){
		fs.readFile("Data/MonsterSetBase.txt", 'utf8', function(err, data) {
			  if (err) throw err;
			  
			  var lines = data.split("\r\n");
			  var Index = 0;
			  for(var l in lines){
				 if(lines[l].substring(0,2)!='//'){
					
					//console.log(lines[l]);
					  
					var sp = lines[l].trim().split("\t");
					if(sp.length==1){
						if(sp[0]!='end'){
							Index = sp[0];
						}
					}
					
					//console.log(sp);
						
					if(sp.length>1){
							switch(parseInt(Index)){
								case 0:
									MonsterSpots[SpotCount] = {ArrangeType: parseInt(Index),m_Type: parseInt(sp[0]),m_MapNumber: parseInt(sp[1]),m_Dis: parseInt(sp[2]),m_Dir: parseInt(sp[5]),m_X: parseInt(sp[3]),m_Y: parseInt(sp[4]),m_W: 0,m_H: 0};
								break;
								case 1:
								case 3:
									var i = 0;
									while(i<parseInt(sp[8])){
										MonsterSpots[SpotCount] = {ArrangeType: parseInt(Index),m_Type: parseInt(sp[0]),m_MapNumber: parseInt(sp[1]),m_Dis: parseInt(sp[2]),m_Dir: parseInt(sp[7]),m_X: parseInt(sp[3]),m_Y: parseInt(sp[4]),m_W: parseInt(sp[5]),m_H: parseInt(sp[6])};
										i++;
										//console.log("["+MonsterSpots[SpotCount].m_Type+"]");
										SpotCount++;
									}
								break;
								case 2:
									var x = parseInt(sp[3]) -3 ;
									var y = parseInt(sp[4]) -3 ;
										x += Engine['MonsterAI'].Rand(0,7);
										y += Engine['MonsterAI'].Rand(0,7);
									MonsterSpots[SpotCount] = {ArrangeType: parseInt(Index),m_Type: parseInt(sp[0]),m_MapNumber: parseInt(sp[1]),m_Dis: parseInt(sp[2]),m_Dir: -1,m_X: x,m_Y: y,m_W: 0,m_H: 0};
								break;
								case 4:
									MonsterSpots[SpotCount] = {ArrangeType: parseInt(Index),m_Type: parseInt(sp[0]),m_MapNumber: parseInt(sp[1]),m_Dis: parseInt(sp[2]),m_Dir: -1,m_X: parseInt(sp[3]),m_Y: parseInt(sp[4]),m_W: 0,m_H: 0};
								break;
							}
							
										SpotCount++;
					}
						
				}  
					  
					 
				  
			  }
			  if(SpotCount>4000){
				  console.log(Engine.Colors.red("[MonsterSetBase] Excedeu 4000 Mobs"));
			  }
			  
			  cb(MonsterSpots,SpotCount);
		});
	},
	getMonsterBase: function(id){
			return ((MonsterSpots[id])?MonsterSpots[id]:false);
	},
	getMonsterAttr: function(id){
			return ((MonsterConf[id])?MonsterConf[id]:false);
	},
	LoadMap: function(mapId){
		data = fs.readFileSync("Data/Maps/Terrain"+mapId+".rc")// function(err, data) {
			
			//if (err) throw err;
			
			var f = new Buffer(data);
			var _terrain = {};
			
			var t = 0;
			var i = 0;
			var j = 0;
			 
			while ((i <= 255)) {
				while( (j <= 255)){
					
					if(_terrain[j]==undefined){
						_terrain[j] = {};
					}
					
					_terrain[(j)][(i)] = f[t];
					
					t++;
					j++;
				}

				j = 0;
				i++;
			}
			
			//fs.writeFileSync("teste"+mapId+".txt",JSON.stringify(_terrain));
			
			return _terrain;
		//});
	}
	
}


exports.Init = function(E){ Engine = E; return LoadManagers;};