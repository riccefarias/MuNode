var net = require('net');

var Engine = {};

var stepDirections = [-1, -1, 0, -1, 1, -1, 1, 0,
		1, 1, 0, 1, -1, 1, -1, 0 ];


function ObjPlayer(Class,BaseId){ 

	var lpPos = Engine['Config'].getMonsterBase(BaseId);
	var mobConf = Engine['Config'].getMonsterAttr(Class);


	this.Type=2; // 1 = player , 2 = mob, 3 = npc	
	this.m_bIsMonsterAttackFirst = true;
	
	switch(lpPos.ArrangeType){
		case 0:{
			this.Type = 3;
			this.m_bIsMonsterAttackFirst = false;
		}
		break;
	}
	
	this.objId = 0;
	this._sock = 0;
	this._accountId = 0;
	this._accountName = '';
	this._characterName = '('+Class+')'+mobConf.Name+' '+BaseId;
	
	this.cLevel = 1;
	this.cExp = 0;
	this._accountStatus = 1; // 0 empty, 1 conectato, 2 logado, 3 jogando
	this._serial = 1;
	this._sendSerial = 0;
	
	//this.type = type;
	
	this.Live = 1;
	this.m_State = 1;
	this.m_Change = -1;
	this.Teleport = 0;
	
	this.lpGuild = 0;
	
	this._mapId = 0;
	
	this._x = 125;
	this._y = 125;
	
	this._Dir = 0;
	this._PkLevel = 0;
	
	this._oldX = 125;
	this._olxY = 125;	
	
	this.MTX = 0;
	this.MTY = 0;
	
	this.m_ActState = {Attack: 0,EmotionCount: 0,Escape: 0,Move: 0,Rest: 0,Emotion: 0};
	this.TargetNumber = -1;
	this.NextActionTime = 5000;
	this.DelayActionTime = 0;
	
	this.CurActionTime = new Date().getTime();
	
	this.VpPlayer = {};
	this.VpPlayer2 = {};
	
	this.sHD = {};
	
	this.VpCount = 0;
	
	this.RegenOk = 0;
	
	
	//console.log(mobConf);
	
	this.m_SkillHarden =0;
	this.m_iSkillStunTime = 0;
	
	this.m_iCurrentAI = 0;
	this.m_RecallMon = -1;
	
	this.Class = Class;
	this.m_ViewSkillState = 0;
	
	
	this.m_ViewRange = mobConf.VRange;
	
	this.m_AttackType = mobConf.AType;
	this.m_AttackRange = mobConf.ARange;
	this.m_AttackSpeed = mobConf.ASpeed;
	
	this.m_MoveSpeed = mobConf.MoveSP;
	this.m_MoveRange = mobConf.MoveRg;
	
	this.m_Attribute = mobConf.Attrib;
	
	this.m_PosNum = BaseId;
	
	this.m_bIsInMonsterHerd = false;
	
	this.PathStartEnd = 0;
	
	this.pInventory = {};
	
	
}


ObjPlayer.prototype.getItem = function(slot){
	return ((this.pInventory[slot]!=undefined)?this.pInventory[slot]:new Engine.Item(0,0,0,0,0,0,0,0,0));
}


ObjPlayer.prototype.getMap = function(){
	return this._mapId;
}

ObjPlayer.prototype.setMap = function(mapId,x,y){
	this._mapId = mapId;
	if(x!=undefined){
		this._x = x;
		this._olxX = x;
	}
	if(y!=undefined){
		this._y = y;
		this._olxY = y;
	}
	Engine.ObjectManager.getMap(mapId).addObject(this);
}

ObjPlayer.prototype.setSerial = function(s){
	this._serial = s;
}

ObjPlayer.prototype.getSerialSend = function(){
		return this._sendSerial++
	}

ObjPlayer.prototype.send = function(b,c){
	if(this._sock!=0){
		if(c==undefined){
			c = function(){
				
				//console.log("enviado..");
			}
		}
		
		this._sock.write(b,'utf8',c);
	}
}

ObjPlayer.prototype.setAccount = function(u,uid){
	console.log("AccId: "+this.objId);
	Engine.ObjectManager.addAccount(u,this.objId);
	this._accountName = u;
	this._accountId = uid;
}

ObjPlayer.prototype.setXY = function(X, Y,Dir){
			if(Dir==undefined){ Dir = 1;};
			this._oldX = this._x;
			this._oldY = this._y;
			
			this._x = X;
			this._y = Y;
			
			
			for(var v2 in this.VpPlayer2){
				if ( this.VpPlayer2[v2].type == 1 ){
					if (this.VpPlayer2[v2].state == 1 ){
						var Index = this.VpPlayer2[v2].number;
						var Obj = Engine['ObjectManager'].get(Index);

						if ( Obj.getStatus() > 2 && Obj.Live == 1){
							Engine['ObjectManager'].DataSend(Index, new Buffer([0xC1,0x08,0xD7,(((this.getObjId() >> 8) & 0xFF)) ,
													((this.getObjId()) & 0xFF ),X,Y,Dir << 4]));
						}else{
							this.VpPlayer2[v2].number = -1;
							this.VpPlayer2[v2].state = 0;
							this.VPCount2--;
						}
					}
				}
			}
			
			this.getWorld().updateObj(this);
}


ObjPlayer.prototype.SearchEnemy = function(objtype){
	var n;
	var tx;
	var ty;
	var dis;
	var mindis = this.m_ViewRange;
	var searchtarget = -1;
	var tObjNum;
	var count = 3;
	var t1 = objtype;
	var t2 = objtype;

	for (var v2 in this.VpPlayer2){
		tObjNum = this.VpPlayer2[v2].number;
		
		//console.log("Enemy V: "+this.VpPlayer2[v2].number);

		if ( tObjNum >= 0 ){
			
			gObj = Engine['ObjectManager'].get(tObjNum);
			
			if ( (gObj.Type == t1) && (gObj.Live != false) ){
				
				
				//console.log("Enemy V Type And Live: "+this.VpPlayer2[v2].number);
				
				if ( (gObj.Class >= 100 && gObj.Class < 110 ) || (gObj.Type == 2 && gObj.m_RecallMon >= 0) ){

				}else if ( /*(gObj.Authority &2) != 2 &&*/ gObj.Teleport == 0 ){ // Check if this is teleport #error
				
				
					
				
					tx = this.getX() - gObj.getX();
					ty = this.getY() - gObj.getY();
					dis = Math.sqrt(tx * tx + ty * ty);
					
					
					//console.log("Enemy Dis: "+dis);
					
					console.log("Enemy Pass: "+this.VpPlayer2[v2].number+" "+dis+"/"+mindis);
					
					this.VpPlayer2[v2].dis = dis;

					if ( dis < mindis ){
						
						console.log("Enemy ok?");
						
						
						searchtarget = tObjNum;
						mindis = dis;
					}
				}
			}
		}
	}

	return searchtarget;
}
ObjPlayer.prototype.MoveCheck = function(tx, ty){
	if ( this.m_ActState.Emotion  == 1 ){
		return true;
	}

	if ( this.getMap() == 39 && this.m_PosNum < 0){
		tx -= this.StartX;
		ty -= this.StartY;
		var dis = Math.sqrt(tx*tx + ty*ty);

		if ( dis > 30 ){
			//console.log("[ KANTURU ][ Debug - m_PosNum ] Fail %s(Index:%d) X%d-Y%d -> X%d-Y%d(%d)",
			//	lpObj->Name, lpObj->Class, lpObj->StartX, lpObj->StartY, tx, ty, dis);
			return false;
		}
	}else{
		//LPMONSTER_POSITION lpPos = &gMSetBase.m_Mp[lpObj->m_PosNum];
		var lpPos = Engine['Config'].getMonsterBase(this.m_PosNum);

		if ( lpPos.m_Dis < 1 )
		{
			return false;
		}

		tx -= lpPos.m_X;
		ty -= lpPos.m_Y;

		var dis = Math.sqrt(tx * tx + ty * ty);

		if ( dis > lpPos.m_Dis){
			return false;
		}	
	}

	return true;
}

ObjPlayer.prototype.gObjMonsterViewportIsCharacter = function(){
	var tObjNum;

	for (var v2 in this.VpPlayer2){
		if ( this.VpPlayer2[v2].state  != 0 ){
			tObjNum = this.VpPlayer2[v2].number;

			if ( tObjNum == this.TargetNumber ) 
			{
				return v2;
			}
		}
	}

	return -1;
}

