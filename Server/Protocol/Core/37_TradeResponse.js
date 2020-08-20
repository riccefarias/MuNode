

var Engine = {};



var ProtoCore = {
	Code: 0x37,
	TradeResponseSend: function(response, aIndex, id, level, GuildNumber){
		
		
		
		
		var name = new Buffer(10);
			name.fill(0x00,0,10);
			name.write(id);

		
		
		var response = Buffer.concat([new Buffer([0xC1,(20),0x37,((response==true)?0x01:0x00)]),name,(level >> 8),(level),(GuildNumber >> 24),(GuildNumber >> 16),(GuildNumber >> 8),(GuildNumber)]);
					
		Engine.ObjectManager.DataSend(aIndex,response);
				
		//return DataSend(aIndex, (LPBYTE)&pMsg, pMsg.h.size);
	},
	Proccess: function(aIndex,data){
		
				
		var me = Engine['ObjectManager'].get(aIndex);
		
		var Response = ((data[1]==0x01)?true:false);
		
		var Result = true;
		var lpTrade = Engine['ObjectManager'].get(me.TargetNumber);

		if (aIndex<0 || aIndex> 7000 ){
			//LogAdd("error-L1 : %d (A_ID:%s) %s %d", number, gObj[aIndex].AccountID, __FILE__, __LINE__);
			Result = false;
			Response = false;
		}

		if (me.TargetNumber < 0 || me.TargetNumber > 7000 ){
			if ( me.m_IfState.use != 0 ){
				if ( me.m_IfState.type == 1 ){
					me.m_IfState.use = 0;
					me.TargetNumber = -1;
				}
			}

			//LogAdd("error-L1 : target:%d (A_ID:%s) %s %d", number, gObj[aIndex].AccountID, __FILE__, __LINE__);
			Result = false;
			Response = false;
		}

		if (lpTrade.getStatus() != 3){
			Result = false;
			Response = false;
		}
		
		if ( me.CloseType != -1 ){
			Result = false;
			Response = false;
		}

		if ( me.m_bPShopOpen == true ){
			Result = FALSE;
			Response = false;
		}

		if ( lpTrade.m_bPShopOpen == true ){
			Result = false;
			Response = false;
		}

		if ( me.getX() < (lpTrade.getX() -2 ) || me.getX() > (lpTrade.getX() +2 ) || me.getY() < (lpTrade.getY() -2 ) || me.getY() > (lpTrade.getY() +2 ) ){
			Result = false;
			Response = false;
		}

		if ( me.m_IfState.use == 0 || me.m_IfState.type != 1 || me.m_IfState.state != 0 ){
			//LogAddTD("(%s)(%s) Trade Interface State Error : use:%d type:%d", gObj[aIndex].AccountID, gObj[aIndex].Name, 
			//	gObj[aIndex].m_IfState.use, gObj[aIndex].m_IfState.type);

			return;
		}

		if ( lpTrade.m_IfState.use == 0 || lpTrade.m_IfState.type != 1 || lpTrade.m_IfState.state != 0 ){
			//LogAddTD("(%s)(%s) Trade Interface State Error : use:%d type:%d", gObj[number].AccountID, gObj[number].Name, 
			//	gObj[number].m_IfState.use, gObj[number].m_IfState.type);

			return;
		}

		//if ( gObjFixInventoryPointer(aIndex) == false ){
		//	LogAdd("[Fix Inv.Ptr] False Location - %s, %d", __FILE__, __LINE__);
		//}

		//if ( gObj[aIndex].pTransaction == 1 ){
			//LogAddTD("[%s][%s] CGTradeResponseRecv() Failed : Transaction == 1, IF_TYPE : %d",
			///	gObj[aIndex].AccountID, gObj[aIndex].Name, gObj[aIndex].m_IfState.type);

		//	return;
		//}

		if (Response == false ){
			this.TradeResponseSend(Response, lpTrade.getObjId(), me.getName(), 0, 0);
			Result = false;
		}else{
			Result = true;

			//for ( int i=0;i<TRADE_BOX_SIZE;i++)
			//{
				me.pTrade = {};
				lpTrade.pTrade = {};
			//}

			me.m_IfState.state = 1;
			lpTrade.m_IfState.state = 1;
			me.TradeMoney = 0;
			lpTrade.TradeMoney = 0;

			//if (::gObjInventoryTrans(aIndex) == FALSE )
			//	Result = 2;

			//if (::gObjInventoryTrans(number) == FALSE )
			//	Result = 3;

			if ( Result != true ){
				Response = false;
				this.TradeResponseSend(Response, lpTrade.getObjId(), me.getName(), 0, 0);
				this.TradeResponseSend(Response, me.getObjId(), lpTrade.getName(), 0, 0);

				Result = false;
			}else{
				Response = true;
				this.TradeResponseSend(Response, lpTrade.getObjId(), me.getName(), me.cLevel, me.lpGuild);
				this.TradeResponseSend(Response, me.getObjId(), lpTrade.getName(), lpTrade.cLevel, lpTrade.lpGuild);

			}
		}

		if ( Result == false ){
			if ( me.m_IfState.use != 0 && me.m_IfState.type == 1 ){
				me.m_IfState.use = 0;
				me.TargetNumber = -1;
				//LogAddTD("Interface State : %d", gObj[aIndex].m_IfState.use);
			}

			if ( lpTrade.TargetNumber == aIndex ){
				if ( lpTrade.m_IfState.use != 0 && lpTrade.m_IfState.type == 1 ){
					lpTrade.m_IfState.use = 0;
					lpTrade.TargetNumber = -1;
					//LogAddTD("Interface State : %d", gObj[number].m_IfState.use);
				}
			}
		}	
				//console.log("Trade on: "+pId);
			
	}
}

exports.Init = function(E){ Engine = E; return ProtoCore; };