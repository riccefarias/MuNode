var net = require('net');

var Engine = {};


function ObjPlayer(sock,type){ 
	this.Type=((type==undefined)?1:type); // 1 = player , 2 = mob, 3 = npc
	
	this.objId = 0;
	this._sock = sock;
	this._accountId = 0;
	this._accountName = '';
	this._characterName = '';
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
	
	this._x = 0;
	this._y = 0;
	
	this._Dir = 0;
	this._PkLevel = 0;
	this._PkTime = 0;
	
	this.UpPoints = 0;
	
	this.Strength = 0;
	this.Agility = 0;
	this.Vitality = 0;
	this.Energy = 0;
	this.Command = 0;
	
	this._oldX = 0;
	this._olxY = 0;	
	
	this.pInventory = {};
	
	this.pTrade = {};
	
	this.m_InterfaceTime = 0;
	
	this.m_IfState = {use: 0,state: 0,type: 0};
	this.TargetNumber = -1;
	
	this.VpPlayer = {};
	this.VpPlayer2 = {};
	this.VpCount = 0;
	
	this.RegenOk = 0;
	
	this.m_iCurrentAI = 0;
	this.m_RecallMon = -1;
	
	this.Class = 0;
	this.CtlCode = 0;
	
	this.m_ViewSkillState = 0;
	
	this.CloseType  = -1;
	this.CloseCount = -1;
	
	this.WarehousePW = false;
	
	this.DieRegen = false;
	this.ChaosLock = false;
	
	this.m_bPShopOpen = false;
	this.m_ReqWarehouseOpen = false;
	
	this.m_Option = 0;
	
	this.Life =  100;
	
	
}

ObjPlayer.prototype.getWear = function(){
	var c = this.Class;
	var i = this.pInventory;
	
	console.log(i);
	
	return new Engine.Wear(c,i);
}

ObjPlayer.prototype.setItems = function(items){
	this.pInventory = items;
	//console.log(this.pInventory);
}

ObjPlayer.prototype.setChar = function(cData){
	this._characterName = cData.Name;
	this.cLevel 	= 		cData.cLevel;
	this.cExp 		= 		cData.Exp;
	
	this._PkLevel	=		cData.PkLevel;
	this._PkTime	=		cData.PkTime;
	
	this.Strength	=		cData.Str;
	this.Agility	=		cData.Agi;
	this.Vitality	=		cData.Vit;
	this.Energy		=		cData.Ene;
	this.Command	=		cData.Cmd;
	
	this.UpPoints	=		cData.UpPoints;
	this.CtlCode	=		cData.CtlCode;
	
	this.Class		=		cData.Class;
	
	
	
}

ObjPlayer.prototype.IsConnectedGP = function(){
	if (this.getObjId() < 0 || this.getObjId() > 7000 ){
		return false;
	}
	
	if (this.Type != 1 ){
		return false;
	}

	if ( this.getStatus() < 3 ){
		return false;
	}

	if ( this.CloseCount > 0 ){
		return false;
	}

	return true;
}

