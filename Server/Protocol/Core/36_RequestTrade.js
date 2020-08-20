

var Engine = {};



var ProtoCore = {
	Code: 0x36,
	Proccess: function(aIndex,data){
		
				
			var me = Engine['ObjectManager'].get(aIndex);
				
			
			var pId  = data[2];
				pId |= (data[1] << 8);
				
				
				
			//if (bCanTrade == FALSE){
			//	::GCServerMsgStringSend(lMsg.Get(MSGGET(4, 125)), aIndex, 1);
			//	::GCServerMsgStringSend(lMsg.Get(MSGGET(4, 126)), aIndex, 1);
			//	return;
			//}

			if ( me.CloseType != -1 ){
				return;
			}

			//if ( !PacketCheckTime(lpObj))
			//	return;


			if (pId<0 || pId > 7000){
				//LogAdd("error : %s %d (%d)", __FILE__, __LINE__, number);
				return;
			}

			if ( pId == aIndex ){
				return;
			}

			
			lpTrade = Engine['ObjectManager'].get(pId);
			if ( lpTrade.getStatus()!=3){
				return;
			}

			if ( lpTrade.Type == 2 ){
				return;
			}

			if ( lpTrade.CloseCount >= 0 ){
				return;
			}

			if ( Engine['Config'].DS_MAP_RANGE(lpTrade.getMap()) != false ){
				//::GCServerMsgStringSend(lMsg.Get(MSGGET(2, 199)), aIndex, 1);
				return;
			}

			if ( me.m_bPShopOpen == true ){
				return;
			}

			if ( lpTrade.m_bPShopOpen == true ){
				return;
			}

			if ( Engine['Config'].CC_MAP_RANGE(lpTrade.getMap()) != false ){
				//::GCServerMsgStringSend(lMsg.Get(MSGGET(4, 196)), aIndex, 1);
				return;
			}

			if ( Engine['Config'].BC_MAP_RANGE(lpTrade.getMap()) != false ){
				//if ( g_BloodCastle.GetCurrentState(gObj[aIndex].MapNumber-MAP_INDEX_BLOODCASTLE1) != 1 || g_BloodCastle.CheckCanEnter(gObj[aIndex].MapNumber-MAP_INDEX_BLOODCASTLE1) == false )
				//{
				//	::GCServerMsgStringSend(lMsg.Get(MSGGET(4, 188)), aIndex, 1);
				//	return;
				//}	
			}

			if ( (lpTrade.m_Option &1) != 1 ){
				//::GCTradeResponseSend(0, aIndex, gObj[number].Name, 0, 0);
				//return;
			}

			if ( me.m_IfState.use > 0 ){
				//::GCTradeResponseSend(3, aIndex, gObj[number].Name, 0, 0);
				return;
			}

			if (lpTrade.m_IfState.use > 0 ){
				Engine['Protocol'].getCore(0x37).TradeResponseSend(2, aIndex, gObj[number].Name, 0, 0);
				return;
			}

			//if ( ::gObjFixInventoryPointer(aIndex) == false ){
			//	LogAdd("[Fix Inv.Ptr] False Location - %s, %d", __FILE__, __LINE__);
			//}

			//if ( gObj[aIndex].pTransaction == 1 ){
			//	LogAddTD("[%s][%s] CGTradeRequestSend() Failed : Transaction == 1, IF_TYPE : %d",
			//		gObj[aIndex].AccountID, gObj[aIndex].Name, gObj[aIndex].m_IfState.type);
			///
			//	return;
			//}

			me.m_IfState.use = 1;
			me.m_IfState.state = 0;
			me.m_IfState.type = 1;
			me.TargetNumber = pId;
			
			lpTrade.m_IfState.use = 1;
			lpTrade.m_IfState.state = 0;
			lpTrade.m_IfState.type = 1;
			lpTrade.TargetNumber = aIndex;
			
			me.m_InterfaceTime = new Date().getTime();
			lpTrade.m_InterfaceTime = new Date().getTime();
				
			var name = new Buffer(10);
				name.fill(0x00,0,10);
				name.write(me.getName());
					
				
			var response = Buffer.concat([new Buffer([0xC3,(13),0x36]),name]);
					
			Engine.ObjectManager.DataSend(pId,response);
					
				//console.log("Trade on: "+pId);
			
	}
}

exports.Init = function(E){ Engine = E; return ProtoCore; };