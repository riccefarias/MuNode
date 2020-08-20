var net = require('net');

var Engine = {};

var MAX_VIEWPORT = 75;
var MAX_VIEWPORT_MONSTER = 20;

// #define OBJ_EMPTY -1
//#define OBJ_MONSTER 2
//#define OBJ_USER 1
//#define OBJ_NPC	3

var ObjViewport = {
	VpNotify: function(lpObj){
		if(lpObj.Type == 1){
			if(lpObj.m_Change >= 0){
				
	  
				var TX = 0;
				var TY = 0;
				var DirPk = lpObj.Dir << 4;
					DirPk|= lpObj.m_PK_Level & 0x0F;
					
					
				var name = new Buffer(10);
					name.fill(0x00,0,10);
					name.write(lpObj.getName());
					
						
					var VpBuffer = Buffer.concat([new Buffer([0xC2,
														(30 >> 8) & 0xFF,
														(30 & 0xFF),
														0x45,
														0x01,
														(((aIndex >> 8) & 0xFF) | 0x80) ,
														((aIndex) & 0xFF ),
														lpObj.getX(),
														lpObj.getY(),
														(((lpObj.m_Change >> 8) & 0xFF)) ,
														((lpObj.m_Change) & 0xFF ),
														(lpObj.m_ViewSkillState >> 40) & 0xFF,
														(lpObj.m_ViewSkillState >> 32) & 0xFF,
														(lpObj.m_ViewSkillState >> 24) & 0xFF,
														(lpObj.m_ViewSkillState >> 16) & 0xFF,
														(lpObj.m_ViewSkillState >> 8) & 0xFF,
														(lpObj.m_ViewSkillState) & 0xFF]),
														name,
														new Buffer([lpObj.getX(),
														lpObj.getY(),
														DirPk])]);
														
			}else{
				
				var name = new Buffer(10);
					name.fill(0x00,0,10);
					name.write(lpObj.getName());
					
					
				var DirPk = lpObj.Dir << 4;
					DirPk|= lpObj.m_PK_Level & 0x0F;
				
				var VpBuffer = Buffer.concat([new Buffer([0xC2,			
														(5+41 >> 8) & 0xFF,
														(5+41 & 0xFF),
														0x12,
														0x01,
														(((aIndex >> 8) & 0xFF)) ,
														((aIndex) & 0xFF ),
														lpObj.oldX(),
														lpObj.oldY()]),
														lpObj.getWear(),
														new Buffer([0x00,0x00,0x00,0x00,0x00,0x00]),
														name,
														new Buffer([lpObj.getX(),
														lpObj.getY(),
														DirPk])]);
				
			}
		}
	},
	createVp: function(lpObj){
		if(lpObj.getStatus() != 3){
			return false;
		}
		
		if(lpObj.RegenOk > 0){
			return false;
		}
		/*
		lpObj.VpPlayer = {};
		lpObj.VpCount = 0;
		lpObj.VpPlayer2 = {};
		lpObj.VpCount2 = 0;*/
		
		for(var v1 in lpObj.VpPlayer){
			if(lpObj.VpPlayer[v1].state == 1 || lpObj.VpPlayer[v1].state == 2){
				if(lpObj.VpPlayer[v1].type==5){
					// ITEMS
					var itm = lpObj.getWorld().getItem(lpObj.VpPlayer[v1].number);
					
					if(itm.IsValid){
						if(itm.getWorld().checkViewport(lpObj.getObjId(),itm.getX(),itm.Y())==false){
							lpObj.VpPlayer[v1].state = 3;
						}
					}else{
						lpObj.VpPlayer[v1].state = 3;
					}
				}else{
					var obj = Engine['ObjectManager'].get(lpObj.VpPlayer[v1].number);
					
					if(obj.m_State==1){
						if(obj.Live == 0){
							lpObj.VpPlayer[v1].state = 3;
						}
					}
					
					if((obj.getStatus()  == 0) || (obj.m_State == 8) ||	(obj.Teleport != 0) || (obj.m_State == 32) ){
							lpObj.VpPlayer[v1].state = 3;
					}else{
						if(obj.getWorld().checkViewport(lpObj.getObjId(),obj.getX(),obj.getY()) == false){
							
							//console.log("Esquece "+obj.getObjId());
							
							lpObj.VpPlayer[v1].state = 3;

							if(lpObj.Type == 2 || lpObj.Type == 3){
								if(obj.Type == 1){
									if(lpObj.m_iCurrentAI != 0){
										//lpObj->m_Agro.DelAgro(tObjNum);
									}
								}
							}
						}
					}
				}
			}
		}
		
		
		for(var v2 in lpObj.VpPlayer2){
			if(lpObj.VpPlayer2[v2].state == 1 || lpObj.VpPlayer2[v2].state == 2){
				var obj = Engine['ObjectManager'].get(lpObj.VpPlayer2[v2].number);
					
				if(obj.getStatus() < 3)
				{
					lpObj.VpPlayer2[v2].state = 0;
					lpObj.VpPlayer2[v2].number = -1;
					lpObj.VPCount2 --;
				}else{
					if(obj.getWorld().checkViewport(lpObj.getObjId(),obj.getX(),obj.getY()) == false){
						lpObj.VpPlayer2[v2].state = 0;
						lpObj.VpPlayer2[v2].number = -1;
						lpObj.VPCount2 --;
					}
				}
			}
		}
		
		if(lpObj.Type == 1){
			var tmpMap = lpObj.getWorld().getViews(lpObj.getX(),lpObj.getY());
			for(var o in tmpMap){
				//console.log("TEST: "+tmpMap[o].getObjId()+" IN "+lpObj.getObjId());
				if(tmpMap[o].Live==1){
					if(tmpMap[o].m_State == 1 || tmpMap[o].m_State == 2){
						if(tmpMap[o].Type==5){
							this.VpAdd(lpObj.getObjId(),tmpMap[o].getObjId(),tmpMap[o].Type);
						}else{
							if((tmpMap[o].getStatus()==3) && tmpMap[o].getObjId()!=lpObj.getObjId()){
								if(tmpMap[o].m_State == 1 || tmpMap[o].m_State == 2){
								
									//console.log("ADD: "+tmpMap[o].getObjId()+" IN "+lpObj.getObjId());
									this.VpAdd(lpObj.getObjId(),tmpMap[o].getObjId(),tmpMap[o].Type);
									this.VpAdd2(lpObj.getObjId(),tmpMap[o].getObjId(),tmpMap[o].Type);
								}
							}
						}
					}
				}
				
			}
		}else if(lpObj.Type == 2 /*|| lpObj.Type == OBJ_NPC*/){
			//console.log("MOB VER:");
			var tmpMap = lpObj.getWorld().getViews(lpObj.getX(),lpObj.getY());
			for(var o in tmpMap){
				
				
				//console.log("MOB VER:"+tmpMap[o].getObjId());
				if((tmpMap[o].getStatus() == 3) && (tmpMap[o].getObjId()!=lpObj.getObjId())){
						//console.log("MOB VER 1:"+tmpMap[o].getObjId());
					if(tmpMap[o].m_State == 1 || tmpMap[o].m_State == 2){
						
						//console.log("MOB VER 2:"+tmpMap[o].getObjId());
						//if(mapnum == lpTempObj->MapNumber){
						//	if(gObjCheckViewport(aIndex,lpTempObj->X,lpTempObj->Y) == 1){
							
							
								this.VpAdd(lpObj.getObjId(),tmpMap[o].getObjId(),tmpMap[o].Type);
								this.VpAdd2(lpObj.getObjId(),tmpMap[o].getObjId(),tmpMap[o].Type);
						//	}
						//}
					}
				}
			}
		}
		
	},
	VpAdd: function(aIndex, aAddIndex, aType){
		var lpObj = Engine['ObjectManager'].get(aIndex);
		var MVL = MAX_VIEWPORT;

		if(lpObj.Type == 2)
		{
			MVL = MAX_VIEWPORT_MONSTER;
		}

		if(lpObj.VpPlayer.length>MVL){
			return -1;
		}else{
			if((!lpObj.VpPlayer[aAddIndex]) || (lpObj.VpPlayer[aAddIndex].state==0)){
				if(lpObj.Type==1){
					//console.log("Is add "+aAddIndex);
				}
				lpObj.VpPlayer[aAddIndex] = {state: 1,number: aAddIndex,type: aType};
				lpObj.VPCount ++;
			}else{
				//console.log(lpObj.VpPlayer[aAddIndex]);
			}
		}
		


		if(lpObj.Type == 2|| lpObj.Type == 3)
		{
			if(aType == 1)
			{
				//if(lpObj->m_iCurrentAI != 0)
				//{
				//	lpObj->m_Agro.SetAgro(aAddIndex,1000);
				//}
			}
		}
		return 1;
	},
	VpAdd2: function(aIndex, aAddIndex, aType){
		var lpObj = Engine['ObjectManager'].get(aIndex);
		var MVL = MAX_VIEWPORT;

		if(lpObj.Type == 2)
		{
			MVL = MAX_VIEWPORT_MONSTER;
		}

		if(lpObj.VpPlayer2.length>MVL){
			return -1;
		}else{
			
			if((!lpObj.VpPlayer2[aAddIndex]) || (lpObj.VpPlayer2[aAddIndex].state==0)){
				lpObj.VpPlayer2[aAddIndex] = {state: 1,number: aAddIndex,type: aType};
				lpObj.VPCount2 ++;
			}
		}
		


		if(lpObj.Type == 2|| lpObj.Type == 3)
		{
			if(aType == 1)
			{
				//if(lpObj->m_iCurrentAI != 0)
				//{
				//	lpObj->m_Agro.SetAgro(aAddIndex,1000);
				//}
			}
		}
		return 1;
	},
	VpProtocol: function(lpObj){

		if(lpObj.getStatus() < 3){
			return;
		}

		
		var pDestroyCount = 0;
		var iDestroyCount = 0;

		var pDestroyBuf = new Buffer([]);
		var iDestroyBuf = new Buffer([]);
		
	

		if(lpObj.Type == 1){
			for(var v1 in lpObj.VpPlayer){
				if(lpObj.VpPlayer[v1].state == 3){
					tObjNum = lpObj.VpPlayer[v1].number;

					if(tObjNum >= 0){
						switch(lpObj.VpPlayer[v1].type){
							case 1:
							case 2:
							case 3:
							
								var pDestroyBuf = Buffer.concat([pDestroyBuf,new Buffer([(tObjNum >> 8),(tObjNum)])]);
								
							
								pDestroyCount ++;
							break;
							case 5:
							
								var iDestroyBuf = Buffer.concat([iDestroyBuf,new Buffer([(tObjNum >> 8),(tObjNum)])]);
							
								iDestroyCount++;
							break;
						}
					}

					lpObj.VpPlayer[v1].state = 0;
					lpObj.VpPlayer[v1].number = -1;
					lpObj.VPCount -= 1;
				}
			}
		}else if(lpObj.Type == 2 || lpObj.Type == 3){
			for(var v1 in lpObj.VpPlayer){
				if(lpObj.VpPlayer[v1].state == 3){
					lpObj.VpPlayer[v1].state = 0;
					lpObj.VpPlayer[v1].number = -1;
					lpObj.VPCount -= 1;
				}
			}
		}

		if(lpObj.Type == 1){
			if(pDestroyCount > 0){
						
				Engine['ObjectManager'].DataSend(lpObj.getObjId(),Buffer.concat([new Buffer([0xC1,(4+(pDestroyCount*2)),0x14,pDestroyCount]),pDestroyBuf]));
			}

			if(iDestroyCount > 0){
							
				var size = 5+(iDestroyCount*2);
				
				Engine['ObjectManager'].DataSend(lpObj.getObjId(),Buffer.concat([new Buffer([0xC2,(size >> 8),(size),0x21,iDestroyCount]),pDestroyBuf]));
			}
		}

		if(lpObj.Type == 2 || lpObj.Type == 3){
			for(var v1 in lpObj.VpPlayer){
				if(lpObj.VpPlayer[v1].state == 1){
					lpObj.VpPlayer[v1].state = 2;
				}
			}
		}else{
			
			var pChangeBuf = new Buffer([]);
			var pChangeCount = 0;
			
			
			var pCreateBuf = new Buffer([]);
			var pCreateCount = 0;
			
			
			var pCallMonsterBuf = new Buffer([]);
			var pCallMonsterCount = 0;
			
			var pCreateMonsterBuf = new Buffer([]);
			var pCreateMonsterCount = 0;
			
			var pGuildBuf = new Buffer([]);
			var pGuildCount = 0;
			
			if(lpObj.Type == 1){
				for(var v1 in lpObj.VpPlayer){
					if(lpObj.VpPlayer[v1].state == 1){
						tObjNum = lpObj.VpPlayer[v1].number;
			
						if(tObjNum >= 0){
							switch(lpObj.VpPlayer[v1].type){
								case 1:
									//console.log("VP?!");
								
									Obj = Engine['ObjectManager'].get(tObjNum);
				
									if(Obj.m_Change >= 0){
										
										
										var name = new Buffer(10);
											name.fill(0x00,0,10);
											name.write(Obj.getName(),0);
										
										var pTemp = new Buffer([(tObjNum >> 8),(tObjNum),Obj.getOldX(),Obj.getOldY(),(Obj.m_Change >> 8),(Obj.m_Change),0x00]);
										
										if(Obj.m_State == 1 && Obj.Teleport == 0){
											pTemp[0] |= 0x80;
										}
										
										var DirPk = Obj.getDir() << 4;
										    DirPk|= Obj.getPkLevel() & 0x0F;
										
										pTemp = Buffer.concat([pTemp,name,new Buffer([Obj.getX(),Obj.getY(),DirPk])]);
										
										pChangeBuf = Buffer.concat([pChangeBuf,pTemp]);
										
	
										pChangeCount ++;
									}else{
										
										//console.log("Protocol Add "+Obj.getName());
										
													
										
										var name = new Buffer(10);
											name.fill(0x00,0,10);
											name.write(Obj.getName(),0);
										
										var pTemp = new Buffer([(tObjNum >> 8),(tObjNum),Obj.getX(),Obj.getY()]);
										
										if(Obj.m_State == 1 && Obj.Teleport == 0){
											pTemp[0] |= 0x80;
										}
										
										var DirPk = Obj.getDir() << 4;
										    DirPk|= Obj.getPkLevel() & 0x0F;
										
										
						
										pTemp = Buffer.concat([pTemp,Obj.getWear(),new Buffer([0x00,0x00,0x00,0x00,0x00,0x00]),name,new Buffer([Obj.getX(),Obj.getY(),DirPk])]);
										
										pCreateBuf = Buffer.concat([pCreateBuf,pTemp]);
										
										
										
										pCreateCount ++;
									}
				
									if(lpObj.Type == 1){
										if(Obj.lpGuild != 0){
											
											
										var pTemp = new Buffer([(Obj.lpGuild >> 24),(Obj.lpGuild >> 16),(Obj.lpGuild >> 8),(Obj.lpGuild),0x00,0x00,0x00,(((Obj.getObjId() >> 8) & 0xFF) & 0x7F ),(((Obj.getObjId()) & 0xFF )),0x00,0x00,0x00]);
											
										//if(gData.GuildStatus==5){
										switch(Obj.lpGuildStatus){
											case 5:{
												pTemp[4] = 128; // guild status
											}
											break;
											case 4:{
												pTemp[4] = 64; // guild status
											}
											break;
											case 3:{
												pTemp[4] = 32; // guild status
											}
											break;
											case 1:{
												pTemp[4] = 0; // guild status
											}
											break;
										}
										pTemp[5] = 0x80; // guild type
										pTemp[6] = 0x80; // guild relation
										//}	
											
										pGuildBuf = Buffer.concat([pGuildBuf,pTemp]);
										pGuildCount++;
						
										
											
											
											
											/*
				
											pGuild.btGuildStatus = lpTargetObj->GuildStatus;
											pGuild.btGuildType = lpTargetObj->lpGuild->btGuildType;
				
											if(lpObj->lpGuild != 0){
												pGuild.btGuildRelationShip = gObjGetRelationShip(lpObj,lpTargetObj);
											}else{
												pGuild.btGuildRelationShip = 0;
											}
				
											if(strcmp(lpTargetObj->lpGuild->Names[0],lpTargetObj->Name)==0){
												pGuild.NumberH |= 0x80;
											}
				
											memcpy(&GuildInfoBuf[GuildInfoOfs],&pGuild,sizeof(pGuild));
											GuildInfoOfs += sizeof(pGuild);
											GuildInfoCount += 1;*/
										}
				
										
									}
									break;
								case 2:
								case 3:
									if(lpObj.Type == 1){
										Obj = Engine['ObjectManager'].get(tObjNum);
				
										if(Obj.m_RecallMon >= 0){
											
  
  
											var pTemp = new Buffer([(tObjNum >> 8),(tObjNum),(Obj.Class >> 8),(Obj.Class),(Obj.m_ViewSkillState >> 24),(Obj.m_ViewSkillState >> 16),(Obj.m_ViewSkillState >> 8),(Obj.m_ViewSkillState),Obj.getOldX(),Obj.getOldY(),Obj.getX(),Obj.getY(),Obj.getDir() << 4]);
											if(Obj.m_State == 1){
												pTemp[0] |= 0x80;
											}
											
											
											var name = new Buffer(10);
												name.fill(0x00,0,10);
											
											if(Obj.m_RecallMon >= 0 && Obj.m_RecallMon < 4000-1){
												
												name.write(Engine['ObjectManager'].get(Obj.m_RecallMon).getName(),0);
												
											}else{
												// não é mob de ninguem
											}
											
											
											pCallMonsterBuf = Buffer.concat([pCallMonsterBuf,pTemp,name]); // 23 bytes
											
											
					
				
										
											pCallMonsterCount++;
										}else{
											
								
											
											var pTemp = new Buffer([(tObjNum >> 8),(tObjNum),(Obj.Class >> 8),(Obj.Class),(Obj.m_ViewSkillState >> 24),(Obj.m_ViewSkillState >> 16),(Obj.m_ViewSkillState >> 8),(Obj.m_ViewSkillState),Obj.getX(),Obj.getY(),Obj.getX(),Obj.getY(),Obj.getDir() << 4,0x00,0x00,0x00]);
											if(Obj.m_State == 1){
												pTemp[0] |= 0x80;
												if(Obj.Teleport != 0){
													pTemp[0]|= 0x40;
												}
											}
											
											
											pCreateMonsterBuf = Buffer.concat([pCreateMonsterBuf,pTemp]); // 13
											

											pCreateMonsterCount++;
										}
									}
								break;
								case 5:
									/*if(lpObj.Type == 1){
										pItemViewportCreate.NumberH = SET_NUMBERH(tObjNum);
										pItemViewportCreate.NumberL = SET_NUMBERL(tObjNum);
				
										if(MapC[lpObj->MapNumber].m_cItem[tObjNum].m_State == 1){
											pItemViewportCreate.NumberH |= 0x80;
										}
				
										pItemViewportCreate.px = MapC[lpObj->MapNumber].m_cItem[tObjNum].px;
										pItemViewportCreate.py = MapC[lpObj->MapNumber].m_cItem[tObjNum].py;
				
										if(MapC[lpObj->MapNumber].m_cItem[tObjNum].m_Type == ITEMGET(14,15)){
											WORD MoneyHW = SET_NUMBERHW(MapC[lpObj->MapNumber].m_cItem[tObjNum].m_BuyMoney);
											WORD MoneyLW = SET_NUMBERLW(MapC[lpObj->MapNumber].m_cItem[tObjNum].m_BuyMoney);
				
											pItemViewportCreate.ItemInfo[0] = BYTE(MapC[lpObj->MapNumber].m_cItem[tObjNum].m_Type)%255;
											pItemViewportCreate.ItemInfo[1] = SET_NUMBERL(MoneyHW);
											pItemViewportCreate.ItemInfo[2] = SET_NUMBERH(MoneyLW);
											pItemViewportCreate.ItemInfo[4] = SET_NUMBERL(MoneyLW);
											pItemViewportCreate.ItemInfo[3] = 0;
											pItemViewportCreate.ItemInfo[5] = (MapC[lpObj->MapNumber].m_cItem[tObjNum].m_Type & 0x1E00) >> 5;
											pItemViewportCreate.ItemInfo[6] = 0;
				
											memcpy(&ItemBuf[lOfs_Item],&pItemViewportCreate,sizeof(pItemViewportCreate));
											lOfs_Item += ItemStructSize;
										}else{
											ItemByteConvert(pItemViewportCreate.ItemInfo, (MapC[lpObj->MapNumber].m_cItem[tObjNum]));
											memcpy(&ItemBuf[lOfs_Item],&pItemViewportCreate,sizeof(pItemViewportCreate));
											lOfs_Item += ItemStructSize;
										}

										count_Item += 1;
									}*/
								break;
							}
						}
						lpObj.VpPlayer[v1].state = 2;
					}
				}
			}
			if(lpObj.Type == 1){
				if(pCreateCount > 0){
					
					var size = 5+(pCreateCount*41);
					
					Engine['ObjectManager'].DataSend(lpObj.getObjId(),Buffer.concat([new Buffer([0xC2,(size >> 8),(size),0x12,pCreateCount]),pCreateBuf]));
					
				}
		
				if(pChangeCount > 0){
					
					
					var size = 5+(pChangeCount*28);
					
					Engine['ObjectManager'].DataSend(lpObj.getObjId(),Buffer.concat([new Buffer([0xC2,(size >> 8),(size),0x45,pChangeCount]),pChangeBuf]));
				}
			
				if(pCreateMonsterCount > 0){
					console.log("Send "+pCreateMonsterCount);
					var size = 5+(pCreateMonsterCount*16);					
					
					Engine['ObjectManager'].DataSend(lpObj.getObjId(),Buffer.concat([new Buffer([0xC2,(size >> 8),(size),0x13,pCreateMonsterCount]),pCreateMonsterBuf]));
				}	
		
				if(pCallMonsterCount > 0){
					
					var size = 5+(pCallMonsterCount*23);					
					
					Engine['ObjectManager'].DataSend(lpObj.getObjId(),Buffer.concat([new Buffer([0xC2,(size >> 8),(size),0x1F,pCallMonsterCount]),pCallMonsterBuf]));
				
				}
		/*
				if(count_Item > 0){
					PWMSG_COUNT pCount;
		
					pCount.h.c = 0xC2;
					pCount.h.headcode = 0x20;
					pCount.count = count_Item;
					pCount.h.sizeH = SET_NUMBERH(lOfs_Item);
					pCount.h.sizeL = SET_NUMBERL(lOfs_Item);
					
					memcpy(ItemBuf,&pCount,sizeof(pCount));
					DataSend(aIndex,(unsigned char *)&ItemBuf,lOfs_Item);
				}
			*/
				if(pGuildCount != 0){
					
					Engine['ObjectManager'].DataSend(lpObj.getObjId(),Buffer.concat([new Buffer([0xC2,((5+(pGuildCount * 12)) >> 8),((5+(pGuildCount * 12))),0x65,pGuildCount]),pGuildBuf]));
					
				}
				
			}
		}

	}
}

exports.Init = function(E){ Engine = E; return ObjViewport};