ObjPlayer.prototype.GetTargetPos = function(){
	var tpx;	// Target Player X
	var tpy;
	var mtx;	// Monster Target X
	var mty;
	var searchp = 0;
	var sn = 0;
	var searchcount = ((stepDirections.length)/2)-1;
	var attr;
	var result;

	if ( this.m_MoveRange == 0 && this.m_SkillHarden != 0 && this.m_iSkillStunTime > 0 ){
		return false;
	}

	if ( this.TargetNumber>6000 ){
		return false;
	}

	lpTObj = Engine['ObjectManager'].get(this.TargetNumber);

	if ( lpTObj.Teleport != 0 ){
		return false;
	}

	var vpn = this.gObjMonsterViewportIsCharacter();

	if ( vpn < 0 ){
		return false;
	}
	
	tpx = lpTObj.getX();
	mtx = this.getX();
	tpy = lpTObj.getY();
	mty = this.getY();
	var dis;

	if ( this.m_AttackType >= 100 ){
		dis = this.m_AttackRange + 2;
	}else{
		dis = this.m_AttackRange;
	}

	if ( this.getX() < mtx ){
		tpx -= dis;
	}

	if ( this.getX() > mtx ){
		tpx += dis;
	}

	if ( this.getY() < mty ){
		tpy -= dis;
	}

	if ( this.getY() > mty ){
		tpy += dis;
	}

	searchp = Engine['MonsterAI'].GetPathPacketDirPos( (mtx - tpx), (mty - tpy) ) * 2;

	if (this.getWorld().GetStandAttr(tpx, tpy) == false ){
		while ( searchcount-- ){
			mtx = lpTObj.getX() + stepDirections[searchp];
			mty = lpTObj.getY() + stepDirections[1+searchp];
			attr = this.getWorld().GetAttr(mtx, mty);
			
			result = this.MoveCheck(mtx, mty);

			if ( this.Class == 249 )	{
				if ( (attr&2)!=2 && result == true ){
					this.MTX = mtx;
					this.MTY = mty;
					return false;
				}
			}else if ( (attr&1) != 1 && (attr&2) != 2 && (attr&4) != 4 && (attr&8) != 8 && result == false ){
				this.MTX = mtx;
				this.MTY = mty;
				return true;
			}

			searchp += 2;

			if ( searchp > (stepDirections.length)-1 )
			{
				searchp = 0;
			}
		}

		return false;
	}

	attr = this.getWorld().GetAttr(tpx, tpy);
	result = this.MoveCheck(mtx, mty);

	if ( this.Class == 249 ){
		if ( (attr&2)!=2 && result == true ){
			this.MTX = tpx;
			this.MTY = tpy;
			return true;
		}
	}else if ( (attr&1) != 1 && (attr&2) != 2 && (attr&4) != 4 && (attr&8) != 8 && result == true ){
		this.MTX = tpx;
		this.MTY = tpy;
		return true;
	}

	return false;
}


ObjPlayer.prototype.getWorld = function(){
	return Engine.ObjectManager.getMap(this._mapId);
}

ObjPlayer.prototype.getX = function(){
	return this._x;
}
ObjPlayer.prototype.getY = function(){
	return this._y;
}


ObjPlayer.prototype.getOldX = function(){
	return this._oldX;
}
ObjPlayer.prototype.getOldY = function(){
	return this._oldY;
}

ObjPlayer.prototype.setStatus = function(s){
	this._accountStatus = s;
}

ObjPlayer.prototype.getStatus = function(){
	return this._accountStatus;
}

ObjPlayer.prototype.getObjId = function(){
	return this.objId;
}

ObjPlayer.prototype.getName = function(){
	return this._characterName;
}


ObjPlayer.prototype.setName = function(n){
	this._characterName=n;
}

ObjPlayer.prototype.getAccount = function(){
	return this._accountName;
}

ObjPlayer.prototype.getWear = function(){
	return new Engine.Wear([]);
}

ObjPlayer.prototype.getSkin = function(){
	//lpTargetObj->CharSet[0] &= 0xF0;
	return 1;
}

ObjPlayer.prototype.getDir = function(){
	return this._Dir;
}
ObjPlayer.prototype.getPkLevel = function(){
	return this._PkLevel;
}

ObjPlayer.prototype.getType = function(){
	return this.Type;
}

ObjPlayer.prototype.TrapAttackEnemySearchX = function(count){
	this.TargetNumber = -1;
	var tObjNum;
	var pos = this.getX();
	var y = this.getY();

	for(var n =0;n<count;n++){
		pos++;
		for(var v2 in this.VpPlayer2){
			tObjNum = this.VpPlayer2[v2].number;

			if(tObjNum >= 0){
				
				obj = Engine['ObjectManager'].get(tObjNum);
				
				if(obj.Type==1){
					if(obj.Live){
						if(y == obj.getY()){
							if(pos == obj.getX()){
								//if((obj.Authority&2)!=2){
									this.TargetNumber = tObjNum;
									return;
								//}
							}
						}
					}
				}
			}
		}
	}
}


ObjPlayer.prototype.TrapAttackEnemySearchY = function(count){
	this.TargetNumber = -1;
	var tObjNum;
	var pos = this.getY();
	var x = this.getX();

	for(var n =0;n<count;n++){
		pos++;
		for(var v2 in this.VpPlayer2){
			tObjNum = this.VpPlayer2[v2].number;

			if(tObjNum >= 0){
				
				obj = Engine['ObjectManager'].get(tObjNum);
				
				if(obj.Type==1){
					if(obj.Live){
						if(x == obj.getX()){
							if(pos == obj.getY()){
								//if((obj.Authority&2)!=2){
									this.TargetNumber = tObjNum;
									return;
								//}
							}
						}
					}
				}
			}
		}
	}
}

ObjPlayer.prototype.TrapAttackEnemySearch = function(){
	var ObjNum;
	this.TargetNumber = -1;

	for(var v2 in this.VpPlayer2){
		tObjNum = this.VpPlayer2[v2].number;

		if(tObjNum >= 0){
				
			obj = Engine['ObjectManager'].get(tObjNum);
				
			if(obj.Type==1){
				if(obj.Live){
					if(this.getY() == obj.getY()){
						if(this.getX() == obj.getX()){
							//if((gObj[tObjNum].Authority&2)!=2){
								lpObj.TargetNumber = tObjNum;
								return;
							//}
						}
					}
				}
			}
		}
	}
}

ObjPlayer.prototype.TrapAttackEnemySearchRange = function(iRange){
	var tObjNum = -1;
	var iTargetingRate = 0;
	var iSuccessRate = 0;

	this.TargetNumber = -1;

	if(this.VPCount <= 0){
		return;
	}

	iTargetingRate = 100 / this.VPCount;

	for(var v2 in this.VpPlayer2){
		tObjNum = this.VpPlayer2[v2].number;

		if(tObjNum >= 0){
				
			obj = Engine['ObjectManager'].get(tObjNum);
			if(obj.Type==1){
				if(obj.Live){
					if((this.getY() - iRange) <= obj.getY() && (this.getY() + iRange) >= obj.getY()){
						if((this.getX() - iRange) <= obj.getX() && (this.getX() + iRange) >= obj.getX()){
							//if((gObj[tObjNum].Authority&2)!=2){
								lpObj.TargetNumber = tObjNum;
								iSuccessRate = Engine['MonsterAI'].Rand()%100;

								if(iSuccessRate < iTargetingRate){
									break;
								}
							//}
						}
					}
				}
			}
		}
	}
}

ObjPlayer.prototype.gObjMonsterTrapAct = function(){
	if(this.VPCount2 < 1){
		return;
	}

	if(this.m_AttackRange > 0){
		if(this._Dir == 3){
			this.TrapAttackEnemySearchX(this.m_AttackRange+1);
		}else if(this._Dir == 1){
			this.TrapAttackEnemySearchY(this.m_AttackRange+1);
		}else if(this._Dir == 8){
			this.TrapAttackEnemySearchRange(this.m_AttackRange);
		}
	}else{
		this.TrapAttackEnemySearch();
	}

	if(this.TargetNumber >= 0){
		this.m_ActState.Attack = 1;
		this.NextActionTime = this.m_AttackSpeed;
	}else{
		this.NextActionTime = this.m_MoveSpeed;
	}
}


