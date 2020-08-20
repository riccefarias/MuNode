

var Engine = {};



var ProtoCore = {
	Code: 0x24,
	Proccess: function(aIndex,data){
		console.log("Mode Item:");
		console.log(data);
		var sFlag = data[1];
		var sPos  = data[2];
		
		var ItemInfo = new Buffer([data[3],data[4],data[5],data[6],data[7],data[8],data[9]]);
		
		var tFlag = data[10];
		var tPos  = data[11];
				
		var me = Engine['ObjectManager'].get(aIndex);
				
			
			
		var result;

		//if ( !PacketCheckTime(&gObj[aIndex]))
		//{
		//	::GCItemMoveResultSend(aIndex, -1, 0, ItemInfo);
		//	return;
		//}

		if ( !me.IsConnectedGP()){
			//LogAddC(2,"[%s][%d] error-L3", __FILE__, __LINE__);
			Engine['Protocol'].ItemMoveResultSend(aIndex, -1, 0, ItemInfo);
			return;
		}

		var it_type = 0;

		if ( me.m_ReqWarehouseOpen != false ){
			//LogAddC(2,"[%s][%d] error-L3", __FILE__, __LINE__);
			Engine['Protocol'].ItemMoveResultSend(aIndex, -1, 0, ItemInfo);
			return;
		}


		if ( tFlag == 2 || sFlag == 2 ){
			it_type = 6;
		}
		
		if ( tFlag == 0 && sFlag == 0 ){
			it_type = 8;
		}

		if ( (tFlag == 0 && sFlag == 4) ||
			 (tFlag == 4 && sFlag == 0) ||
			 (tFlag == 4 && sFlag == 4) ){
				it_type = 8;
		}

		//if (::gObjCanItemTouch(lpObj, it_type) == FALSE){
		//	if ( lpMsg->sItemInfo[I_TYPE] == ITEMGET(4,7) || lpMsg->sItemInfo[I_TYPE] == ITEMGET(4,15) ){
		//		if ( target >= 12 || source < 12 ){
		//			Engine['Protocol'].ItemMoveResultSend(aIndex, -1, 0, (LPBYTE)&ItemInfo);
		//			return;
		//		}
		//	}else{
		//		Engine['Protocol'].ItemMoveResultSend(aIndex, -1, 0, (LPBYTE)&ItemInfo);
		//		return;
		//	}
		//}

		if ( me.DieRegen != false ){
			Engine['Protocol'].ItemMoveResultSend(aIndex, -1, 0, ItemInfo);
			return;
		}

		

		if ( sFlag == 3 || tFlag == 3 ){
			if ( me.m_IfState.use < 1 || me.m_IfState.type != 7 ){
				Engine['Protocol'].ItemMoveResultSend(aIndex, -1, 0, ItemInfo);
				//LogAdd("[%s][%s] error-L1 : used not Chaosbox", gObj[aIndex].AccountID, gObj[aIndex].Name);

				return;
			}

			if ( me.ChaosLock == true){
				//LogAddTD("[%s][%s] error-L3 : CBMixing", gObj[aIndex].AccountID, gObj[aIndex].Name);
				Engine['Protocol'].ItemMoveResultSend(aIndex, -1, 0, ItemInfo);
			
				return;
			}
		}

		if ( sFlag == 5 || tFlag == 5 ){
			if (me.m_IfState.use < 1 || me.m_IfState.type != 13 ){
				Engine['Protocol'].ItemMoveResultSend(aIndex, -1, 0, ItemInfo);
				//LogAdd("[%s][%s] error-L1 : used not DarkTrainerBox", gObj[aIndex].AccountID, gObj[aIndex].Name);

				return;
			}

			if (  me.ChaosLock == true){
				//LogAddTD("[%s][%s] error-L3 : DarkTrainerBoxMixing", gObj[aIndex].AccountID, gObj[aIndex].Name);
				Engine['Protocol'].ItemMoveResultSend(aIndex, -1, 0, ItemInfo);
			
				return;
			}
		}

		if ( sFlag == 6 || sFlag == 7 || sFlag == 8 ||
			 tFlag == 6 || tFlag == 7 || tFlag == 8 ){
			if ( me.m_IfState.use < 1 || me.m_IfState.type !=7 ){
				Engine['Protocol'].ItemMoveResultSend(aIndex, -1, 0, ItemInfo);
				//LogAdd("[%s][%s] error-L1 : used not ChaosBox",
				//	gObj[aIndex].AccountID, gObj[aIndex].Name);

				return;
			}

			if ( me.ChaosLock == true ){
				//LogAddTD("[%s][%s] error-L3 : JewelOfHarmony Mixing",
				//	gObj[aIndex].AccountID, gObj[aIndex].Name);
				Engine['Protocol'].ItemMoveResultSend(aIndex, -1, 0, ItemInfo);

				return;
			}
		}

		if ( sFlag == 9 || tFlag == 9 ){
			if ( me.m_IfState.use	 < 1 || me.m_IfState.type !=7 ){
				Engine['Protocol'].ItemMoveResultSend(aIndex, -1, 0, ItemInfo);
				//LogAdd("[%s][%s] error-L1 : used not ChaosBox",
				//	gObj[aIndex].AccountID, gObj[aIndex].Name);

				return;
			}

			if ( me.ChaosLock == true ){
				//LogAddTD("[%s][%s] error-L3 : JewelOfHarmony Mixing",
				//	gObj[aIndex].AccountID, gObj[aIndex].Name);
				Engine['Protocol'].ItemMoveResultSend(aIndex, -1, 0, ItemInfo);

				return;
			}
		}


		if ( sFlag == 2 || tFlag == 2 ){
			if (  me.m_IfState.use < 1 || me.m_IfState.type != 6 ){
				Engine['Protocol'].ItemMoveResultSend(aIndex, -1, 0, ItemInfo);
				//LogAdd("[%s][%s] error-L1 : used not Warehouse", gObj[aIndex].AccountID, gObj[aIndex].Name);

				return;
			}
		}

		if ( sFlag == 1 && tFlag == 0 ){
			if ( me.m_IfState.use < 1 || me.m_IfState.type != 1 )
			{
				Engine['Protocol'].ItemMoveResultSend(aIndex, -1, 0, ItemInfo);
				//LogAdd("[%s][%s] error-L1 : used not Trade", gObj[aIndex].AccountID, gObj[aIndex].Name);

				return;
			}
		}

		if ( sFlag == 2 && tFlag == 0 ){
			var money = Engine['Config'].GetWarehouseUsedHowMuch(me.cLevel, me.WarehousePW);

			if ( (me.Money - money ) < 1 && (me.WarehouseMoney - money) < 1){
				Engine['Protocol'].ItemMoveResultSend(aIndex, -1, 0, ItemInfo);
				
				//char szTemp[256];
				//wsprintf(szTemp, lMsg.Get(MSGGET(6, 69)), money);
				//::GCServerMsgStringSend(szTemp, lpObj->m_Index, 1);

				return;
			}

			if ( Engine['Config'].bCanWarehouseLock == true ){
				if ( me.WarehouseLock != false ){
					Engine['Protocol'].ItemMoveResultSend(aIndex, -1, 0, (LPBYTE)&ItemInfo);
					//::GCServerMsgStringSend(lMsg.Get(MSGGET(6, 70)), lpObj->m_Index, 1);

					return;
				}
			}
		}

		if( it_type != 8 ){
			var type = (ItemInfo[0] + ((ItemInfo[3] & 0x80 )*2)) + ((ItemInfo[5] & 0xF0)<<5);
			var lpItemAttr = GetItemAttr(type);

			if ( lpItemAttr == NULL ){
				Engine['Protocol'].ItemMoveResultSend(aIndex, -1, 0, ItemInfo);
				return;
			}

			if ( lpItemAttr.QuestItem != false ){
				GCItemMoveResultSend(aIndex, -1, 0, ItemInfo);
				return;
			}
		}

		if ( (sFlag == 0 && tFlag == 0) ||
			 (sFlag == 2 && tFlag == 0) ||
			 (sFlag == 0 && tFlag == 2) ||
			 (sFlag == 2 && tFlag == 2) ||
			 (sFlag == 0 && tFlag == 3) ||
			 (sFlag == 0 && tFlag == 5) ||
			 (sFlag == 0 && tFlag == 6) ||
			 (sFlag == 0 && tFlag == 7) ||
			 (sFlag == 0 && tFlag == 8) ||
			 (sFlag == 0 && tFlag == 9) ||
			 (sFlag == 9 && tFlag == 9) ||
			 (sFlag == 9 && tFlag == 0) ||
			 (sFlag == 0 && tFlag == 4) ||
			 (sFlag == 4 && tFlag == 0) ||
			 (sFlag == 4 && tFlag == 4) ||
			 (sFlag == 5 && tFlag == 0) ||
			 (sFlag == 5 && tFlag == 5) ||
			 (sFlag == 6 && tFlag == 0) ||
			 (sFlag == 6 && tFlag == 6) ||
			 (sFlag == 7 && tFlag == 0) ||
			 (sFlag == 7 && tFlag == 7) ||
			 (sFlag == 8 && tFlag == 0) ||
			 (sFlag == 8 && tFlag == 8) ||
			 (sFlag == 3 && tFlag == 0) ||
			 (sFlag == 3 && tFlag == 3) ){
			var DurSSend;
			var DurTSend;

			result = me.InventoryMoveItem(sPos, tPos, DurSSend, DurTSend, sFlag, tFlag, ItemInfo);
			Engine['Protocol'].ItemMoveResultSend(aIndex, result, tPos, ItemInfo);

			//if ( DurSSend != false ){
			//	this.ItemDurSend(aIndex, source, lpObj->pInventory[source].m_Durability, FALSE);
			//}

			//if ( DurTSend != FALSE )
			//	::GCItemDurSend(aIndex, target, lpObj->pInventory[target].m_Durability, FALSE);

			if ( result != 0xFF && sFlag == 2 && tFlag == 0){
				var money = Engine['Config'].GetWarehouseUsedHowMuch(me.cLevel, me.WarehousePW);

				if ( (me.Money - money) > 0 ){
					var iZen = me.Money;
					me.Money -= money;
					GCMoneySend(me.getObjId(), me.Money);

					//LogAdd("Pay WareHouse Money(In Inventory) : %d - %d = %d",
					//	iZen, money, lpObj->Money);
				}else if ( (me.WarehouseMoney - money) > 0 ){
					var iZen = me.WarehouseMoney;
					me.WarehouseMoney -= money;
		
					//LogAdd("Pay WareHouse Money(In WareHouse) : %d - %d = %d",
					//	iZen, money, lpObj->WarehouseMoney);

					//GCWarehouseInventoryMoneySend(aIndex, 1, lpObj->Money, lpObj->WarehouseMoney);
				}
			}

			return;
		}

		if ( sFlag == 1 && tFlag == 1 ){
			result = gObjTradeTradeMove(lpObj, source, target);
			Engine['Protocol'].ItemMoveResultSend(aIndex, result, tPos, ItemInfo);

			return;
		}

		if ( sFlag == 1 && tFlag == 0 ){
			result = gObjTradeInventoryMove(lpObj, source, target);

			if ( result == 0xFF ){
				Engine['Protocol'].ItemMoveResultSend(aIndex, 0xFF, tPos, ItemInfo);
				CGTradeCancelButtonRecv(aIndex);
			}else{
				Engine['Protocol'].ItemMoveResultSend(aIndex, result, tPos, ItemInfo);
			}

			if ( result == 0xFF ){
				me.m_IfState.state = 0;
				GCItemListSend(aIndex);
			}
			
			if ( me.TargetNumber >= 0 ){
				me.TradeOk = false;
				var lpTrade = Engine['Config'].get(me.TargetNumber);
				lpTrade.TradeOk = false;
				
				//GCTradeOkButtonSend(lpObj->TargetNumber, 2);
				GCTradeOkButtonSend(aIndex, 0);
			}

			return;
		}

		if ( sFlag == 0 && tFlag == 1 ){
			result = gObjInventoryTradeMove(lpObj, source, target);
			Engine['Protocol'].ItemMoveResultSend(aIndex, result, tPos, ItemInfo);
		}	
		
			
	}
}

exports.Init = function(E){ Engine = E; return ProtoCore; };