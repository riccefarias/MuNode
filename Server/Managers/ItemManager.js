
var Engine = {};




var TMItems= {
	NewOptionRand: function(level){
		var NOption = 0;
		NOption = 1 << (Engine['MonsterAI'].Rand2() % 6);

		if ( (NOption &2) != 0 )
		{
			if ( (Engine['MonsterAI'].Rand2()%2) != 0 )
			{
				NOption = 1 << (Engine['MonsterAI'].Rand2()%6);
			}
		}

		if ( (Engine['MonsterAI'].Rand2()% 4) == 0 )
		{
			NOption |= 1 << (Engine['MonsterAI'].Rand2()%6);
		}

		return NOption;
	},
	ItemGetDurability: function(index, itemLevel, ExcellentItem, SetItem){

		if ( index == this.ItemGetNumberMake(14,21) && itemLevel == 3 )	// Mark Lord
			itemLevel=0;
		
		if ( index == this.ItemGetNumberMake(14,29) )
			return 1;

		var dur=150;
		/*
		if ( itemLevel < 5)
		{
			dur= ItemAttribute[index].Durability + itemLevel;
		}
		else if ( itemLevel >= 5 )
		{
			if ( itemLevel == 10 )
			{
				dur=ItemAttribute[index].Durability + itemLevel*2-3;
			}
			else if (itemLevel == 11 )
			{
				dur=ItemAttribute[index].Durability + itemLevel*2-1;
			}
			else if (itemLevel == 12 )
			{
				dur=ItemAttribute[index].Durability + itemLevel*2+2;
			}
			else if (itemLevel == 13 )
			{
				dur=ItemAttribute[index].Durability + itemLevel*2+6;
			}
			else
			{
				dur=ItemAttribute[index].Durability + itemLevel*2-4;
			}
		}*/
		
		if ( (index < this.ItemGetNumberMake(12,3) || index > this.ItemGetNumberMake(12,6) ) &&
			  index != this.ItemGetNumberMake(0,19) &&
			  index != this.ItemGetNumberMake(4,18) &&
			  index != this.ItemGetNumberMake(5,10) &&
			  index != this.ItemGetNumberMake(2,13) &&
			  index != this.ItemGetNumberMake(13,30) )
		{
			if ( SetItem != 0 )
				dur +=20;
			else if ( ExcellentItem != 0 ) // Prevent duple if items
				dur +=15;
		}

		if ( dur > 255 )
			dur = 255;

		return dur;
	},
	GetItem: function(monsterlevel){
		if ( monsterlevel > 150 || monsterlevel < 0 ){
			return undefined;
		}

		//var itemcount = this->m_iMonsterInvenItemCount[monsterlevel];

		if ( itemcount <= 0 )
		{
			return undefined;
		}

		//var itemindex = Engine['MonsterAI'].Rand2() % itemcount;
		//return &this->m_MonsterInvenItems[monsterlevel][itemindex];
		return new Engine.Item(5,11,13,255,0,0,0,false,12345);
	},
	ItemGetNumberMake: function(type,index){
		var make;

		make = type*512 + index;

		//if (ItemAttribute[make].Width < 1 ||  ItemAttribute[make].Height < 1)
		//{
		//	return -1;
		//}
		return make;
	},
	MakeRewardSetItem: function(aIndex, cDropX, cDropY, iRewardType, iMapnumber){
		var itemnum = gSetItemOption.GenRandomItemNum();

		var SetOption = gSetItemOption.GenSetOption(itemnum);

		var option1rand;
		var option2rand;
		var option3rand;
		var optionc;
		var Option1 = 0;
		var Option2 = 0;
		var Option3 = 0;

		option1rand = 6;
		option2rand = 4;

		option3rand = Engine['MonsterAI'].Rand2()%100;
		optionc = Engine['MonsterAI'].Rand2()%3;

		if(Engine['MonsterAI'].Rand2()%100 < option2rand){
			Option2 = 1;
		}

		switch(optionc){
			case 0: 
				if(option3rand < 4){
					Option3 = 3;
				}
				break;
			case 1:
				if(option3rand < 8){
					Option3 = 2;
				}
				break;
			case 2: 
				if(option3rand < 12){
					Option3 = 1;
				}
				break;
			default: break;
		}

		Option1 = 1;

		if(cDropX == 0 && cDropY == 0){
			gObj = Engine['ObjectManager'].get(aIndex);
			
			cDropX = gObj.getX();
			cDropY = gObj.getY();
		}

		this.ItemSerialCreateSend(aIndex,iMapnumber,cDropX,cDropY,itemnum,0,0,Option1,Option2,Option3,aIndex,0,SetOption);

		if(iRewardType == 1){
			///LogAddTD("[★☆Reward][KUNDUN] [%s][%s] Set Item itemnum:[%d] skill:[%d] luck:[%d] option:[%d] SetOption:[%d]",
			//	gObj[aIndex].AccountID,gObj[aIndex].Name,itemnum,Option1,Option2,Option3,SetOption);
		}else{
			//LogAddTD("[Reward][Etc] [%s][%s] Set Item itemnum:[%d] skill:[%d] luck:[%d] option:[%d] SetOption:[%d]",
			//	gObj[aIndex].AccountID,gObj[aIndex].Name,itemnum,Option1,Option2,Option3,SetOption);
		}		
	},
	ItemSerialCreateSend: function(aIndex, MapNumber, x, y, type, level, dur, Op1, Op2, Op3, LootIndex, NewOption, SetOption){
		

		if (dur == 0 ){
			//dur = ItemGetDurability(type, level, NewOption, SetOption);
		}

	

		

		if ( MapNumber != -1){
			if ( MapNumber < 0 || (MapNumber > 60 && MapNumber < 235) ){
				return;
			}
		}

		if ( MapNumber == -1 || MapNumber == -2 ){
			if ( gObjIsConnectedGP(aIndex) == FALSE ){
				//LogAddC(2, "error-L3 [%s][%d]", __FILE__, __LINE__);
				return;
			}
			

			gObj = Engine['ObjectManager'].get(aIndex);

			if ( MapNumber == -2 ){
				if ( gObj.m_IfState.type != 13 ){
					//LogAdd("error-L2: DarkTrainerBox not used.");
					return;
				}
			}else if ( gObj.m_IfState.type != 7 ){
				//LogAdd("error-L2: ChaosBox not used.");
				return;
			}
			/*
			Chaos Mix
				
			PMSG_CHAOSMIXRESULT pMsg;

			pMsg.h.c = 0xC1;
			pMsg.h.headcode = 0x86;
			pMsg.h.size = sizeof(PMSG_CHAOSMIXRESULT);

			if ( lpMsg->MapNumber == (BYTE)-2 )
			{
				pMsg.Result = 100;
			}
			else
			{
				pMsg.Result = 1;
			}

			CItem NewItem;

			NewItem.m_Level = lpMsg->Level;
			NewItem.m_Durability = ItemGetDurability(lpMsg->Type, lpMsg->Level, lpMsg->NewOption, lpMsg->SetOption);

			if ( lpMsg->Type == ITEMGET(14,7) ) // Siege Potion
			{
				NewItem.m_Durability = lpMsg->Dur;
			}

			if ( lpMsg->Type == ITEMGET(13,37) )
			{
				NewItem.m_Durability = lpMsg->Dur;
			}

			NewItem.Convert(lpMsg->Type,lpMsg->Op1, lpMsg->Op2, lpMsg->Op3,lpMsg->NewOption, lpMsg->SetOption,0, CURRENT_DB_VERSION);
			ItemByteConvert(pMsg.ItemInfo, NewItem);
			NewItem.m_Number = lpMsg->m_Number;
			ChaosBoxInit(lpObj);
			gObjChaosBoxInsertItemPos(aIndex, NewItem, 0, -1);
			gObjChaosItemSet(aIndex, 0, 1);
			BYTE ExOption[MAX_EXOPTION_SIZE];
			ItemIsBufExOption(ExOption, &NewItem);

			LogAddTD("[%s][%s] CBMix Item Create Item:%s [%d][%d] [%d][%d][%d][%d] Ex:[%d,%d,%d,%d,%d,%d,%d] Set:[%d]",
				lpObj->AccountID, lpObj->Name, NewItem.GetName(), lpMsg->m_Number, lpMsg->Dur, NewItem.m_Level, 
				NewItem.m_Option1, NewItem.m_Option2, NewItem.m_Option3, ExOption[0], ExOption[1],
				ExOption[2], ExOption[3], ExOption[4], ExOption[5], ExOption[6], lpMsg->SetOption);

			DataSend(aIndex, (LPBYTE)&pMsg, pMsg.h.size);
			gObj[aIndex].ChaosLock = FALSE;
			*/
			return;
		}

		if ( MapNumber == 235 ){
			if ( gObj.getStatus() > 2 ){
				var iType  = type/512;
				var iTypeIndex = type%512;

				var iItemPos = this.InventoryInsertItem(gObj, iType, iTypeIndex, level, 0, dur);

				if ( iItemPos == -1 ){
					//LogAddTD("[Mu_2Anv_Event] Error : Failed To Gift Item Type:%d, TypeIndex:%d to [%s][%s]",
					//	iType, iTypeIndex, gObj[lpMsg->aIndex].AccountID, gObj[lpMsg->aIndex].Name);
				}else{
					Engine['Protocol'].GCInventoryItemOneSend(aIndex, iItemPos);
				}
			}
		}else if ( MapNumber == 236 ){
			if ( gObj.getStatus() > 2 ){
				var pCreateItem = new Engine.Item((type/512),(type%512),level,dur,0,0,0,false,iSerial);
				
				//pCreateItem.Convert(ITEMGET(iItemType, iItemIndex), lpMsg->Op1, lpMsg->Op2,
				//	lpMsg->Op3, lpMsg->NewOption, lpMsg->SetOption, 0, 3);
				
				
				var btItemPos = this.InventoryInsertItem2(gObj, pCreateItem);

				if ( btItemPos == -1 ){
					//LogAddTD("[CashShop] Error : Failed To Insert Item Type:%d, TypeIndex:%d to [%s][%s]",
					//	iItemType, iItemIndex, gObj[lpMsg->aIndex].AccountID, gObj[lpMsg->aIndex].Name);
				}else{
					Engine['Protocol'].GCInventoryItemOneSend(aIndex, btItemPos);
				}
			}
		}else{
			var iRetMapNumber = MapNumber;

			if ( MapNumber >= 238 && MapNumber <= 244 ){
				mapnumber -= 227;
			}

			if ( MapNumber >= 247 && MapNumber <= 253 ){
				mapnumber -= 236;
			}

			var iItemCount = Engine['ObjectManager'].getMap(mapnumber).MonsterItemDrop(type, level, dur, x, y,Op1, Op2, Op3, 
																					NewOption, SetOption,LootIndex, 0, 0);

			if ( iItemCount != -1 ){
				if ( iRetMapNumber >= 238 && iRetMapNumber <= 244){
					Engine['ObjectManager'].getMap(mapnumber).itmInMap[iItemCount].m_Time = new Date().getTime() + 300000;
					Engine['ObjectManager'].getMap(mapnumber).itmInMap[iItemCount].m_LootTime = new Date().getTime() + 20000;

				}

				if ( iRetMapNumber >= 247 && iRetMapNumber <= 253){
					Engine['ObjectManager'].getMap(mapnumber).itmInMap[iItemCount].m_Time = new Date().getTime() + 900000;
					Engine['ObjectManager'].getMap(mapnumber).itmInMap[iItemCount].m_LootTime = new Date().getTime() + 10000;
					//g_BloodCastle.m_BridgeData[iRetMapNumber-247].m_nBC_QUESTITEM_SERIAL = lpMsg->m_Number;
				}
			}

		}
	},
	InventoryInsertItem: function(lpObj,type,index,level,iSerial,iDur){
		var item = new Engine.Item(type,index,level,iDur,0,0,0,false,iSerial);
		
		var w,h,iwidth,iheight;
		var blank = 0;

		


		for(h = 0; h < 8; h++){
			for(w = 0; w < 8; w++){
				if((lpObj.pInventory[h*8+w]) == undefined){
					blank = this.InventoryRectCheck(lpObj.getObjId(),w,h,iwidth,iheight);

					if(blank == 254){
						
						return -1;
						//goto GOTO_EndFunc;
					}

					if(blank != 255){
						lpObj.pInventory[blank] = item;
						//lpObj.pInventory[blank].m_Number = iSerial;
						//gPlusItemNumber();

						//gObjInventoryItemSet(lpObj->m_Index,blank,lpObj->pInventory[blank].m_Type);
						return blank;
					}
				}
			}
		}
		//GOTO_EndFunc:
		return -1;
	},
	InventoryRectCheck: function(aIndex, sx, sy, width, height){
		var x,y;
		var blank = 0;

		if(sx + width > 8){
			return -1;
		}

		if(sy + height > 12){
			return -2;
		}

		var xx,yy;

		for(y = 0; y < height; y ++){

			yy = sy+y;

			for(x = 0; x < width; x++){
				xx = sx + x;

				if(this.ExtentCheck(xx,yy,8,12)==1){
					var gObj = Engine['ObjectManager'].get(aIndex);
					if(gObj.pInventory[(sy+y)*8+(sx+x)] != undefined){
						blank += 1;
						return -1;
					}
				}else{
					//LogAdd("error : %s %d",__FILE__,__LINE__);
					return -1;
				}
			}
		}

		if(blank == 0){
			return sx+sy*8+12;
		}
		return  -1;
	},
	ExtentCheck: function(x, y, w, h){
		if ( (x >=0) && (x<w) && (y >=0) && (y<h) )
		{
			return 1;
		}
		return 0;
	}
}


exports.Init = function(E){ Engine = E; return TMItems;}