ObjPlayer.prototype.MonsterBaseAct = function(){
	
	if ( this.TargetNumber >= 0 ){
		var obj = Engine['ObjectManager'].get(this.TargetNumber);
	}else{
		this.m_ActState.Emotion = 0;
	}

	if ( this.m_ActState.Emotion == 0 ){
		if ( this.m_Attribute ){
			if ( this.m_ActState.Attack ){
				this.m_ActState.Attack = 0;
				this.TargetNumber = -1;
				this.NextActionTime = 500;
			}
			var actcode1 = Engine['MonsterAI'].Rand()%2;

			if ( this.m_Attribute == 100 ){
				actcode1 = 1;
			}
			
			if ( actcode1 == 0 ){
				this.m_ActState.Rest = 1;
				this.NextActionTime = 500;
				
			}else if ( this.m_MoveRange > 0 && !this.m_SkillHarden && !this.m_iSkillStunTime ){
				
				if ( this.m_Attribute != 100 ){
					
					Engine['MonsterAI'].MonsterMoveAction(this);
				}else{
					
					var tx=0;
					var ty=0;

					if ( this.m_RecallMon >= 0 ){
						var RecallMon = Engine['ObjectManager'].get(this.m_RecallMon);
						
						if ( RecallMon.getStatus() > 2 ){

							if ( RecallMon.m_Rest == false ){
								var ret = this.GetTargetPos();
								if ( ret == true ){
									//this.MTX = ret.tx;
									//this.MTY = ret.ty;
									this.m_ActState.Move = 1;
									this.NextActionTime = 1000;
								}
							}
						}
					}
				}
			}

			if (this.Class == 249 || this.Class == 247 ){	// Guard
			
			/*
				if ( gEvent1 ){
					if ( !(rand()%30) )
					{
						if ( lpObj->m_PK_Count == 0 )
						{
							ChatSend(lpObj, "하트 아이템을 상점에 주세요. 푸짐한 경품 이벤트 중");	// Need Translation
							lpObj->m_PK_Count = 0;
						}
					}
				}*/

				//this.TargetNumber = gObjGuardSearchEnemy(lpObj);

				if ( this.TargetNumber >= 0 ){
					if ( Engine['ObjectManager'].get(this.TargetNumber).Class >= 248 ){
						this.TargetNumber = -1;
					}
				}
			}else{
				
				if ( this.m_Attribute == 100 ){					
					this.TargetNumber = this.SearchEnemy(2);
				}else{
					this.TargetNumber = this.SearchEnemy(1);
				}
			}

			if ( this.TargetNumber >= 0 ){
				
				this.m_ActState.EmotionCount = 30;
				this.m_ActState.Emotion = 1;
			}
		}
	}else if ( this.m_ActState.Emotion == 1 ){
		if ( this.m_ActState.EmotionCount > 0 ){
			this.m_ActState.EmotionCount--;
		}else{
			this.m_ActState.Emotion = 0;
		}

		if ( this.TargetNumber >= 0 && this.PathStartEnd == 0){
			/*
			if ( BC_MAP_RANGE(lpObj->MapNumber) ){
				int iRAND_CHANGE_TARGET = rand()%10;

				if ( iRAND_CHANGE_TARGET == 3 )
					lpObj->LastAttackerID = -1;

				if ( iRAND_CHANGE_TARGET == 1 )
				{
					if ( lpObj->LastAttackerID != -1 && lpObj->LastAttackerID != lpObj->TargetNumber )
					{
						if ( gObj[lpObj->LastAttackerID].Connected > PLAYER_LOGGED &&
							lpObj->MapNumber == gObj[lpObj->LastAttackerID].MapNumber )
						{
							lpObj->TargetNumber = lpObj->LastAttackerID;
							lpTargetObj = &gObj[lpObj->LastAttackerID];
						}
					}
				}
			}
			*/
			
			var dis = Engine['MonsterAI'].gObjCalDistance(this, obj);
			var attackrange;

			if ( this.m_AttackType >= 100 ){	// #warning Change this To Level
				attackrange = this.m_AttackRange+2;
			}else{
				attackrange = this.m_AttackRange;
			}

			if ( dis <= attackrange ){
				var tuser = Engine['ObjectManager'].get(this.TargetNumber);
				var map = tuser.getWorld();
				
				
				if ( map.CheckWall(this.getX(), this.getY(), tuser.getX(), tuser.getY()) == true ){
					var attr = map.GetAttr(tuser.getX(), tuser.getY());

					if ( (attr&1) != 1 ){
						this.m_ActState.Attack = 1;
					}else{
						
						this.TargetNumber = -1;
						this.m_ActState.EmotionCount = 30;
						this.m_ActState.Emotion = 1;
					}

					this._Dir = Engine['MonsterAI'].GetPathPacketDirPos(tuser.getX()-this.getX(), tuser.getY()-this.getY());
					this.NextActionTime = this.m_AttackSpeed;
				}
			}else{
				var ret = this.GetTargetPos();
				if ( ret == true ){
					
					if ( this.getWorld().CheckWall(this.getX(), this.getY(), this.MTX, this.MTY) == true ){
						this.m_ActState.Move = 1;
						this.NextActionTime = 400;
						
						var tuser = Engine['ObjectManager'].get(this.TargetNumber);
						
						this._Dir = Engine['MonsterAI'].GetPathPacketDirPos(tuser.getX()-this.getX(), tuser.getY()-this.getY());
						
						
						//this.setXY(this.MTX,this.MTY,this.Dir);
					}else{
						Engine['MonsterAI'].MonsterMoveAction(this);
						this.m_ActState.Emotion = 3;
						this.m_ActState.EmotionCount = 10;
					}
				}else{
					Engine['MonsterAI'].MonsterMoveAction(this);
				}
			}
		}
	}else if ( this.m_ActState.Emotion == 2 ){
		if ( this.m_ActState.EmotionCount > 0 ){
			this.m_ActState.EmotionCount--;
		}else{
			this.m_ActState.Emotion = 0;
		}

		this.m_ActState.Move = 1;
		this.NextActionTime = 800;

		if ( obj ){
			var tdir = Engine['MonsterAI'].GetPathPacketDirPos(obj.getX()-this.getX(), obj.getY()-this.getY())*2;
			this.MTX += stepDirections[tdir] ;
			this.MTY += stepDirections[tdir+1] ;
		}
	}else if (this.m_ActState.Emotion == 3 ){
		if ( this.m_ActState.EmotionCount > 0 ){
			this.m_ActState.EmotionCount--;
		}else{
			this.m_ActState.Emotion = 0;
		}

		this.m_ActState.Move = 0;
		this.m_ActState.Attack = 0;
		this.NextActionTime = 400;
	}
}


