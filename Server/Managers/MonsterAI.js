


var Engine = {};


allMonsters = {};


var ObjManagers = {
	Rand: function(min,max){
		return Math.floor(Math.random() * (max-min)+1) + min;
	},
	Rand2: function(){
		return Math.round(Math.random()*32767);
	},
	AddMonster: function(BaseId,Map,Class,X,Y,Dir){
		
			var bot = new Engine.Monster(Class,BaseId);
			var bIndex = Engine.ObjectManager.addMob(bot);
			if(bIndex!=false){
				bot.setStatus(3);
				bot._Dir = Dir;
				console.log("Dir "+Dir);
				allMonsters[bIndex] = bot;	
				bot.setMap(Map,X,Y);
			}
	},
	MonsterMove: function(){
		for(var m in allMonsters){
			
			
			allMonsters[m].MonsterProcess();
			
			//this.MonsterBaseAct(allMonsters[m]);
			
			//var x =this.Rand(123,128);
			//var y =this.Rand(78,85);  
			
			//allMonsters[m].setXY(x,y);
		}
	},
	gObjCalDistance: function(lpObj1, lpObj2){
		if ( lpObj1.getX() == lpObj2.getX() && lpObj1.getY() == lpObj2.getY() ){
			return 0;
		}

		var tx = lpObj1.getX() - lpObj2.getX();
		var ty = lpObj1.getY() - lpObj2.getY();

		return Math.sqrt( (tx*tx)+(ty*ty) );
	},
	MonsterBaseAct: function(lpObj){

		if ( lpObj.TargetNumber >= 0 )
		{
			lpTObj = Engine['ObjectManager'].get(lpObj.TargetNumber);
		}
		else
		{
			lpObj.m_ActState.Emotion = 0;
		}

		//console.log("Emotion: "+lpObj.m_ActState.Emotion);
		switch ( lpObj.m_ActState.Emotion ){
			case 0:{
					if ( lpObj.m_ActState.Attack != 0 ){
						lpObj.m_ActState.Attack = 0;
						lpObj.TargetNumber = -1;
						lpObj.NextActionTime = 500;
					}

					var actcode1 = this.Rand2() % 2;

					if ( actcode1 == 0 ){
						lpObj.m_ActState.Rest = 1;
						lpObj.NextActionTime = 500;
					}
					else if ( lpObj.m_MoveRange > 0 ){
						if ( lpObj.m_SkillHarden == 0 ){
							this.MonsterMoveAction(lpObj);
						}
					}

					if ( lpObj.m_bIsMonsterAttackFirst != false ){
						lpObj.TargetNumber = lpObj.SearchEnemy(1);
						
						console.log("Search: "+lpObj.TargetNumber);

						if ( lpObj.TargetNumber >= 0 ){
							lpObj.m_ActState.EmotionCount = 30;
							lpObj.m_ActState.Emotion = 1;
						}
					}
				}
				break;

			case 1:

				if ( lpObj.m_ActState.EmotionCount > 0 )
				{
					lpObj.m_ActState.EmotionCount --;
				}
				else
				{
					lpObj.m_ActState.Emotion = 0;
				}

				if ( lpObj.TargetNumber >= 0 /*&& lpObj.PathStartEnd == 0*/){
					var dis = this.gObjCalDistance(lpObj, lpTObj);
					var attackRange;

					if ( lpObj.m_AttackType >= 100 ){
						attackRange = lpObj.m_AttackRange + 2;
					}else{
						attackRange = lpObj.m_AttackRange;
					}

					if ( dis <= attackRange ){
						var tuser = Engine['ObjectManager'].get(lpObj.TargetNumber);
						var Map = tuser.getWorld();
						
						if ( Map.CheckWall(lpObj.X, lpObj.Y, tuser.getX, tuser.getY()) == true ){
							var attr = Map.GetAttr(tuser.getX(), tuser.getY());

							if ( (attr&1) != 1 ){
								lpObj.m_ActState.Attack = 1;
								lpObj.m_ActState.EmotionCount = ((this.Rand2()%30)+20);
							}else{
								lpObj.TargetNumber = -1;
								lpObj.m_ActState.EmotionCount = 30;
								lpObj.m_ActState.Emotion = 1;
							}

							lpObj.Dir = this.GetPathPacketDirPos(lpTObj.getX()-lpObj.getX(), lpTObj.getY()-lpObj.getY());
							lpObj.NextActionTime = lpObj.m_AttackSpeed;
						}
					}else{
						if ( lpObj.GetTargetPos() == true ){
							if ( lpObj.getWorld().CheckWall(lpObj.getX(), lpObj.getY(), lpObj.MTX, lpObj.MTY) == true ){
								lpObj.m_ActState.Move = 1;
								lpObj.NextActionTime = 400;
								lpObj.Dir = this.GetPathPacketDirPos(lpTObj.getX() - lpObj.getX(), lpTObj.getY()-lpObj.getY());
								
								//lpObj.setXY(lpObj.MTX,lpObj.MTY,lpObj.Dir);
							}else{
								this.MonsterMoveAction(lpObj);
								lpObj.m_ActState.Emotion = 3;
								lpObj.m_ActState.EmotionCount = 10;
							}
						}else{
							this.MonsterMoveAction(lpObj);
							lpObj.m_ActState.Emotion = 3;
							lpObj.m_ActState.EmotionCount = 10;
						}
					}
				}

				break;

			case 3:

				if ( lpObj.m_ActState.EmotionCount > 0 ){
					lpObj.m_ActState.EmotionCount--;
				}else{
					lpObj.m_ActState.Emotion = 0;
				}

				lpObj.m_ActState.Move = 0;
				lpObj.m_ActState.Attack = 0;
				lpObj.NextActionTime = 400;

				break;
		}
	},
	GetPathPacketDirPos: function(px, py){
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
	},
	GetRandomLocation: function(lpObj){
		

		var iCount = 100;

		while ( iCount-- != 0)
		{
			cX = this.Rand2()%(10+1) * (((this.Rand2()%2==0)?-1:1)) + lpObj.getX();
			cY = this.Rand2()%(10+1) * (((!(this.Rand2()%2)))?-1:1) + lpObj.getY();

			var attr = lpObj.getWorld().GetAttr(cX, cY);

			if ( attr == 0 )
			{
				return {status: true,tpx: cX,tpy: cY};
			}
		}

		return {status: false};
	},
	MonsterMoveAction: function(lpObj){
	
		if ( lpObj.m_SkillHarden != 0 ){
			return;
		}

		if ( lpObj == undefined ){
			return;
		}

		if ( lpObj.getStatus() < 3 || lpObj.Type != 2){
			return;
		}

		var searchc = 10;
		var tpx;
		var tpy;

		lpObj.NextActionTime = 1000;

		while ( searchc-- != 0 )
		{
			var ret = this.GetRandomLocation(lpObj);

			// 124 86
			// 128 73
			
			//var x =this.Rand(124,128);
			//var y =this.Rand(73,86);  
			
			//lpObj.setXY(x,y);
			
			if ( ret.status != false ){
				
				
				if(lpObj.MoveCheck(ret.tpx,ret.tpy)){
				
					lpObj.TargetNumber = -1;
					lpObj.m_ActState.Attack = 0;
					lpObj.NextActionTime = lpObj.m_MoveSpeed;
					lpObj.m_ActState.Emotion = 0;
					lpObj.MTX = ret.tpx;
					lpObj.MTY = ret.tpy;
					lpObj.m_ActState.Move = 1;
					
					//lpObj.setXY(ret.tpx,ret.tpy);

					break;
				}
			}
		}
	}
}


exports.Init = function(E){ Engine = E; return ObjManagers;};