ObjPlayer.prototype.setGuild =function(gid,gs){
	this.lpGuild = gid;
	this.lpGuildStatus = gs;
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


ObjPlayer.prototype.InventoryMoveItem = function(source, target, durSsend, durTsend, sFlag, tFlag, siteminfo){
	
	var TempInventoryMap = {};
	var w,h;
	var iwidth,iheight;
	var blank;
	var s_num;


	var bPersonalShopTrans = 0;
	var bSourceIsPShop = 0;

	durSsend = 0;
	durTsend = 0;

	lpObj = this;

	var useClass = 0;
	
	if(sFlag == 2 || tFlag == 2){
		if(lpObj.m_IfState.type != 6){
				//LogAdd(lMsg.Get(531),lpObj->AccountID,lpObj->Name);
			return -1;
		}

		if(lpObj.m_IfState.state == 0){
				//LogAdd(lMsg.Get(531),lpObj->AccountID,lpObj->Name);
			return -1;
		}
	}

	switch(sFlag){
		case 0:
			if(source < 0 || source > 76){
				//LogAdd("error-L1 : %s %d",__FILE__,__LINE__);
				return -1;
			}

			if(lpObj.pInventory[source]==undefined){
				//LogAdd(lMsg.Get(532),lpObj->AccountID,lpObj->Name,__LINE__);
				return -1;
			}

			sitem = lpObj.pInventory[source];

			if(lpObj.getMap()== 10){
				if(source == 8){
					if((sitem.group == 13) && (sitem.index==3)){
						if(lpObj.pInventory[7]==undefined){
							return -1;
						}
					}else if(sitem.group == 13 && sitem.index==37){
						if(lpObj.pInventory[7] == undefined){
							return -1;
						}
					}
				}else if(source == 7){
					if((lpObj.pInventory[8].group != 13) && (lpObj.pInventory[8].index!=3))
					{
						return -1;
					}
				}
			}

			break;
		case 2:
			if(source < 0 || source > (120)){
				//LogAdd("error-L1 : %s %d",__FILE__,__LINE__);
				return -1;
			}

			if(lpObj.pWarehouse[source] == undefined){
				//LogAdd(lMsg.Get(532),lpObj->AccountID,lpObj->Name,__LINE__);
				return -1;
			}

			sitem = lpObj.pWarehouse[source];
			break;
		case 3:
		case 5:
		case 6:
		case 7:
		case 8:
		case 9:
			if(source < 0 || source > (32)){
				//LogAdd("error-L1 : %s %d",__FILE__,__LINE__);
				return -1;
			}

			if(lpObj.pChaosBox[source] == undefined){
				//LogAdd(lMsg.Get(532),lpObj->AccountID,lpObj->Name,__LINE__);
				return -1;
			}

			sitem = lpObj.pChaosBox[source];
			break;
		case 4:
			if(lpObj.m_bPShopOpen == true){
				return -1;
			}

			//EnterCriticalSection(&gObj[aIndex].m_critPShopTrade);

			if(lpObj.m_bPShopTransaction == 1){
				//LogAddTD("[PShop] [%s][%s] PShop Item Move Request Failed : Already Trade With Other",gObj[aIndex].AccountID,gObj[aIndex].Name);
				//LeaveCriticalSection(&lpObj->m_critPShopTrade);
				return -1;
			}

			lpObj.m_bPShopTransaction = 1;
			bPersonalShopTrans = 1;
			bSourceIsPShop = 1;

			//LeaveCriticalSection(&lpObj->m_critPShopTrade);

			if(source < 76 || source > (107)){
				//LogAdd("error-L1 : %s %d",__FILE__,__LINE__);
				return -1;
			}

			if(lpObj.pInventory[source] == undefined){
				//LogAdd(lMsg.Get(532),lpObj->AccountID,lpObj->Name,__LINE__);
				return -1;
			}

			sitem = lpObj.pInventory[source];

			break;
		default:
			return -1;
	}

	var level;
	var op1;
	var op2;
	var op3;
	var dur;
	var type;
	
	/*
		BufferItemtoConvert3(siteminfo,(int &)type,(BYTE &)level,(BYTE &)op1,(BYTE &)op2,(BYTE &)op3,(BYTE &)dur);

		if(sitem.m_Type != type || sitem.m_Level != level || sitem.m_Option1 != op1 || sitem.m_Option2 != op2 || sitem.m_Option3 != op3){
			//LogAddC(2,lMsg.Get(533),type,level,op1,op2,op3,sitem->m_Type,sitem->m_Level,sitem->m_Option1,sitem->m_Option2,sitem->m_Option3);
			return -1;
		}

		switch(tFlag){
		case 0:
			if(target < 0 || target > (75)){
				//LogAdd("error-L1 : %s %d",__FILE__,__LINE__);
				return -1;
			}

			titem = lpObj.pInventory[target];
			break;
		case 2:
			if(target < 0 || target > (119)){
				LogAdd("error-L1 : %s %d",__FILE__,__LINE__);
				return -1;
			}

			titem = lpObj.pWarehouse[target];
			break;
		case 3:
		case 5:
		case 6:
		case 7:
		case 8:
		case 9:
			if(target < 0 || target > (31)){
				//LogAdd("error-L1 : %s %d",__FILE__,__LINE__);
				return -1;
			}

			titem = lpObj.pChaosBox[target];

			if(sFlag == 0){
				if(tFlag == 5){
					if((sitem.group == 12 && sitem.index==15)	||
						(sitem.group == 14 && sitem.index==13) ||
						(sitem.group == 14 && sitem.index==14) ||
						(sitem.group == 14 && sitem.index==22) ||
						(sitem.group == 13 && sitem.index==31) ||
						(sitem.group == 14 && sitem.index==53)){

					}else{
						return -1;
					}
				}else if(tFlag == 6){
					//if(g_kJewelOfHarmonySystem.IsJewelOfHarmonyOriginal(sitem->m_Type) == 0){
					//	return -1;
					//}
				}else if(tFlag == 7){
					//if(g_kJewelOfHarmonySystem.IsEnableToMakeSmeltingStoneItem(sitem) == 0)	{
					//	GCServerMsgStringSend(lMsg.Get(3377),lpObj->m_Index,1);
					//	return -1;
					//}
				}else if(tFlag == 8){
					//if(g_kJewelOfHarmonySystem.IsStrengthenByJewelOfHarmony(sitem) == 0){
					//	return -1;
					//}
				}else if(tFlag == 9){
					if((sitem.group != 14 && sitem.index!=54)){
						return -1;
					}
				}else{
					if(sitem.level < 4 && sitem.m_Option3*4 < 4){
						if((sitem.group == 12 && sitem.index==15) || (sitem.group == 14 && sitem.index==13) ||
						    sitem.group == 14 && sitem.index==14) || (sitem.group == 14 && sitem.index==22) || 
							sitem.group == 13 && sitem.index==14)){
							
						}else if((sitem.group == 12 && sitem.index>=0) && (sitem.group==12 && sitem.index <= 2)){

						}else if((sitem.group == 14 && sitem.index==17) || (sitem.group == 14 && sitem.index==18)){

						}else if((sitem.group == 13 && sitem.index==2) && sitem.dur == 255){

						}else if((sitem.group == 13 && sitem.index==16) || (sitem.group == 13 && sitem.index == 17)){

						}else if((sitem.group == 14 && sitem.index==31)){

						}else if((sitem.group == 12 && sitem.index==26)){

						}else if(
							sitem.group == 13 && sitem.index==32) ||
							sitem.group == 13 && sitem.index==33) ||
							sitem.group == 13 && sitem.index==34) ||
							sitem.group == 13 && sitem.index==35) ||
							sitem.group == 13 && sitem.index==36) ||
							sitem.group == 13 && sitem.index==37) ||
							sitem.group == 14 && sitem.index==16)){

						}else if((sitem.group == 14 && sitem.index==3) || sitem.group == 14 && sitem.index==38) || sitem.group == 14 && sitem.index==39)){

						}else if(/*g_kJewelOfHarmonySystem.IsJewelOfHarmonyPurity(sitem->m_Type) == 1true){

						}else if((sitem.group == 14 && sitem.index==31)){

						}else if((sitem.group == 14 && sitem.index==53)){

						}else{
							return -1;
						}
					}else if((sitem.group == 14 && sitem.index==11)){
						return -1;
					}
				}
			}
			break;
		case 4:
			//if(gDoPShopOpen == 0){
			//	return -1;
			//}

			if(lpObj.m_bPShopOpen == true){
				return -1;
			}

			if((sitem.group == 14 && sitem.index==11) && sitem.level == 13){
				return -1;
			}

			if(/*g_kJewelOfHarmonySystem.IsStrengthenByJewelOfHarmony(sitem) == 1false){
				GCServerMsgStringSend(lMsg.Get(3367),lpObj.m_Index,1);
				return -1;
			}

			//if(IsCashItem(sitem->m_Type) == 1){
			//	return -1;
			//}

			if((sitem.group == 13 && sitem.index==38)){
				//GCServerMsgStringSend(lMsg.Get(3390),lpObj->m_Index,1);
				return -1;
			}

			if(sitem.group == 13 && sitem.index==39){
				return -1;
			}

			//EnterCriticalSection(&gObj[aIndex].m_critPShopTrade);

			if(lpObj.m_bPShopTransaction == 1){
				//if(bSourceIsPShop == 1){
					//lpObj.m_bPShopTransaction = 1;
					//bPersonalShopTrans = 1;
				//}else{
					//LogAddTD("[PShop] [%s][%s] PShop Item Move Request Failed : Already Trade With Other",gObj[aIndex].AccountID,gObj[aIndex].Name);
					//LeaveCriticalSection(&lpObj->m_critPShopTrade);
					//return -1;
				//}
			}else{
				lpObj.m_bPShopTransaction = 1;
				bPersonalShopTrans = 1;
			}


			if(target < 76 || target > (107)){
				//LogAdd("error-L1 : %s %d",__FILE__,__LINE__);
				return -1;
			}

			titem = lpObj.pInventory[target];

		break;
		default: 
			return -1;
	}

	s_num = sitem->GetNumber();

		if(gObjCheckSerial0ItemList(sitem)){
			MsgOutput(lpObj->m_Index,lMsg.Get(3354));
			LogAddTD("[ANTI-HACK][Serial 0 Item] [MoveItem] (%s)(%s) Item(%s) Pos(%d)",lpObj->AccountID,lpObj->Name,sitem->GetName(),source);
			return -1;
		}

		if(gObjInventorySearchSerialNumber(lpObj,s_num) == 0){
			return -1;
		}

		if(gObjWarehouseSearchSerialNumber(lpObj,s_num) == 0){
			return -1;
		}

		if(titem->IsItem() == 1){
			int max_count = 0;

			if(sitem->m_Type == ITEMGET(13,32) && titem->m_Durability < 20.0f){
				max_count = 20;
			}

			if(sitem->m_Type == ITEMGET(13,33) && titem->m_Durability < 20.0f){
				max_count = 20;
			}

			if(sitem->m_Type == ITEMGET(13,34) && titem->m_Durability < 10.0f){
				max_count = 10;
			}

			if(sitem->m_Type >= ITEMGET(14,35) || sitem->m_Type >= ITEMGET(14,36) || sitem->m_Type >= ITEMGET(14,37)){
				if(titem->m_Durability < 1.0f){
					max_count = 1;
				}
			}

			if(sitem->m_Type >= ITEMGET(14,46) && sitem->m_Type <= ITEMGET(14,50)){
				if(titem->m_Durability < 3.0f){
					max_count = 3;
				}
			}

			if(sitem->m_Type == ITEMGET(14,29))	{
				if(sitem->m_Level == titem->m_Level){
					max_count = 5;
				}
			}

			if(sitem->m_Type == ITEMGET(14,7)){
				if(titem->m_Durability < 250.0f){
					max_count = 250;
				}
			}else if(sitem->m_Type >= ITEMGET(14,0) && sitem->m_Type <= ITEMGET(14,8) || sitem->m_Type >= ITEMGET(14,38) && sitem->m_Type <= ITEMGET(14,40)){
				if(titem->m_Durability < 3.0f){
					max_count = 3;
				}
			}else if(sitem->m_Type == ITEMGET(4,15) || sitem->m_Type == ITEMGET(4,7)){
				if(titem->m_Durability < 255.0f){
					max_count = 255;
				}
			}

			if(max_count != 0){
				if(sFlag != 0){
					return -1;
				}

				if(titem->m_Type == sitem->m_Type && titem->m_Level == sitem->m_Level){
					int t_dur = titem->m_Durability;

					if(t_dur < max_count){
						int dif_dur = max_count - int(titem->m_Durability);

						if(dif_dur > sitem->m_Durability){
							dif_dur = sitem->m_Durability;
						}

						titem->m_Durability += dif_dur;
						sitem->m_Durability -= dif_dur;

						if(titem->m_Type == ITEMGET(14,29) && max_count <= titem->m_Durability){
							titem->m_Durability -= max_count;

							if(titem->m_Durability == 0){
								gObjInventoryItemSet(aIndex,target,255);
								gObj[aIndex].pInventory[target].Clear();
								GCInventoryItemDeleteSend(aIndex,target,1);
								durTsend = 0;
							}else{
								durTsend = 1;
							}

							ItemSerialCreateSend(aIndex,235,gObj[aIndex].X,gObj[aIndex].Y,ItemGetNumberMake(14,28),sitem->m_Level,0,0,0,0,aIndex,0,0);
						}

						if(sitem->m_Durability > 0){
							durSsend = 1;
							durTsend = 1;
						}else{
							switch(sFlag){
								case 0:
									gObjInventoryItemSet(lpObj->m_Index,source,255);
									sitem->Clear();
									GCInventoryItemDeleteSend(lpObj->m_Index,source,0);
									durTsend = 1;
								default:	return 0;
							}
						}
					}
				}
			}
			return -1;
		}

		switch(tFlag){
		case 0:
		case 4:
			if(target < INVETORY_WEAR_SIZE){
				if(lpObj->MapNumber == MAP_INDEX_ICARUS){
					if(target == 10){
						if(lpObj->pInventory[source].m_Type == ITEMGET(13,10)){
							return -1;
						}
					}else if(target == 11){
						if(lpObj->pInventory[source].m_Type == ITEMGET(13,10)){
							return -1;
						}
					}
				}

				if(target < INVETORY_WEAR_SIZE){
					if(lpObj->MapNumber == MAP_INDEX_ICARUS || lpObj->MapNumber == MAP_INDEX_KANTURU_BOSS){
						if(target == 10){
							if(lpObj->pInventory[source].m_Type == ITEMGET(13,39) ||
								lpObj->pInventory[source].m_Type == ITEMGET(13,10)){
								return -1;
							}
						}else if(target == 11){
							if(lpObj->pInventory[source].m_Type == ITEMGET(13,39) ||
								lpObj->pInventory[source].m_Type == ITEMGET(13,10)){
								return -1;
							}
						}
					}
				}

				useClass = sitem->IsClass(lpObj->Class,lpObj->ChangeUP);

				if(useClass == 0){
					return -1;
				}

				if(gObjIsItemPut(lpObj,sitem,target) == 0){
					return -1;
				}
			}else {
				if(target >= MAIN_INVENTORY_SIZE){
					if(lpObj->pInventory[source].m_Type == ITEMGET(12,26)){
						if(lpObj->pInventory[source].m_Level == 1 ||
							lpObj->pInventory[source].m_Level == 2 ||
							lpObj->pInventory[source].m_Level == 3 ||
							lpObj->pInventory[source].m_Level == 4 ||
							lpObj->pInventory[source].m_Level == 5){
							return -1;
						}
					}	
				}

				w = (target - INVETORY_WEAR_SIZE)%8;
				h = (target - INVETORY_WEAR_SIZE)/8;

				if(ExtentCheck(w,h,8,12) == 0){
					return -1;
				}

				sitem->GetSize((int &)iwidth,(int &)iheight);
				memcpy(TempInventoryMap,lpObj->pInventoryMap,64);

				switch(sFlag){
					case 0:
					case 4:
						if(source > (INVETORY_WEAR_SIZE - 1))
						{
							gObjInventoryItemBoxSet(lpObj->m_Index,source,iwidth,iheight,255);
						}
						break;
					default: break;
				}
			
				if(*(BYTE*)(gObj[aIndex].pInventoryMap + h * 8 + w) != 255){
					memcpy(lpObj->pInventoryMap,TempInventoryMap,64);
					return -1;
				}

				blank = gObjInventoryRectCheck(lpObj->m_Index,w,h,iwidth,iheight);

				if(blank >= 254){
					memcpy(lpObj->pInventoryMap,TempInventoryMap,64);
					return -1;
				}
			}

			s_num = sitem->GetNumber();
			titem = sitem;

			switch(sFlag){
				case 0:
				case 4:
					lpObj->pInventory[target] = lpObj->pInventory[source];
					gObjInventoryDeleteItem(aIndex,source);
					break;
				case 2:
					lpObj->pInventory[target] = lpObj->pWarehouse[source];
					gObjWarehouseDeleteItem(aIndex,source);
					break;
				case 3:
				case 5:
				case 6:
				case 7:
				case 8:
				case 9:
					lpObj->pInventory[target] = lpObj->pChaosBox[source];
					gObjChaosBoxDeleteItem(aIndex,source);
					break;
				default : break;
			}

			if(target > (INVETORY_WEAR_SIZE - 1)){
				gObjInventoryItemSet(aIndex,target,1);
			}

				if(target < INVETORY_WEAR_SIZE){
					CItem * lpItem = &lpObj->pInventory[target];
					if(lpItem->m_Option1){
						int s_pos = gObjWeaponMagicAdd(&gObj[aIndex],lpItem->m_Special[0],lpItem->m_Level);
						if(s_pos >= 0){
							GCMagicListOneSend(aIndex,s_pos,lpItem->m_Special[0],lpItem->m_Level,0,0);
						}
					}
				}
			break;
		case 2:
			BYTE res_1;
				switch(sFlag){
				case 0:
					if(lpObj->pInventory[source].m_Type == ITEMGET(13,20)){
						if(lpObj->pInventory[source].m_Level == 0 ||
							lpObj->pInventory[source].m_Level == 1){
							return -1;
						}
					}

					if(lpObj->pInventory[source].m_Type == ITEMGET(14,11)){
						if(lpObj->pInventory[source].m_Level == 13)	{
							return -1;
						}
					}

					if(lpObj->pInventory[source].m_Type == ITEMGET(12,26)){
						if(lpObj->pInventory[source].m_Level == 1 ||
							lpObj->pInventory[source].m_Level == 2 ||
							lpObj->pInventory[source].m_Level == 3 ||
							lpObj->pInventory[source].m_Level == 4 ||
							lpObj->pInventory[source].m_Level == 5)	{
							return -1;
						}
					}

					if(lpObj->pInventory[source].m_Type == ITEMGET(13,39)){
						return -1;
					}

					res_1 = gObjWarehouseInsertItemPos(aIndex,lpObj->pInventory[source],target,-1);
					break;
				case 2:
					res_1 = gObjWarehouseInsertItemPos(aIndex,lpObj->pWarehouse[source],target,source);
					break;
				default : break;
				}

				if(res_1 == 255){
					return -1;
				}

				switch(sFlag){
				case 0:
					lpObj->pWarehouse[target] = lpObj->pInventory[source];
					gObjInventoryDeleteItem(aIndex,source);
					break;
				case 2:
					lpObj->pWarehouse[target] = lpObj->pWarehouse[source];
					gObjWarehouseDeleteItem(aIndex,source);
					break;
				default : break;
				}

				gObjWarehouseItemSet(aIndex,target,1);

				if(sFlag == 0){
					if(source < INVETORY_WEAR_SIZE){
						if(source == 10 || source == 11){
							if(lpObj->pWarehouse[target].m_Type == ITEMGET(13,10)){
								gObjUseSkill.SkillChangeUse(aIndex);
							}
						}

						gObjMakePreviewCharSet(aIndex);
						GCEquipmentChange(aIndex,source);
					}
				}
			return 2;
		case 3:
		case 5:
		case 6:
		case 7:
		case 8:
		case 9:
			BYTE res_2;
				switch(sFlag){
				case 0:
					res_2 = gObjChaosBoxInsertItemPos(aIndex,lpObj->pInventory[source],target,-1);
					break;
				case 3:
				case 5:
				case 6:
				case 7:
				case 8:
				case 9:

					res_2 = gObjChaosBoxInsertItemPos(aIndex,lpObj->pChaosBox[source],target,source);
					break;
				default : break;
				}

				if(res_2 == 255){
					return -1;
				}

				switch(sFlag){
				case 0:
					lpObj->pChaosBox[target] = lpObj->pInventory[source];
					gObjInventoryDeleteItem(aIndex,source);
					break;
				case 3:
				case 5:
				case 6:
				case 7:
				case 8:
				case 9:

					lpObj->pChaosBox[target] = lpObj->pChaosBox[source];
					gObjChaosBoxDeleteItem(aIndex,source);
					break;
				default : break;
				}

				gObjChaosItemSet(aIndex,target,1);

				if(sFlag == 0){
					if(source < INVETORY_WEAR_SIZE){
						if(source == 10 || source == 11){
							if(lpObj->pChaosBox[target].m_Type == ITEMGET(13,10)){
								gObjUseSkill.SkillChangeUse(aIndex);
							}

							if(lpObj->pChaosBox[target].m_Type == ITEMGET(13,39)){
								gObjUseSkill.SkillChangeUse(aIndex);
							}
						}

						gObjMakePreviewCharSet(aIndex);
						GCEquipmentChange(aIndex,source);
					}
				}
			return tFlag;
		default: break;
		}

		if(sFlag == 0 && source < INVETORY_WEAR_SIZE){
			if(lpObj->pInventory[source].IsItem() == 1)	{
				if(lpObj->pInventory[source].m_Type == ITEMGET(13,10)){
					gObjUseSkill.SkillChangeUse(aIndex);
					LogAdd(lMsg.Get(534),gObj[aIndex].Name,lpObj->pInventory[source].m_Level);
				}

				if(lpObj->pInventory[source].m_Type == ITEMGET(13,39)){
					gObjUseSkill.SkillChangeUse(aIndex);
					LogAdd(lMsg.Get(534),gObj[aIndex].Name,lpObj->pInventory[source].m_Level);
				}
			}else{
				if(source == 10 || source == 11){
					if(lpObj->pInventory[target].m_Type == ITEMGET(13,10)){
						gObjUseSkill.SkillChangeUse(aIndex);
					}

					if(lpObj->pInventory[target].m_Type == ITEMGET(13,39)){
						gObjUseSkill.SkillChangeUse(aIndex);
					}
				}
			}

			gObjMakePreviewCharSet(aIndex);
			GCEquipmentChange(aIndex,source);
		}

		if(tFlag == 0 && target < INVETORY_WEAR_SIZE){
			if(lpObj->pInventory[target].m_Type == ITEMGET(13,10)){
				gObjUseSkill.SkillChangeUse(aIndex);
				LogAdd(lMsg.Get(534),gObj[aIndex].Name,lpObj->pInventory[target].m_Level);
			}

			if(lpObj->pInventory[target].m_Type == ITEMGET(13,39)){
				gObjUseSkill.SkillChangeUse(aIndex);
				LogAdd(lMsg.Get(534),gObj[aIndex].Name,lpObj->pInventory[target].m_Level);
			}

			gObjMakePreviewCharSet(aIndex);
			GCEquipmentChange(aIndex,target);
		}
	
	return -1;*/
}


exports.Init = function(E){ Engine = E; return ObjPlayer; }