ObjPlayer.prototype.PathFindMoveMsgSend = function(){
	if ( this.m_SkillHarden){
		return false;
	}

	if ( this.m_iSkillStunTime > 0 ){
		return false;
	}

		
	dirX = (this.getX()<this.MTX)?1:-1;
	dirY = (this.getY()<this.MTY)?1:-1;
	
	nX = this.getX();
	nY = this.getY();
	
	sX = this.getX();
	sY = this.getY();
	
	var path = new Buffer(15);
	var stopNext = -1;
	
	var i = 0;
	while(i<15){
		
		
		var pos = Engine['MonsterAI'].GetPathPacketDirPos( (this.MTX-sX), (this.MTY-sY)) * 2;
		
		if(nX!=this.MTX){
			nX = nX + dirX;
		}
		if(nY!=this.MTY){
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
		
		
		//console.log(sX+" "+sY+" "+pos);
		if((sX==this.MTX) && (sY==this.MTY)){
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
		
	this.setXY(sX,sY,this._Dir);	
	
	return {s: true,p:path,t: i};
	//}
}

ObjPlayer.prototype.MonsterTopHitDamageUser = function(){
	var MaxHitDamage = 0;
	var MaxHitDamageUser = -1;

	for (var n in this.sHD){
		if ( this.sHD[n].number >= 0 ){
			if ( this.sHD[n].HitDamage > MaxHitDamage ){
				MaxHitDamage = this.sHD[n].HitDamage;
				MaxHitDamageUser = this.sHD[n].number;
			}
		}
	}

	return MaxHitDamageUser;
}



ObjPlayer.prototype.MonsterDieGiveItem = function(lpTargetObj){

	var store_count=0;
	var ExtDropPer=0;
	var DropItemNum=0;
	var type;
	var level;
	var x;
	var y;
	var dur=0;
	var Option1=0;
	var Option2=0;
	var Option3=0;
	var NOption=0;
	var item_drop=0;
	var n;
	var DropItem=0;

	if ( this.Class == 340 ){	// Dark Elf
		if ( Engine['Config'].g_bCrywolfMonsterDarkElfItemDrop ){
			var ItemDropRate = Engine['MonsterAI'].Rand2()%10000;

			if ( ItemDropRate <= Engine['Config'].g_iCrywolfMonsterDarkElfItemDropRate ){
				var iMaxHitUser = gObjMonsterTopHitDamageUser(lpObj);

				var cDropX = this.getX();
				var cDropY = this.getY();

				if ( !gObjGetRandomItemDropLocation(this.getMap(), cDropX, cDropY, 4, 4, 10)){
					cDropX = this.getX();
					cDropY = this.gety();;
				}

				CrywolfDarkElfItemBagOpen(lpTargetObj, this.getMap(), cDropX, cDropY);
			}
		}
		return;
	}
	
	if ( this.Class == 349 ){	// Crywolf Boss Monster
		if ( Engine['Config'].g_bCrywolfBossMonsterItemDrop ){
			var ItemDropRate = Engine['MonsterAI'].Rand2()%10000;

			if ( ItemDropRate <= Engine['Config'].g_iCrywolfBossMonsterItemDropRate ){
				var iMaxHitUser = gObjMonsterTopHitDamageUser(lpObj);


				var cDropX = this.getX();
				var cDropY = this.getY();

				if ( !gObjGetRandomItemDropLocation(this.getMap(), cDropX, cDropY, 4, 4, 10)){
					cDropX = this.getX();
					cDropY = this.getY();
				}

				CrywolfBossMonsterItemBagOpen(lpTargetObj, this.getMap(), cDropX, cDropY);
			}
		}
		return;
	}		
/*
	if ( lpObj->m_btCsNpcType )
		return;

	if ( lpObj->Class == 295 )
	{
		int iMaxHitUser = gObjMonsterTopHitDamageUser(lpObj);
		int iMaxCount = 1;

		for ( int i=0; i<iMaxCount ; i++ )
		{
			BYTE cDropX = lpObj->X;
			BYTE cDropY = lpObj->Y;

			LogAddTD("[Castle HuntZone] Boss Monster ItemDrop MaxHitUser [%d][%s][%s]",
				i, lpTargetObj->AccountID, lpTargetObj->Name);

			if ( gObjGetRandomItemDropLocation(lpObj->MapNumber, cDropX, cDropY, 4, 4, 10) == FALSE )
			{
				cDropX = lpObj->X;
				cDropY = lpObj->Y;
			}

			if ( i == 0 )
			{
				cDropX = lpObj->X;
				cDropY = lpObj->Y;
			}

			CastleHuntZoneBossRewardOpen(lpTargetObj, lpObj->MapNumber, cDropX, cDropY);
		}
		return;
	}
*/
	
//#if ( GS_CASTLE == 0 )
	if (this.Class == 362 || this.Class == 363 ){	// Maya Hand
	
		if ( Engine['Config'].g_bKanturuMayaHandItemDrop ){
			var ItemDropRate = Engine['MonsterAI'].Rand2()%10000;

			if ( ItemDropRate <= Engine['Config'].g_iKanturuMayaHandItemDropRate ){
				var iMaxHitUser = gObjMonsterTopHitDamageUser(lpObj);


				var cDropX = this.getX();
				var cDropY = this.getY();

				var location = this.getWorld().GetRandomItemDropLocation(cDropX, cDropY, 4, 4, 10);
				if (!location){
					cDropX = this.getX();
					cDropY = this.getY();
				}else{
					cDropX = location.X;
					cDropY = location.Y;
				}

				KanturuMayaHandItemBagOpen(lpTargetObj, this.getMap(), cDropX, cDropY);
			}
		}
		return;
	}
	
	if ( this.Class == 361 ){	// NightMare
	
		if ( Engine['Config'].g_bKanturuNightmareItemDrop ){
			var ItemDropRate = Engine['MonsterAI'].Rand2()%10000;

			if ( ItemDropRate <= Engine['Config'].g_iKanturuNightmareItemDropRate ){
				var iMaxHitUser = gObjMonsterTopHitDamageUser(lpObj);


				var cDropX = this.getX();
				var cDropY = this.getY();

				var location = this.getWorld().GetRandomItemDropLocation(cDropX, cDropY, 4, 4, 10);
				if (!location){
					cDropX = this.getX();
					cDropY = this.getY();
				}else{
					cDropX = location.X;
					cDropY = location.Y;
				}

				KanturuNightmareItemBagOpen(lpTargetObj, this.getMap(), cDropX, cDropY);
			}
		}

		return;
	}
//#endif
	
	if ( this.Class == 275 ){ // Kundun 

		var MaxHitUser = gObjMonsterTopHitDamageUser(lpObj);
		var iMaxNumOfRewardItem = 3;

		for ( var i=0;i<iMaxNumOfRewardItem;i++){
			var cDropX = this.getX();
			var cDropY = this.getY();

			if ( OBJMAX_RANGE(MaxHitUser) ){

				//LogAddTD("[★Kundun EVENT] In KALIMA(7), ItemDrop MaxHitUser [%d][%s][%s]",
				//	i, gObj[MaxHitUser].AccountID, gObj[MaxHitUser].Name);

				//KUNDUN_EVENT_LOG.Output("[★Kundun EVENT] In KALIMA(7), ItemDrop MaxHitUser [%d][%s][%s]",
				//	i, gObj[MaxHitUser].AccountID, gObj[MaxHitUser].Name);
			}else{
				//LogAddTD("[★Kundun EVENT] In KALIMA(7), ItemDrop MaxHitUser [%d][%s][%s]",
				//	i, lpTargetObj->AccountID, lpTargetObj->Name);

				//KUNDUN_EVENT_LOG.Output("[★Kundun EVENT] In KALIMA(7), ItemDrop MaxHitUser [%d][%s][%s]",
				//	i, lpTargetObj->AccountID, lpTargetObj->Name);
			}

			var location = this.getWorld().GetRandomItemDropLocation(cDropX, cDropY, 4, 4, 10);
			if (!location){
				cDropX = this.getX();
				cDropY = this.getY();
			}else{
				cDropX = location.X;
				cDropY = location.Y;
			}

			if ( this.Class == 275 ){ // Kundun	// useless if
	
				if ( (Engine['MonsterAI'].Rand2()%10000) < 2500 )
				{
					Engine['ItemManager'].MakeRewardSetItem(MaxHitUser, cDropX, cDropY, 1, this.getMap());

					//LogAddTD("[○Kundun EVENT] Drop SetItem ");
					//KUNDUN_EVENT_LOG.Output("[○Kundun EVENT] Drop SetItem ");

					continue;
				}
			}

			if ( OBJMAX_RANGE(MaxHitUser )){
				//LogAddTD("[○Kundun EVENT] Drop Item [%d][%s][%s]",
				//	i, gObj[MaxHitUser].AccountID, gObj[MaxHitUser].Name);
				//KUNDUN_EVENT_LOG.Output("[○Kundun EVENT] Drop Item [%d][%s][%s]",
				//	i, gObj[MaxHitUser].AccountID, gObj[MaxHitUser].Name);
			}else{
				//LogAddTD("[○Kundun EVENT] Drop Item [%d][%s][%s]",
				//	i, lpTargetObj->AccountID, lpTargetObj->Name);
				//KUNDUN_EVENT_LOG.Output("[○Kundun EVENT] Drop Item [%d][%s][%s]",
				//	i, lpTargetObj->AccountID, lpTargetObj->Name);
			}

			//KundunEventItemBoxOpen(lpTargetObj, this.getMap(), cDropX, cDropY);
		}

		return;
	}
	
	if ( this.Class == 249 || lpTargetObj.Class == 249 ||	// Guard
		this.Class == 247 || lpTargetObj.Class == 247 ){	// Guard
	
		return;
	}

	if ( this.m_RecallMon >= 0 ){
		return;
	}
	
	if ( this.Class == 131 ){	// Castle Gate
		return;
	}
	
	if ( Engine['Config'].BC_STATUE_RANGE(this.Class-132) ){	// Blood Castle Statue
		return;
	}
	
	if ( Engine['Config'].CC_MAP_RANGE(this.getMap()) ){
		//g_ChaosCastle.SearchNDropMonsterItem(lpObj->MapNumber-MAP_INDEX_CHAOSCASTLE1, lpObj->m_Index, lpTargetObj->m_Index);
		//gObjDel(lpObj->m_Index);
		return;
	}
	
	if ( this.m_bIsInMonsterHerd ){
		var lpMH = this.m_lpMonsterHerd;

		if ( lpMH ){
			if ( lpMH.MonsterHerdItemDrop(lpObj) ){
				return;
			}
		}
	}
	
	var itemrate = this.m_ItemRate;
	var moneyrate = this.m_MoneyRate;

	if ( itemrate < 1 ){
		itemrate = 1;
	}

	if ( moneyrate < 1 ){
		moneyrate = 1;
	}

	if ( this.Class == 44 ){ // Dragon

		dur = 255.0;
		x = this.getX();
		y = this.getY();
		level = 0;

		if ( (Engine['MonsterAI'].Rand2()%4) > 0 ){
			for (var n=0;n<4;n++){
				var x = this.getX()-2;
				var y = this.getY()-2;
				x+= Engine['MonsterAI'].Rand2()%3;
				y+= Engine['MonsterAI'].Rand2()%3;

				this.getWorld().MoneyItemDrop(10000, x, y);
			}

			return;
		}
		
		if ( (Engine['MonsterAI'].Rand2()%3) < 2 ){
			var MaxHitUser = gObjMonsterTopHitDamageUser(lpObj);
			type = Engine['ItemManager'].ItemGetNumberMake(14, 13);
								
			Engine['ItemManager'].ItemSerialCreateSend(this.getObjId(), this.getMap(), x, y, type, level, dur,
				Option1, Option2, Option3, MaxHitUser, 0, 0);

			return;
		}

		var MaxHitUser = gObjMonsterTopHitDamageUser(lpObj);
		type = Engine['ItemManager'].ItemGetNumberMake(14, 14);
		Engine['ItemManager'].ItemSerialCreateSend(this.getObjId(), this.getMap(), x, y, type, level, dur,
			Option1, Option2, Option3, MaxHitUser, 0, 0);

		return;
	}

	if ( this.Class == 43 ){ // Golden Budge Dragon
		dur = 255.0;
		x = this.getX();
		y = this.getY();
		level = 0;
		type = Engine['ItemManager'].ItemGetNumberMake(14, 11);
		var MaxHitUser = gObjMonsterTopHitDamageUser(lpObj);
		Engine['ItemManager'].ItemSerialCreateSend(this.getObjId(), this.getMap(), x, y, type, level, dur,
			Option1, Option2, Option3, MaxHitUser, 0, 0);

		return;
	}

	if ( lpObj.Class == 53 ){ // Golden Titan
		dur = 255.0;
		x = this.getX();
		y = this.getY();
		level = 9;
		type = Engine['ItemManager'].ItemGetNumberMake(14, 11);
		var MaxHitUser = gObjMonsterTopHitDamageUser(lpObj);
		Engine['ItemManager'].ItemSerialCreateSend(this.getObjId(), this.getMap(), x, y, type, level, dur,
			Option1, Option2, Option3, MaxHitUser, 0, 0);

		return;
	}

	if ( this.Class == 55 ){	// Death King
		if ( AttackEvent55BagOpen(lpObj)==1 ){
			return;
		}

		itemrate = 1;
	}else if ( this.Class == 78 ){ // Golden Goblin
	
		var MaxHitUser = gObjMonsterTopHitDamageUser(lpObj);
		x = this.getX();
		y = this.getY();
		dur = 255.0;
		level = 8;
		type = Engine['ItemManager'].ItemGetNumberMake(14, 11);
		Engine['ItemManager'].ItemSerialCreateSend(this.getObjId(), this.getMap(), x, y, type, level, dur,
			Option1, Option2, Option3, MaxHitUser, 0, 0);

		return;
	}else if ( this.Class == 79 ){	// Golden Derkon
	
		var MaxHitUser = gObjMonsterTopHitDamageUser(lpObj);
		x = this.getX();
		y = this.getY();
		dur = 255.0;
		level = 10;
		type = Engine['ItemManager'].ItemGetNumberMake(14, 11);
		Engine['ItemManager'].ItemSerialCreateSend(this.getObjId(), this.getMap(), x, y, type, level, dur,
			Option1, Option2, Option3, MaxHitUser, 0, 0);

		return;	
	}else if ( this.Class == 80 ){	//Golden Lizard King
	
		var MaxHitUser = gObjMonsterTopHitDamageUser(lpObj);
		x = this.getX();
		y = this.getY();
		dur = 255.0;
		level = 11;
		type = Engine['ItemManager'].ItemGetNumberMake(14, 11);
		Engine['ItemManager'].ItemSerialCreateSend(this.getObjId(), this.getMap(), x, y, type, level, dur,
			Option1, Option2, Option3, MaxHitUser, 0, 0);

		return;	
	}else if ( this.Class == 82 ){	// Golden Tantalos
	
		var MaxHitUser = gObjMonsterTopHitDamageUser(lpObj);
		x = this.getX();
		y = this.getY();
		dur = 255.0;
		level = 12;
		type = Engine['ItemManager'].ItemGetNumberMake(14, 11);
		Engine['ItemManager'].ItemSerialCreateSend(this.getObjId(), this.getMap(), x, y, type, level, dur,
			Option1, Option2, Option3, MaxHitUser, 0, 0);

		return;	
	}

	if ( gEventMonsterItemDrop(lpObj, lpTargetObj) ){
		return;
	}

	if ( g_QuestInfo.MonsterItemDrop(lpObj) ){
		return;
	}

	if ( lpTargetObj.Level <= 20 ){
		if ( (Engine['MonsterAI'].Rand2()%10000) < 2000 ){
			var MaxHitUser = gObjMonsterTopHitDamageUser(lpObj);
			x = this.getX();
			y = this.getY();
			dur = 1.0;
			level = 0;
			type = Engine['ItemManager'].ItemGetNumberMake(14, 0);	// Apple
			Engine['ItemManager'].ItemSerialCreateSend(this.getObjId(), this.getMap(), x, y, type, level, dur,
				Option1, Option2, Option3, MaxHitUser, 0, 0);
		}
	}

	ExtDropPer = Engine['MonsterAI'].Rand2()%2000;	// Excellent Drop Percent #warning
	var ItemDropPer = Engine['Config'].gItemDropPer;
	ItemDropPer += gItemDropPer * lpTargetObj.SetOpImproveItemDropRate / 100;
	ItemDropPer = ItemDropPer * (lpTargetObj.m_wItemDropRate / 100.0);

	if ( ExtDropPer != 0 ){
		DropItem = Engine['ItemManager'].GetItem(this.Level-25);

		if ( !DropItem ){
			item_drop = false;
		}else{
			var foundChangeupitem=0;
			
			for (var i=0;i<MAX_TYPE_PLAYER-1;i++){	// #error Delete the -1
			
				if ( DropItem.m_RequireClass[i] > 1 ){
					foundChangeupitem = true;
					break;
				}
			}

			if ( foundChangeupitem ){
				ExtDropPer = Engine['MonsterAI'].Rand2()%100;
			}

			if ( ExtDropPer ){
				if ( (Engine['MonsterAI'].Rand2()%itemrate) < ItemDropPer ){
					item_drop=true;
				}
			}
		}
	}else{
		if ( (Engine['MonsterAI'].Rand2()%itemrate) < ItemDropPer ){
			DropItem = Engine['ItemManager'].GetItem(this.Level);

			if ( !DropItem ){
				item_drop = false;
			}else{
				item_drop = true;
			}
		}
	}

	if ( item_drop ){
		if ( !DropItem.IsItem() ){
			item_drop = false;
		}

		var I;

		if ( DropItem.iType >= Engine['ItemManager'].ItemGetNumberMake(15,0)  && DropItem.i_Group <= Engine['ItemManager'].ItemGetNumberMake(16,0) ){
			I = 0;
		}

		if ( Engine['Config'].DS_MAP_RANGE(this.getMap())){
			if ( !Engine['Config'].IsCanNotItemDtopInDevilSquare(DropItem.iType) ){
				if ( (Engine['MonsterAI'].Rand2()%10) ){
					item_drop = false;
				}
			}
		}

		if ( DropItem.iType == Engine['ItemManager'].ItemGetNumberMake(13,14) && this.getMap() != 10){ // Loch Feather
			item_drop = false;
		}

		/*if ( g_CrywolfSync.GetOccupationState() == 1 && Engine['Config'].g_iCrywolfApplyMvpPenalty ){
			// Jewels
			if ( DropItem->m_Type == ITEMGET(14,13) ||  DropItem->m_Type == ITEMGET(14,14) ||  DropItem->m_Type == ITEMGET(14,16) ||
				 DropItem->m_Type == ITEMGET(14,22) ||  DropItem->m_Type == ITEMGET(12,15) ||  DropItem->m_Type == ITEMGET(14,31) ){
				if ( (Engine['MonsterAI'].Rand2()%100) > g_CrywolfSync.GetGemDropPenaltiyRate() ){
					item_drop = false;
				}

			}
		}*/
	}

	if ( item_drop){
		type = DropItem.iType;
		level = DropItem._iLevel;

		if ( ExtDropPer != 0 ){
			dur = Engine['ItemManager'].ItemGetDurability(DropItem.mType, 0, 1, 0);
		}else{
			dur = DropItem._iDur;
		}

		x = this.getX();
		y = this.getY();

		var option1rand;
		var option2rand;
		var option3rand;
		var optionc;

		if ( ExtDropPer != false ){
			option1rand=100;
			option2rand=1;
			option3rand=Engine['MonsterAI'].Rand2()%100;
			optionc=Engine['MonsterAI'].Rand2()%3;
			NOption = Engine['ItemManager'].NewOptionRand(this.Level);
			level = 0;
		}else{
			option1rand=6;
			option2rand=4;
			option3rand=Engine['MonsterAI'].Rand2()%100;
			optionc=Engine['MonsterAI'].Rand2()%3;
			NOption = 0;
		}

		if ( (Engine['MonsterAI'].Rand2()%100) < option1rand ){
			Option1 = 1;
		}

		if ( (Engine['MonsterAI'].Rand2()%100) < option2rand ){
			Option2 = 1;
		}

		switch ( optionc ){
			case 0:
				if ( option3rand < 4 ){
					Option3=3;
				}
				break;
			case 1:
				if ( option3rand < 8 ){
					Option3=2;
				}
				break;
			case 2:
				if ( option3rand < 12 ){
					Option3=1;
				}
				break;
		}

		if ( this.Class == 43 ){ // Golden Budge Dragon
		
			Option1 = DropItem.m_Option1;
			Option2 = DropItem.m_Option2;
			Option3 = DropItem.m_Option3;
		}

		if ( type == Engine['ItemManager'].ItemGetNumberMake(12,15) ||	// Chaos
			 type == Engine['ItemManager'].ItemGetNumberMake(14,13) ||	// Bless
			 type == Engine['ItemManager'].ItemGetNumberMake(14,14) ||	// Soul
			 type == Engine['ItemManager'].ItemGetNumberMake(14,31) ||	// Guardian
			 type == Engine['ItemManager'].ItemGetNumberMake(14,16)){	// Life
		
			Option1=0;
			Option2=0;
			Option3=0;
			NOption=0;
		}

		var MaxHitUser = this.MonsterTopHitDamageUser();

		if ( DropItem._iSerial ){
		
			Engine['ItemManager'].ItemSerialCreateSend(this.getObjId(), this.getMap(), x, y, type, level, dur,
				Option1, Option2, Option3, MaxHitUser, NOption, 0);
		}else{
			this.getWorld().MonsterItemDrop(type, level, dur, x, y, 
				Option1, Option2, Option3, NOption, 0, MaxHitUser, 0, 0);
		}
	}else if ( this.Money < 1 ){
		return;
	}else if ( (Engine['MonsterAI'].Rand2()%moneyrate) < 10 ){
		var x = this.getX();
		var y = this.getY();
		var money = this.Money;
		money += (money/100.0)*lpTargetObj.MonsterDieGetMoney;
		money +=7.0;

		if ( Engine['Config'].DS_MAP_RANGE(lpObj.getMap()) ){
			var MaxHitUser = this.gObjMonsterTopHitDamageUser();
			gObj[MaxHitUser].m_nEventMoney += money;
		}else{
			this.getWorld().MoneyItemDrop(money, x, y);
		}
	}

	if ( this.Money < 1 ){
		return;
	}

	if ( Engine['Config'].DS_MAP_RANGE(this.getMap()) ){
		return;
	}
	
	if ( (Engine['MonsterAI'].Rand2()%400) == 1 ){
		for ( n=0;n<4;n++){
			var x = this.getX()-2;
			var y = this.getY()-2;
			x+= Engine['MonsterAI'].Rand2()%3;
			y+= Engine['MonsterAI'].Rand2()%3;

			this.getWorld().MoneyItemDrop(this.Money, x, y);
		}
	}

	if ( Engine['Config'].gEvent1ItemDropTodayPercent > 0 ){
		if ( (Engine['MonsterAI'].Rand2()%Engine['Config'].gEvent1ItemDropTodayPercent) == 0 ){
			if ( Engine['Config'].gEvent1ItemDropTodayCount < Engine['Config'].gEvent1ItemDropTodayMax ){
				Engine['Config'].gEvent1ItemDropTodayCount++;
				type = ItemGetNumberMake(14, 12);	// Heart
				dur = 0;
				x = this.getX();
				y = this.getY();
				level = 1;
				Engine['ItemManager'].ItemSerialCreateSend(this.getObjId(),this.getMap(), x, y,
					type, level, dur, 0, 0, 0, -1, 0, 0);
			}
		}
	}
}


ObjPlayer.prototype.MonsterStateProc = function(lpObj,aMsgCode, aMsgSubCode){
	if ( lpObj.m_iMonsterBattleDelay > 0 ){
		return;
	}

	switch ( aMsgCode ){
		case 0:
			if ( lpObj.m_Attribute == 0 ){
				return;
			}
			
			if ( this.Live == FALSE || this.m_State != 2){
				return;
			}

			if ( lpObj.m_ActState.Emotion == 0 ){
				lpObj.m_ActState.Emotion = 1;
				lpObj.m_ActState.EmotionCount = 10;
			}else if ( lpObj.m_ActState.Emotion == 1 ){
				lpObj.m_ActState.EmotionCount = 10;
			}

			if ( lpObj.m_ActState.Attack == 0 && lpObj.PathStartEnd == 0){
				if ( OBJMAX_RANGE(aIndex) ){
					var Map = this.getWorld();
					var attr;
					var dis = Engine['MonsterAI'].gObjCalDistance(lpObj, this);
					var range;

					if ( lpObj.m_AttackType >= 100 ){
						range = lpObj.m_AttackRange +2;
					}else{
						range = lpObj.m_AttackRange;
					}

					if ( dis <= range ){
						if ( this.m_RecallMon >= 0 ){
							if ( lpObj.m_RecallMon >= 0 ){
								
								if ( this.Type == 2 ){
									lpObj.TargetNumber = this.getObjId();
								}
							}else{
								lpObj.TargetNumber = this.getObjId();
							}
						}else if ( (Engine['MonsterAI'].Rand2()%100) < 90 ){
							if ( lpObj.m_RecallMon >= 0 ){
								if ( this.Type == 2 ){
									lpObj.TargetNumber = this.getObjId();
								}
							}else{
								lpObj.TargetNumber = this.getObjId();
							}
						}
					}else{
						var wall = 0;

						wall = Map.CheckWall2(this.getX(), this.getY(), gObj.getX(), gObj.getY());

						if ( wall == 1 ){
							attr = Map.GetAttr(gObj.getX(), gObj.getY());

							if ( (attr&1) != 1 ){
								if ( lpObj.TargetNumber < 0 ){
									lpObj.TargetNumber = this.getObjId();
								}
							}
						}
					}


					if (lpObj.m_bIsInMonsterHerd != false && lpObj.TargetNumber == aIndex ){
						if (lpObj.m_lpMonsterHerd ){
							//this.m_lpMonsterHerd->BeenAttacked (lpObj, &gObj[aIndex]);
						}
					}
				}
			}else{
				if ( (Engine['MonsterAI'].Rand2() % 2 )== 1 && this.PathStartEnd == 0){
					var IndexEnemy = lpObj.TargetNumber;
					var EnemyMap = lpObj.getWorld();

					var enemydis = Engine['MonsterAI'].gObjCalDistance(lpObj, this);
					var range;

					if ( lpObj.m_AttackType >= 100 ){
						range = lpObj.m_AttackRange + 2;
					}else{
						range = lpObj.m_AttackRange;
					}

					if ( enemydis <= range ){
						lpObj.m_ActState.Attack = 1;
						lpObj.TargetNumber = aIndex;
					}else{
						if ( EnemyMap.CheckWall2(lpObj.getX(), lpObj.getY(), this.getX(), this.getY()) == 1 ){
							lpObj.m_ActState.Attack = 1;
							lpObj.TargetNumber = this.getObjId();
						}
					}
				}else{
					var MaxLife = lpObj.MaxLife;
					MaxLife >>= 1;

					if ( MaxLife > lpObj.Life ){
						if ( lpObj.m_Attribute != 2 ){
							lpObj.m_ActState.Emotion = 2;
							lpObj.m_ActState.EmotionCount = 2;
						}
					}
				}
			}
			break;
		case 1:
		/*
#if ( GS_CASTLE == 1 )
			if ( lpObj->m_btCsNpcType )
			{
				switch ( lpObj->m_btCsNpcType )
				{
					case 1:	g_CastleSiege.DelNPC(lpObj->m_Index, lpObj->Class, lpObj->m_iCsNpcExistVal, TRUE);	break;
					case 2:	g_CastleSiege.DelNPC(lpObj->m_Index, lpObj->Class, lpObj->m_iCsNpcExistVal, FALSE);break;
					case 3:	g_CastleSiege.DelNPC(lpObj->m_Index, lpObj->Class, lpObj->m_iCsNpcExistVal, FALSE);	break;
				}

				if ( lpObj->Class == 287 || lpObj->Class == 286 )
					g_CsNPC_Mercenary.DeleteMercenary(lpObj->m_Index);

				if ( lpObj->Class == 278 )
					g_CsNPC_LifeStone.DeleteLifeStone(lpObj->m_Index);

				gObjDel(lpObj->m_Index);
			}
#endif
*/
			//if ( KALIMA_MAP_RANGE(lpObj->MapNumber)  ){
			//	if ( lpObj->Class == 161 || lpObj->Class == 181 || lpObj->Class == 189 || lpObj->Class == 197 || lpObj->Class == 267 ){
			//		g_KalimaGate.CreateKalimaGate2(aIndex, lpObj->MapNumber, lpObj->X, lpObj->Y);
			//	}
			//}

			lpObj.MonsterDieGiveItem(this);
			lpObj.NextActionTime = 500;

			if ( lpObj.m_RecallMon >= 0 ){
				//gObjMonsterCallKill(this.m_RecallMon);
			}

			if (  BC_MAP_RANGE(lpObj.getMap()) != false && lpObj.Type >= 2){
				if ( lpObj.Class == 89 || lpObj.Class == 95 || lpObj.Class == 112 || lpObj.Class == 118 || lpObj.Class == 124 || lpObj.Class == 130 || lpObj.Class == 143){
					//g_BloodCastle.m_BridgeData[lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1].m_iBC_BOSS_MONSTER_KILL_COUNT++;
				}else{
					//g_BloodCastle.m_BridgeData[lpObj->MapNumber - MAP_INDEX_BLOODCASTLE1].m_iBC_MONSTER_KILL_COUNT++;
				}
				/*
				if ( g_BloodCastle.CheckMonsterKillCount(lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1) != false ){
					if (g_BloodCastle.m_BridgeData[lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1].m_bBC_MONSTER_KILL_COMPLETE == false ){
						g_BloodCastle.m_BridgeData[lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1].m_bBC_MONSTER_KILL_COMPLETE = true;
						g_BloodCastle.m_BridgeData[lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1].m_iBC_MONSTER_MAX_COUNT = -1;

						PMSG_STATEBLOODCASTLE pMsg;

						PHeadSetB((LPBYTE)&pMsg, 0x9B, sizeof(PMSG_STATEBLOODCASTLE));

						pMsg.btPlayState = BC_STATE_PLAYEND;
						pMsg.wRemainSec = 0;
						pMsg.wMaxKillMonster = 0;
						pMsg.wCurKillMonster = 0;
						pMsg.wUserHaveWeapon = 0;
						pMsg.btWeaponNum = -1;

						g_BloodCastle.SendBridgeAnyMsg( (UCHAR *)&pMsg, pMsg.h.size, lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1);
						g_BloodCastle.ReleaseCastleBridge(lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1);
						g_BloodCastle.m_BridgeData[lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1].m_dwBC_TICK_DOOR_OPEN = GetTickCount() + 3000;

						LogAddTD("[Blood Castle] (%d) All of the Monster Terminated -> %d", lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1+1,
							g_BloodCastle.m_BridgeData[lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1].m_iBC_MONSTER_KILL_COUNT);

						g_BloodCastle.m_BridgeData[lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1].m_iBC_BOSS_MONSTER_MAX_COUNT = g_BloodCastle.GetCurrentLiveUserCount(lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1)*2;
						g_BloodCastle.m_BridgeData[lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1].m_iBC_BOSS_MONSTER_KILL_COUNT = 0;

						if ( g_BloodCastle.m_BridgeData[lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1].m_iBC_BOSS_MONSTER_MAX_COUNT > 10){
							g_BloodCastle.m_BridgeData[lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1].m_iBC_BOSS_MONSTER_MAX_COUNT = 10;
						}
					}

					if (g_BloodCastle.m_BridgeData[lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1].m_iBC_MONSTER_SUCCESS_MSG_COUNT < 1 ){
						g_BloodCastle.m_BridgeData[lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1].m_iBC_MONSTER_SUCCESS_MSG_COUNT++;
						g_BloodCastle.SendNoticeMessage(lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1, lMsg.Get(MSGGET(4, 144))); 
					}
					
				}

				if ( g_BloodCastle.m_BridgeData[lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1].m_bBC_MONSTER_KILL_COMPLETE != false ){
					if ( g_BloodCastle.CheckBossKillCount(lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1) != false ){
						if ( g_BloodCastle.m_BridgeData[lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1].m_bBC_BOSS_MONSTER_KILL_COMPLETE == false ){
							g_BloodCastle.m_BridgeData[lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1].m_bBC_BOSS_MONSTER_KILL_COMPLETE = true;
							g_BloodCastle.m_BridgeData[lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1].m_iBC_BOSS_MONSTER_MAX_COUNT = -1;

							g_BloodCastle.SetSaintStatue(lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1);

							LogAddTD("[Blood Castle] (%d) All of the Boss Monster Terminated -> %d",
								lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1+1, g_BloodCastle.m_BridgeData[lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1].m_iBC_BOSS_MONSTER_KILL_COUNT);
						}

						if ( g_BloodCastle.m_BridgeData[lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1].m_iBC_BOSS_MONSTER_SUCCESS_MSG_COUNT < 1 ){
							g_BloodCastle.m_BridgeData[lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1].m_iBC_BOSS_MONSTER_SUCCESS_MSG_COUNT++;
							g_BloodCastle.SendNoticeMessage(lpObj->MapNumber-MAP_INDEX_BLOODCASTLE1, lMsg.Get(MSGGET(4, 156)));
						}
					}
				}*/
			}
			
			break;


		case 2:
			if ( this.Live != false ){
				if ( Engine['Config'].BC_MAP_RANGE(this.getMap()) == false){
					if ( this.Class != 131 || ((  (lpObj.Class-132)<0)?false:((lpObj.Class-132)>2)?false:true)==false ){
						//gObjBackSpring(lpObj, &gObj[aIndex]);
					}
				}
			}

			break;

		case 3:
			lpObj.TargetNumber = -1;
			lpObj.LastAttackerID = -1;
			lpObj.m_ActState.Emotion = 0;
			lpObj.m_ActState.Attack = 0;
			lpObj.m_ActState.Move = 0;
			lpObj.NextActionTime = 1000;
			break;

		case 4:
			lpObj.m_ActState.Emotion = 3;
			lpObj.m_ActState.EmotionCount = 1;
			break;

		case 5:
			//gObjMemFree(lpObj->m_Index);
			break;

		case 6:
			if ( this.Live != false ){
				//gObjBackSpring2(lpObj, &gObj[aIndex], 2);
			}

			break;

		case 7:
			if ( this.Live != false ){
				//gObjBackSpring2(lpObj, &gObj[aIndex], 3);
			}
			break;

		case 55:
			//gObjAttack(lpObj, &gObj[aIndex], NULL, FALSE, 0, 0, FALSE);
			break;

		case 56:
			{
				
				if ( this.m_PoisonType == 0 ){
					if ( retResistance(this, 1) == 0 ){
						this.m_PoisonType = 1;
						this.m_PoisonBeattackCount = aMsgSubCode;
						this.lpAttackObj = lpObj;
						this.m_ViewSkillState |= 1;
						//GCStateInfoSend(lpTargetObj, 1, lpTargetObj->m_ViewSkillState);
					}
				}
			}
			break;

		case 57:
			{
				//gObjBackSpring2(gObj, this, aMsgSubCode);
			}
			break;
	}
}


ObjPlayer.prototype.MonsterProcess = function(){
	//gObjMsgProc(lpObj);

	if ( this.Live == false ){
		return;
	}

	if ( this.m_iMonsterBattleDelay > 0 ){
		this.m_iMonsterBattleDelay--;
	}

	if ( (new Date().getTime() - this.CurActionTime ) < (this.NextActionTime + this.DelayActionTime) ){
		return;
	}
	

	this.CurActionTime = new Date().getTime();
/*
	if ( BC_MAP_RANGE(lpObj->MapNumber) != FALSE ){
		if ( lpObj->Class == 131|| ((lpObj->Class-132<0)?FALSE:(lpObj->Class-132>2)?FALSE:TRUE) != FALSE )
		{
			return;
		}
	}
*/
	if ( ((this.m_Attribute < 51)?false:(this.m_Attribute > 58)?false:true) != false ){
		if ( this.m_Attribute == 58 ){
			//g_KalimaGate.KalimaGateAct2(lpObj->m_Index);
			return;
		}

		//g_KalimaGate.KalimaGateAct(lpObj->m_Index);
		return;
	}
	
	//console.log("OK 2");
/*
#if ( GS_CASTLE == 1 )
	if ( lpObj->Class == 283 )	return;
	if ( lpObj->Class == 288 )	return;
	if ( lpObj->Class == 278 )	return;
#endif
*/

	if ( this.Class >= 100 && this.Class <= 110 ){
		this.MonsterTrapAct(); // concluido
	}else if ( this.Class == 200 ){
		var ground;
		//var team = gCheckGoal(lpObj->X, lpObj->Y, ground);

		//if ( team >= 0 ){
		//	gObjMonsterRegen(lpObj);
		//	gBattleSoccerScoreUpdate(ground, team);
		//	return;
		//}
	}else{
		if ( this.Class == 287 || this.Class == 286 ){
			//g_CsNPC_Mercenary.MercenaryAct(lpObj->m_Index);
		}else if ( this.m_bIsInMonsterHerd != false )	{
			
			if ( this.m_lpMonsterHerd != undefined ){
				//lpObj->m_lpMonsterHerd->MonsterBaseAct(lpObj);
			}
		}else{
			this.MonsterBaseAct();
			
		}
	}

	if ( this.m_Attribute == 100 ){
		if ( this.m_RecallMon >= 0 && this.m_RecallMon < 6000 ){
			//LPOBJ lpCallMonObj;
			var Success = false;

			lpCallMonObj = Engine['ObjectManager'].get(this.m_RecallMon);


			if ( this.getMap() != lpCallMonObj.getMap()){
				Success = true;
			}
	
			if ( Engine['MonsterAI'].gObjCalDistance(lpCallMonObj, this)> 14 ){
				Success = true;
			}

			if ( Success == true ){
				//gObjTeleportMagicUse(lpObj.m_Index, lpCallMonObj.X+1, lpCallMonObj.Y);
				this._mapId = lpCallMonObj._mapId;

				return;
			}
		}
	}

	if ( this.m_ActState.Move != 0 ){
		
		//this.setXY(this.MTX,this.MTY,this.Dir);
		var path = this.PathFindMoveMsgSend();
		if ( path.s == true ){
			//console.log(path);
			this.m_ActState.Move  = 0;
			this.m_ActState.NextActionTime = this.m_MoveSpeed;
		}

		this.m_ActState.Move = 0;

		return;
	}

	if ( this.m_ActState.Attack == 1 ){
		if ( Engine['TMonsterSkillManager'].CheckMonsterSkill(this.Class) ){
			var bEnableAttack = true;

			if ( this.TargetNumber < 0 ){
				bEnableAttack = false;
			}

			var obj = Engine['ObjectManager'].get(this.TargetNumber);
			
			if ( obj.Live == false || obj.Teleport != 0){
				bEnableAttack = false;
			}

			if ( obj.getStatus() <= 2 || obj.CloseCount != -1 ){
				bEnableAttack = false;
			}

			if ( bEnableAttack == false ){
				this.TargetNumber = -1;
				this.m_ActState.Emotion = 0;
				this.m_ActState.Attack = 0;
				this.m_ActState.Move = 0;
				this.NextActionTime = 1000;
				return;
			}
			
			if ( Engine['MonsterAI'].Rand2()%4 == 0 ){
				
				
				
				/*
				PMSG_ATTACK pAttackMsg;

				pAttackMsg.AttackAction = 120;
				pAttackMsg.DirDis = lpObj->Dir;
				pAttackMsg.NumberH = (BYTE)((DWORD)lpObj->TargetNumber>>(DWORD)8);
				pAttackMsg.NumberL = lpObj->TargetNumber&0xFF;
				*/
				
				
				var response = new Buffer([0xC1,0x09,0x18,(((this.getObjId() >> 8) & 0xFF)) ,
												((this.getObjId()) & 0xFF ),this._Dir,120,
												(((obj.getObjId() >> 8) & 0xFF)) ,((obj.getObjId()) & 0xFF )]);
												
												
				Engine.ObjectManager.DataSendV2(this,response);

				
				
				//GCActionSend(lpObj, 120, lpObj->m_Index, lpObj->TargetNumber);
				
				Engine['AttackManager'].Attack(this, obj, false, false, 0, 0, false);
			}else{
				//TMonsterSkillManager::UseMonsterSkill(lpObj->m_Index, lpObj->TargetNumber, 0);
			}

			this.m_ActState.Attack = 0;
		}else{
			var AttackType = this.m_AttackType;
			var lc6 = 0;

			if ( AttackType >= 100 ){
				if ( (Engine['MonsterAI'].Rand()%5) == 0 ){
					AttackType -= 100;
					lc6 = true;
				}else{
					AttackType = 0;
				}
			}

			if ( lc6 != false || this.m_AttackType == 50){
				if ( this.TargetNumber >= 0 ){
					
					obj = Engine['ObjectManager'].get(this.TargetNumber);
					
					if ( obj.getStatus() > 2 && obj.CloseCount == -1 ){
						if ( obj.Live == FALSE ){
							this.TargetNumber = -1;
							this.m_ActState.Emotion = 0;
							this.m_ActState.Attack = 0;
							this.m_ActState.Move = 0;
							this.NextActionTime = 1000;
						}else if ( obj.Teleport == 0 ){ // if is not dead
						
							gObjMonsterMagicAttack(lpObj, -1);

							if ( this.Type == 2 ){
								if ( this.m_bIsInMonsterHerd != false ){
									if (this.m_lpMonsterHerd != undefined ){
										//this.m_lpMonsterHerd->MonsterAttackAction(lpObj, &gObj[lpObj->TargetNumber]);
									}
								}
							}
						}
					}else{
						this.TargetNumber = -1;
						this.m_ActState.Emotion = 0;
						this.m_ActState.Attack = 0;
						this.m_ActState.Move = 0;
						this.NextActionTime = 1000;
					}
				}
			}else{
				if ( this.TargetNumber >= 0 ){
					
					obj = Engine['ObjectManager'].get(this.TargetNumber);
					
					if ( obj.getStatus() > 2 &&  obj.CloseCount == -1 ){
						if ( obj.Live == false ){
							this.TargetNumber = -1;
							this.m_ActState.Emotion = 0;
							this.m_ActState.Attack = 0;
							this.m_ActState.Move = 0;
							this.NextActionTime = 1000;
						}else if ( obj.Teleport == 0 ){
							//gObjMonsterAttack(lpObj, &gObj[lpObj->TargetNumber]);

							if ( this.Type == 2 ){
								if ( this.m_bIsInMonsterHerd != false ){
									if (this.m_lpMonsterHerd != undefined ){
										//this.m_lpMonsterHerd->MonsterAttackAction(lpObj, &gObj[lpObj->TargetNumber]);
									}
								}
							}
						}
						
					}else{
						this.TargetNumber = -1;
						this.m_ActState.Emotion = 0;
						this.m_ActState.Attack = 0;
						this.m_ActState.Move = 0;
						this.NextActionTime = 1000;
					}
				}
			}

			this.m_ActState.Attack = 0;
		}
	}
}



exports.Init = function(E){ Engine = E; return ObjPlayer; }