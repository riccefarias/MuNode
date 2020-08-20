
var Engine = {};




var TMAttack= {
	gObjDuelCheck: function(lpObj,lpTObj){
		var bRetVal = false;
		
		if(lpTObj!=undefined){
			if ( lpObj.Type == 1 && lpTObj.Type == 2){
				if ( lpObj.m_iDuelUser == lpTargetObj.m_Index && lpTargetObj.m_iDuelUser == lpObj.m_Index){
					bRetVal = true;
				}
			}
		}else{

			if ( lpObj.Type == 1 )
			{
				var iDuelIndex = lpObj.m_iDuelUser;
				if ( iDuelIndex>-1){
					bRetVal = true;
				}
			}
		}
		return bRetVal;
	},
	gObjAttackQ: function(lpObj){
		if ( (((lpObj.m_Attribute)<51)?false:((lpObj.m_Attribute)>58)?false:true) ){
			return false;
		}

		if ( lpObj.Class == 221 || lpObj.Class == 222 ){
			return false;
		}
/*
	#if GS_CASTLE == 1
		if ( lpObj->Class == 277 || lpObj->Class == 283 )
		{
			if ( g_CastleSiege.GetCastleState() != CASTLESIEGE_STATE_STARTSIEGE )
			{
				return FALSE;
			}
		}

		if ( lpObj->Class == 221 || lpObj->Class == 222 )
		{
			return FALSE;
		}

		if ( lpObj->Class == 277 && lpObj->m_btCsGateOpen == 1 )
		{
			return FALSE;
		}
	#endif*/

		if ( Engine['Config'].BC_MAP_RANGE(lpObj.getMap()) ){
			if ( lpObj.Type >= 2 ){
				if ( lpObj.Class == 131 && g_BloodCastle.CheckMonsterKillSuccess(lpObj.getMap()-0x0b) == false){
					return false;
				}

				if ( (((lpObj.Class - 132) < 0)?false:((lpObj.Class-132) > 2)?false:true) !=false && g_BloodCastle.CheckBossKillSuccess(lpObj.getMap()-0x0b) == false ){
					return false;
				}
			}
		}

		if ( lpObj.Class != 247 && lpObj.Class != 249 && lpObj.Class  >= 100 && lpObj.Class <= 110 ){
			return false;
		}

		if ( lpObj.m_State != 2 ){
			return false;
		}

		if( lpObj.Live == false ){
			return false;
		}

		if ( lpObj.Teleport == 1 ){
			return false;
		}

		return true;
	},
	Attack: function(lpObj,lpTargetObj, lpMagic, magicsend, MSBFlag, AttackDamage, bCombo){
		var skillSuccess = 0;
		var lpCallObj;
		var lpCallTargetObj;
		var MsgDamage = 0;
		var ManaChange = 0;
		var iTempShieldDamage = 0;
		var iTotalShieldDamage = 0;

		/*if ( (lpTargetObj->Authority&2) == 2 ){
			return FALSE;
		}*/

		if ( lpObj.getMap() != lpTargetObj.getMap()){
			return false;
		}
/*
	#if GS_CASTLE == 1 
		if ( g_Crywolf.GetCrywolfState() == 3  || g_Crywolf.GetCrywolfState() == 5 )
		{
			if ( CHECK_CLASS(lpTargetObj->MapNumber, MAP_INDEX_CRYWOLF_FIRSTZONE) )
			{
				if ( lpTargetObj->Type == OBJ_MONSTER )
				{
					return FALSE;
				}
			}
		}
	#endif
*/
		if ( Engine['Config'].g_iUseCharacterAutoRecuperationSystem && lpObj.cLevel <= Engine['Config'].g_iCharacterRecuperationMaxLevel ){
			if ( lpObj.Type == 1 ){
				if ( lpObj.cLevel <= Engine['Config'].g_iCharacterRecuperationMaxLevel ){ // #warning useless code
					lpObj.m_iAutoRecuperationTime = new Date().getTime();
				}
			}

			if ( lpTargetObj.Type == 1 ){
				if ( lpTargetObj.cLevel <= Engine['Config'].g_iCharacterRecuperationMaxLevel ){
					lpTargetObj.m_iAutoRecuperationTime = new Date().getTime();
				}
			}
		}

		if ( lpObj.Type == 1 ){
			lpObj.dwShieldAutoRefillTimer = new Date().getTime();
		}
		if ( lpTargetObj.Type == 1 ){
			lpTargetObj.dwShieldAutoRefillTimer = new Date().getTime();
		}
		var skill = 0;
		
		if ( lpMagic ){
			skill = lpMagic.m_Skill;
		}
		if ( lpObj.Class == 77 ){
			if ( lpObj.m_SkyBossMonSheild && skill == 17 ){
				skill = 3;
			}
		}

		skillSuccess = true;

		if ( lpObj.GuildNumber > 0 ){
			if ( lpObj.lpGuild ){
				if ( lpObj.lpGuild.WarState ){
					if ( lpObj.lpGuild.WarType == 1 ){
						if ( !Engine['BattleSoccer'].GetBattleSoccerGoalMove(0) ){
							return true;
						}
					}
				}

				if ( lpObj.lpGuild.WarState ){
					if ( lpObj.lpGuild.WarType == 0 ){
						if ( lpTargetObj.Type == 2 ){
							return true;
						}
					}
				}
			}
		}

		if ( lpTargetObj.Type == 2 ){
			if ( lpTargetObj.m_iMonsterBattleDelay > 0 ){
				return true;
			}
			
			if ( lpTargetObj.Class == 200 ){
				if ( skill ){
					lpObj.MonsterStateProc(lpTargetObj,7,0);
				}else{
					lpObj.MonsterStateProc(lpTargetObj,6,0);
				}

				if ( magicsend ){
					//GCMagicAttackNumberSend(lpObj, skill, lpTargetObj->m_Index, skillSuccess);
				}

				return true;
			}

			if ( lpTargetObj.m_ImmuneToMagicCount > 0 ){
				//var bCheckAttackIsMagicType = gObjCheckAttackTypeMagic(lpObj->Class, skill);

				//if ( bCheckAttackIsMagicType == true ){
					//GCMagicAttackNumberSend(lpObj, skill, lpTargetObj->m_Index, 0);
				//	return true;
				//}
			}

			if ( lpTargetObj.m_ImmuneToHarmCount > 0 ){
				//var bCheckAttackIsMagicType = gObjCheckAttackTypeMagic(lpObj->Class, skill);

				//if ( bCheckAttackIsMagicType == false ){
				//	GCDamageSend(lpObj->m_Index, lpTargetObj->m_Index, 0, 0, 0, 0);
				//	return true;
				//}
			}
			//if ( lpTargetObj.m_MonsterSkillElementInfo.m_iSkillElementImmuneTime > 0 ){
			//	if ( lpTargetObj.m_MonsterSkillElementInfo.m_iSkillElementImmuneNumber == skill ){
			//		return true;
			//	}
			//}
		}

		if ( lpObj.Type == 1 ){
			if ( lpObj.getStatus()!=3 ){
				return false;
			}

			if ( lpObj.m_Change == 8 ){
				skill = 1;
				//lpMagic = &DefMagicInf[1];
				magicsend = 1;
			}

			//gDarkSpirit[lpObj->m_Index].SetTarget(lpTargetObj->m_Index);
		}

		if ( lpTargetObj.Type == 1 ){
			if ( lpTargetObj.getStatus()!=3 ){
				return false;
			}
		}

		if ( lpObj.Type == 1 && lpTargetObj.Type == 2 ){	// PLAYER VS MONSTER
		
			if ( lpObj.m_RecallMon >= 0 ){
				if ( lpObj.m_RecallMon == lpTargetObj.m_Index ){
					return false;
				}
			}
		}

		if ( !this.gObjAttackQ(lpTargetObj)){
			return false;
		}

		if ( lpObj.m_RecallMon >= 0 ){
			//gObjCallMonsterSetEnemy(lpObj, lpTargetObj->m_Index);
		}

		lpObj.m_TotalAttackCount++;

		if ( AttackDamage == 0 ){
			if ( skill != 76 ){
				if ( !lpObj.m_iMuseElfInfinityArrowSkillTime ){
					//if ( !this.DecreaseArrow(lpObj) ){
					//	return false;
					//}
				}
			}
		}

		//if ( this->CheckAttackArea(lpObj, lpTargetObj) == FALSE ){
		//	return FALSE;
		//}

		lpCallObj = lpObj;

		if ( lpObj.Type == 2 ){
			if ( lpObj.m_RecallMon >= 0 ){
				lpCallObj = Engine['ObjectManager'].get(lpObj.m_RecallMon);
			}
		}

		lpCallTargetObj = lpTargetObj;

		if ( lpTargetObj.Type == 2 ){
			if ( lpTargetObj.m_RecallMon >= 0 ){
				lpCallTargetObj = Engine['ObjectManager'].get(lpTargetObj.m_RecallMon);
			}
		}

		//if ( this->PkCheck(lpCallObj, lpTargetObj) == false ){
		//	return false;
		//}

		console.log("chegou aqui1");
		
		var Strength = lpObj.Strength + lpObj.AddStrength;
		var Dexterity = lpObj.Dexterity + lpObj.AddDexterity;
		var Vitality = lpObj.Vitality + lpObj.AddVitality;
		var Energy = lpObj.Energy + lpObj.AddEnergy;
		
		var bIsOnDuel = this.gObjDuelCheck(lpObj, lpTargetObj);

		if ( bIsOnDuel ){
			lpObj.m_iDuelTickCount = new Date().getTime();
			lpTargetObj.m_iDuelTickCount = new Date().getTime();
		}

		if ( lpObj.getItem(0).m_Type == ITEMGET(2,5) && lpObj.getItem(0).m_IsValidItem != false ){	// Crystal Sword
		
			if ( (Engine['MonsterAI'].Rand2()%20) == 0 ){
				//skill = 7;
				//lpMagic = &DefMagicInf[7];
				//magicsend = 1;
			}
		}else if ( lpObj.getItem(1).m_Type == ITEMGET(2,5) && lpObj.getItem(1).m_IsValidItem != false ){	// Crystal Sword
		
			if ( (Engine['MonsterAI'].Rand2()%20) == 0 ){
				//skill = 7;
				//lpMagic = &DefMagicInf[7];
			//	magicsend = 1;
			}
		}

		MSBFlag = 0;
		MsgDamage = 0;
		//skillSuccess = this->ResistanceCheck(lpObj, lpTargetObj, skill);
		var skillIceArrowSuccess = skillSuccess;

		if ( skill == 51 ){
			skillSuccess = 0;
		}

		var bAllMiss = false;
		
		if ( lpObj.m_iSkillInvisibleTime > 0 ){
			//gObjUseSkill.RemoveCloakingEffect(lpObj->m_Index);
		}
		var bDamageReflect = FALSE;
		
		if ( AttackDamage == 0 ){
			//if ( Engine['Config'].g_ShieldSystemOn == true ){
				//if ( lpObj.Type == 1 && lpTargetObj.Type == 1 ){
					//if ( !this->MissCheckPvP(lpObj, lpTargetObj, skill, skillSuccess, magicsend, bAllMiss) ){
					//	return FALSE;
					//}
				//}else if ( !this->MissCheck(lpObj, lpTargetObj, skill, skillSuccess, magicsend, bAllMiss) ){
				//	return FALSE;
				//}

			//}else if ( !this->MissCheck(lpObj, lpTargetObj, skill, skillSuccess, magicsend, bAllMiss) ){
			//	return FALSE;
			//}

			if ( skill == 51 && skillIceArrowSuccess == true ){
				lpTargetObj.m_SkillHarden = 7;
				lpTargetObj.m_SkillHardenTime = 7;
				lpTargetObj.lpAttackObj = lpObj;
				lpTargetObj.m_ViewSkillState |= 0x20;
				lpTargetObj.PathCount = 0;
				lpTargetObj.PathStartEnd = 0;
				skillSuccess = true;

				//gObjSetPosition(lpTargetObj->m_Index, lpTargetObj->X, lpTargetObj->Y);
			}

			var targetdefense = this.GetTargetDefense(lpObj, lpTargetObj, MsgDamage);

			if ( lpTargetObj.m_iSkillNPCDefense ){
				targetdefense += lpTargetObj.m_iSkillNPCDefense;
			}

			if ( skill == 19
				|| skill == 20
				|| skill == 21
				|| skill == 22
				|| skill == 23
				|| skill == 56
				|| skill == 41
				|| skill == 47
				|| skill == 42
				|| skill == 49
				|| skill == 43
				|| skill == 55
				|| skill == 44
				|| skill == 57
				|| skill == 74 ){
				AttackDamage = this.GetAttackDamage(lpObj, targetdefense, MsgDamage, bIsOnDuel, lpMagic);
				AttackDamage += lpObj.m_iSkillNPCAttack;

				if ( AttackDamage > 0 ){
					//gObjWeaponDurDown(lpObj, lpTargetObj, 0);
				}
			}else if ( skill == 76 ){	// pluzzmanton
			
				var iFenrirAttackDmg = 0;

				if ( lpObj.Class == 0x1 || lpObj.Class == 0x3 ){
					iFenrirAttackDmg = lpObj.Strength / 3 + lpObj.Dexterity / 5 + lpObj.Vitality / 5 + lpObj.Energy / 7;	// #formula
				}else if ( lpObj.Class == 0x0 ){
					iFenrirAttackDmg = lpObj.Strength / 5 + lpObj.Dexterity / 5 + lpObj.Vitality / 7 + lpObj.Energy / 3;	// #formula
				}else if ( lpObj.Class == 0x2 ){
					iFenrirAttackDmg = lpObj.Strength / 5 + lpObj.Dexterity / 3 + lpObj.Vitality / 7 + lpObj.Energy / 5;	// #formula
				}else{	// Dark Lord
					iFenrirAttackDmg = lpObj.Strength / 5 + lpObj.Dexterity / 5 + lpObj.Vitality / 7 + lpObj.Energy / 3 + lpObj.Leadership / 3;	// #formula
				}

				if ( iFenrirAttackDmg < 0 ){
					iFenrirAttackDmg = 0;
				}

				if ( lpObj.m_CriticalDamage > 0 ){
					if ( (Engine['MonsterAI'].Rand2()%100) < lpObj.m_CriticalDamage ){
						MsgDamage = 3;
					}
				}

				if ( lpObj.m_ExcelentDamage > 0 ){
					if ( (Engine['MonsterAI'].Rand2()%100) < lpObj.m_ExcelentDamage ){
						MsgDamage = 2;
					}
				}

				if ( MsgDamage == 3 ){	// Critical Damage
				
					AttackDamage =  iFenrirAttackDmg + lpMagic.m_DamageMax;
					AttackDamage += lpObj.SetOpAddCriticalDamage;
					AttackDamage += lpObj.SkillAddCriticalDamage;
					AttackDamage += lpObj.m_JewelOfHarmonyEffect.HJOpAddCriticalDamage;
					AttackDamage -= targetdefense;
				}else if ( MsgDamage == 2 ){	// Excellent
				
					AttackDamage = iFenrirAttackDmg + lpMagic.m_DamageMax;
					AttackDamage += AttackDamage * 20 / 100;
					AttackDamage += lpObj.SetOpAddExDamage;
					AttackDamage -= targetdefense;
				}else{
					AttackDamage = (iFenrirAttackDmg + lpMagic.m_DamageMin) + (Engine['MonsterAI'].Rand2()%(lpMagic.m_DamageMax - lpMagic.m_DamageMin + 1));
					AttackDamage -= targetdefense;
				}
			}else{
				if ( ( lpObj.Class == 0x0 || lpObj.Class == 0x3 ) && skill ){
					AttackDamage = this.GetAttackDamageWizard(lpObj, targetdefense, lpMagic, MsgDamage, bIsOnDuel);
					AttackDamage += lpObj.m_iSkillNPCAttack;

					if ( AttackDamage > 0 ){
						//gObjWeaponDurDown(lpObj, lpTargetObj, 1);
					}
				}else{
					AttackDamage = this.GetAttackDamage(lpObj, targetdefense, MsgDamage, bIsOnDuel, lpMagic);
					AttackDamage += lpObj.m_iSkillNPCAttack;

					if ( AttackDamage > 0 ){
						//gObjWeaponDurDown(lpObj, lpTargetObj, 0);
					}
				}
			}

			if ( bAllMiss ){
				AttackDamage = ( AttackDamage * 30 ) / 100;
			}

			if ( lpTargetObj.DamageMinus ){
				var beforeDamage = AttackDamage;
				AttackDamage -= ( ( AttackDamage * lpTargetObj.DamageMinus) / 100 );
			}

			var tlevel = lpObj.cLevel / 10;

			if ( AttackDamage < tlevel ){
				if ( tlevel < 1 ){
					tlevel = 1;
				}

				AttackDamage = tlevel;
			}

			if ( lpTargetObj.m_SkillNumber == 18 ){
				if ( AttackDamage > 1 ){
					AttackDamage >>= 1;
				}
			}

			gObjSpriteDamage(lpTargetObj, AttackDamage);

			if ( gObjSatanSprite(lpObj) == true ){
				lpObj.Life -= 3.0;

				if ( lpObj.Life < 0.0 ){
					lpObj.Life = 0.0;
				}else{
					AttackDamage = AttackDamage * 13 / 10;
				}

				GCReFillSend(lpObj.getObjId(), lpObj.Life, 0xFF, 0, lpObj.iShield);
			}

			if ( gObjAngelSprite(lpTargetObj) == true ){
				if ( AttackDamage > 1 ){
					var damage = (AttackDamage * 8) / 10.0;
					AttackDamage = damage;
				}
			}

			if ( gObjWingSprite(lpObj) == true ){
				var Wing = lpObj.pInventory[7];

				if ( lpObj.Class == 0x0 || lpObj.Class == 0x2 ){
					lpObj.Life -= 1.0;
				}else{
					lpObj.Life -= 3.0;
				}

				if ( lpObj.Life < 0.0 ){
					lpObj.Life = 0.0;
				}else{
					if ( Wing.m_Type == ITEMGET(13,30) ){	// Cape Of Lord
					
						AttackDamage = AttackDamage * (Wing.m_Level * 2 + 120) / 100;	// #formula
					}else if ( Wing.m_Type > ITEMGET(12,2) ){
						AttackDamage = AttackDamage * (Wing.m_Level + 132) / 100 ;	// #formula
					}else{
						AttackDamage = AttackDamage * (Wing.m_Level * 2 + 112) / 100;	// #formula
					}
				}

				GCReFillSend(lpObj.getObjId(), lpObj.Life, 0xFF, 0, lpObj.iShield);
			}

			if ( gObjWingSprite(lpTargetObj) == true ){
				var Wing = lpTargetObj.pInventory[7];

				if ( Wing.m_Type != ITEMGET(13,30) ){ // Cape Of Lord
				
					if ( AttackDamage > 1 ){
						if ( Wing.m_Type > ITEMGET(12, 2) ){
							var damage = (AttackDamage * (75 - (Wing.m_Level*2))) / 100.0;
							AttackDamage = Math.round(damage);	//  #formula
							
						}else{
							var damage = (AttackDamage * (88 - (Wing.m_Level*2))) / 100.0;
							AttackDamage = Math.round(damage);	//  #formula
						}
					}
				}
			}

			if ( gObjDenorantSprite(lpObj ) ){
				lpObj.Life -= 1.0;

				if ( lpObj.Life < 0.0 ){
					lpObj.Life = 0.0;
				}else{
					AttackDamage = AttackDamage * 115 / 100;
				}

				GCReFillSend(lpObj.getObjId(), lpObj.Life, 0xFF, 0, lpObj.iShield);
			}

			if ( gObjDenorantSprite(lpTargetObj ) ){
				var Dinorant = lpTargetObj.pInventory[8];
				var dinorantdecdamage = 90 - Dinorant.IsDinorantReduceAttackDamaege();
				lpObj.Life -= 1.0;

				if ( lpObj.Life < 0.0 ){
					lpObj.Life = 0.0;
				}else{
					AttackDamage = AttackDamage * dinorantdecdamage / 100;
				}

				GCReFillSend(lpObj.getObjId(), lpObj.Life, 0xFF, 0, lpObj.iShield);
			}

			if ( gObjDarkHorse(lpTargetObj ) ){
				var Darkhorse = lpTargetObj.pInventory[8];
				var decdamage = 100 - ((Darkhorse.m_PetItem_Level + 30) / 2 );

				lpTargetObj.Life -= 1.0;

				if ( lpTargetObj.Life < 0.0){
					lpTargetObj.Life = 0.0;
				}else{
					AttackDamage = AttackDamage * decdamage / 100;
				}

				GCReFillSend(lpTargetObj.getObjId(), lpTargetObj.Life, 0xFF, 0, lpTargetObj.iShield);
			}

			if ( lpTargetObj.Live ){
				switch ( skill ){
					case 19:
					case 20:
					case 21:
					case 22:
					case 23:
					case 41:
					case 42:
					case 43:
					case 44:
					case 49:
					case 55:
					case 57:
						if ( lpObj.Class == CLASS_DARKLORD || lpObj.Class == CLASS_MAGUMSA ){
							AttackDamage *= 2;
						}else{
							AttackDamage = ( AttackDamage * ( 200 + ( Energy / 10 ) ) ) / 100;
						}
						break;

					case 47:
						if ( lpObj.pInventory[8].m_Type == ITEMGET(13,3) ||
							 lpObj.pInventory[8].m_Type == ITEMGET(13,2) ||
							 lpObj.pInventory[8].m_Type == ITEMGET(13,37) ){
								if ( lpObj.Class == CLASS_DARKLORD || lpObj.Class == CLASS_MAGUMSA ){
									AttackDamage *= 2;
								}else{
									AttackDamage = ( AttackDamage * ( Energy / 10 + 200 )  ) / 100;
								}
						}
						break;

					case 56:
						AttackDamage *= 2;
						break;

					case 46:
					case 51:
					case 52:
						AttackDamage *= 2;
						break;

					case 60:
					case 61:
					case 62:
					case 65:
					case 74:
					case 78:
						AttackDamage = ( AttackDamage * ( ( ( lpObj.Energy + lpObj.AddEnergy ) / 20 + 200 ) ) ) / 100;
						break;

					case 76:
						var iDamageInc = lpObj.cLevel - 300;

						if ( iDamageInc < 0 )
							iDamageInc = 0;

						iDamageInc /= 5;
						AttackDamage = ( AttackDamage * ( iDamageInc + 200 ) ) / 100;
						break;
				}

				if ( skill == 0 ){
					if ( lpObj.pInventory[8].m_Type == ITEMGET(13, 3) ){
						AttackDamage = AttackDamage * 130 / 100;
					}
				}
				
				if ( lpTargetObj.m_WizardSkillDefense && AttackDamage > 0){
					var replacemana = lpTargetObj.Mana * 2 / 100;

					if ( replacemana < lpTargetObj.Mana ){
						lpTargetObj.Mana -= replacemana;
						var decattackdamage = AttackDamage * lpTargetObj.m_WizardSkillDefense / 100;
						AttackDamage -= decattackdamage;
						ManaChange = true;

					}
				}

				AttackDamage += lpObj.SetOpAddDamage;

				if ( lpObj.Type == 1 && lpTargetObj.Type == 1 ){
					AttackDamage += lpObj.m_ItemOptionExFor380.OpAddDamage;
				}

				if ( lpObj.Type == 1 && lpTargetObj.Type == 1 ){
					//if ( CC_MAP_RANGE(lpObj->MapNumber ) && CC_MAP_RANGE(lpTargetObj->MapNumber) ){
					//	AttackDamage = AttackDamage * 50 / 100;
					//}
				}
/*
	#if GS_CASTLE == 1
				if ( g_CastleSiege.GetCastleState() == CASTLESIEGE_STATE_STARTSIEGE )
				{
					if ( lpObj->Type == OBJ_USER && lpTargetObj->Type ==OBJ_USER )
					{
						if ( lpObj->MapNumber == MAP_INDEX_CASTLESIEGE && lpTargetObj->MapNumber == MAP_INDEX_CASTLESIEGE )
						{
							if ( lpObj->m_btCsJoinSide == lpTargetObj->m_btCsJoinSide )
							{
								AttackDamage = AttackDamage * 20 / 100;
							}
							else
							{
								AttackDamage = AttackDamage * 40 / 100;
							}
						}
					}
				}
	#endif
	*/

				if ( lpObj.Type == 1 && lpTargetObj.Type == 2 ){
					if ( lpTargetObj.Class == 283 ){
						if ( lpObj.m_iPotionBlessTime > 0 ){
							AttackDamage += (AttackDamage * 20) / 100;
						}else if ( lpObj.m_iPotionSoulTime > 0 ){
							AttackDamage = AttackDamage;
						}else {
							if ( lpObj.m_iAccumulatedDamage > 100 ){
								gObjWeaponDurDownInCastle(lpObj, lpTargetObj, 1);
								lpObj.m_iAccumulatedDamage = 0;
							}else{
								lpObj.m_iAccumulatedDamage += AttackDamage;
							}

							AttackDamage = AttackDamage * 5 / 100;
						}
					}

					if ( lpTargetObj.Class == 277 ){
						if ( lpObj.m_iPotionBlessTime > 0 ){
							AttackDamage += (AttackDamage * 20) / 100;
						}else if ( lpObj.m_iPotionSoulTime > 0 ){
							AttackDamage = AttackDamage;
						}else{
							if ( lpObj.m_iAccumulatedDamage > 100 ){
								gObjWeaponDurDownInCastle(lpObj, lpTargetObj, 1);
								lpObj.m_iAccumulatedDamage = 0;
							}else{
								lpObj.m_iAccumulatedDamage += AttackDamage;
							}

							AttackDamage = AttackDamage * 5 / 100;
						}
					}
				}

				if ( gObjFenrir( lpObj ) ){
					var iIncPercent = lpObj.pInventory[8].IsFenrirIncLastAttackDamage();

					if ( iIncPercent > 0 ){
						AttackDamage += AttackDamage * iIncPercent / 100;
					}
				}

				if ( gObjFenrir( lpTargetObj ) ){
					var iDecPercent = lpTargetObj.pInventory[8].IsFenrirDecLastAttackDamage();

					if ( iDecPercent > 0 ){
						AttackDamage -= AttackDamage * iDecPercent / 100;
					}
				}

				if ( AttackDamage < 0 ){
					AttackDamage = 0;
				}

				if ( skill == 76 ){
					if ( lpObj.Type == 1 && lpTargetObj.Type == 1 ){
						if ( AttackDamage > 0 ){
							/*
	#if GS_CASTLE == 1
							if ( !lpObj->m_btCsJoinSide || lpObj->m_btCsJoinSide != lpTargetObj->m_btCsJoinSide ) 
							{
	#endif
	*/
								var iEquipmentPos = Engine['MonsterAI'].Rand2()%5 + 2;	// Select and Armor
								var lpEquipment = lpTargetObj.pInventory[iEquipmentPos];

								if ( lpEquipment && lpEquipment.IsItem() )	{
									var iDurEquipment = lpEquipment.m_Durability * 50.0 / 100.0;
									lpEquipment.m_Durability = iDurEquipment;

									if ( lpEquipment.m_Durability < 0.0 )	{
										lpEquipment.m_Durability = 0.0;
									}

									//GCItemDurSend(lpTargetObj->m_Index, iEquipmentPos, lpEquipment->m_Durability, 0);
								}
	/*#if GS_CASTLE == 1
							}
	#endif
	*/
						}
					}
				}

				if ( lpObj.Type == 1 && lpTargetObj.Type == 1 ){
					iTempShieldDamage = this.GetShieldDamage(lpObj, lpTargetObj, AttackDamage);
					lpTargetObj.iShield -= iTempShieldDamage;
					lpTargetObj.Life -= AttackDamage - iTempShieldDamage;
					iTotalShieldDamage += iTempShieldDamage;

					if ( lpTargetObj.Life < 0.0 ){
						lpTargetObj.Life = 0.0;
					}
				}else{
					lpTargetObj.Life -= AttackDamage;

					if ( lpTargetObj.Life < 0.0 ){
						lpTargetObj.Life = 0.0;
					}
				}
			}
		}else{
			/*
	#if GS_CASTLE == 1
			if ( g_CastleSiege.GetCastleState() == CASTLESIEGE_STATE_STARTSIEGE )
			{
				if ( lpObj->Type == OBJ_USER && lpTargetObj->Type ==OBJ_USER )
				{
					if ( lpObj->MapNumber == MAP_INDEX_CASTLESIEGE && lpTargetObj->MapNumber == MAP_INDEX_CASTLESIEGE )
					{
						if ( lpObj->m_btCsJoinSide == lpTargetObj->m_btCsJoinSide )
						{
							AttackDamage = AttackDamage * 20 / 100;
						}
						else if ( g_ShieldSystemOn == 0 )
						{
							AttackDamage = AttackDamage * 40 / 100;
						}
					}
				}
			}
	#endif
	*/
			if ( skill != 79 ){
				bDamageReflect = true;
				MsgDamage = 4;
			}

			if ( lpObj.Type == 1 && lpTargetObj.Type == 1 ){
				iTempShieldDamage = this.GetShieldDamage(lpObj, lpTargetObj, AttackDamage);
				lpTargetObj.iShield -= iTempShieldDamage;
				lpTargetObj.Life -= AttackDamage - iTempShieldDamage;
				iTotalShieldDamage += iTempShieldDamage;

				if ( lpTargetObj.Life < 0.0 ){
					lpTargetObj.Life = 0.0;
				}
			}else{
				lpTargetObj.Life -= AttackDamage;

				if ( lpTargetObj.Life < 0.0 ){
					lpTargetObj.Life = 0.0;
				}
			}
		}

		if ( lpTargetObj.Type == 2){
			gObjAddMsgSendDelay(lpTargetObj, 0, lpObj.getObjId(), 100, 0);
			lpTargetObj.LastAttackerID = lpObj.m_Index;

			if ( lpTargetObj.m_iCurrentAI ){
				//lpTargetObj.m_Agro.IncAgro(lpObj->m_Index, AttackDamage / 50);
			}
		}

		var selfdefense = 0;
		lpCallObj = lpTargetObj;
		
		if ( lpTargetObj.Type == 2 ){
			if ( lpTargetObj.m_RecallMon >= 0 ){
				lpCallObj = Engine['ObjectManager'].get(lpTargetObj.m_RecallMon);
			}
		}

		if ( AttackDamage >= 1 ){
			if ( lpObj.Type == 1 && lpTargetObj.Type == 1){
				if ( gObjDuelCheck(lpObj, lpTargetObj) ){
					selfdefense = 0;
				}else if ( Engine['Config'].CC_MAP_RANGE(lpObj.getMap()) || Engine['Config'].CC_MAP_RANGE(lpTargetObj.getMap()) ){
					selfdefense = 0;
				}else{
					selfdefense = 1;
				}

				if ( gObjGetRelationShip(lpObj, lpTargetObj) == 2 )	{
					selfdefense = false;
				}
				/*
	#if GS_CASTLE == 1
				if ( g_CastleSiege.GetCastleState() == CASTLESIEGE_STATE_STARTSIEGE )
				{
					if ( lpObj->m_btCsJoinSide > 0 )
					{
						selfdefense = FALSE;
					}
				}
	#endif
	*/
			}else if ( lpTargetObj.Type == 2 && lpObj.Type == 1 ){
				if ( lpTargetObj.m_RecallMon >= 0 ){
					selfdefense = true;
				}
			}

			if ( lpTargetObj.Type == 1 ){
				gObjArmorRandomDurDown(lpTargetObj, lpObj);
			}

			if ( lpTargetObj.m_SkillHarden ){
				lpTargetObj.m_SkillHarden--;

				if ( lpTargetObj.m_SkillHarden <= 0 ){
					lpTargetObj.m_SkillHardenTime = 0;
					lpTargetObj.m_SkillHarden = 0;
					lpTargetObj.m_ViewSkillState &= -33;
					GCMagicCancelSend(lpTargetObj, 51);
				}
			}
		}

		if ( selfdefense == true && bDamageReflect == false ){
			if ( !gObjTargetGuildWarCheck(lpObj, lpCallObj) ){
				gObjCheckSelfDefense(lpObj, lpCallObj.getObjId());
			}
		}

		if ( lpTargetObj.Class == 275 ){	// KUNDUN
		
			if ( lpTargetObj.m_iMonsterBattleDelay <= 0 ){
				if ( (Engine['MonsterAI'].Rand2()%15) < 1 ){
					gObjAddMsgSendDelay(lpTargetObj, 4, lpObj.getObjId(), 100, 0);
					lpTargetObj.m_iMonsterBattleDelay = 10;
					GCActionSend(lpTargetObj, 126, lpTargetObj.getObjId(), lpObj.getObjId());
				}
			}
		}

		if ( lpTargetObj.Class == 131 || Engine['Config'].BC_STATUE_RANGE(lpTargetObj.Class-132) ){
			gObjAddMsgSendDelay(lpTargetObj, 4, lpObj.getObjId(), 100, 0);
			gObjSetPosition(lpTargetObj.getObjId(), lpTargetObj.getX(), lpTargetObj.getY());
		}else if ( AttackDamage >= 5 ){	// To make strong hit
		
			if ( lpTargetObj.Type == 2 ){
				if ( (Engine['MonsterAI'].Rand2()%26) == 0 ){
					gObjAddMsgSendDelay(lpTargetObj,4, lpObj.getObjId(), 100, 0);
				}
			}else if ( (Engine['MonsterAI'].Rand2()%4) == 0 ){
				if ( !gObjUniriaSprite(lpTargetObj) ){
					MSBFlag = 1;
				}
			}
		}

		if ( ManaChange ){
			GCManaSend(lpTargetObj.getObjId(), lpTargetObj.Mana, 0xFF, 0, lpTargetObj.BP);
		}

		if ( magicsend ){
			GCMagicAttackNumberSend(lpObj, skill, lpTargetObj.getObjId(), skillSuccess);
		}

		if ( lpObj.Type == 1 ){
			if ( lpObj.m_Change == 9 )	{
				GCMagicAttackNumberSend(lpObj, 3, lpTargetObj.getObjId(), 1);
			}
		}

		if ( lpObj.Class == 0x3 && lpObj.cLevel == 1 && AttackDamage > 10 ){
			//LogAdd("error-Level1 : [%s][%s] Str:%d %d %d %d %d %d %d",
			//	lpObj->AccountID, lpObj->Name, lpObj->Strength,
			//	lpObj->m_AttackDamageMinRight, lpObj->m_AttackDamageMaxRight,
			//	lpObj->m_AttackDamageMinLeft, lpObj->m_AttackDamageMaxLeft, 
			//	lpObj->m_AttackDamageMax, lpObj->m_AttackDamageMin);
		}

		lpObj.m_Rest = 0;

		if ( AttackDamage > 0 ){
			var atd_reflect = Math.round(AttackDamage * lpTargetObj.DamageReflect / 100.0);

			if ( atd_reflect ){
				gObjAddMsgSendDelay(lpTargetObj, 10, lpObj.getObjId(), 10, atd_reflect);
			}

			if ( (Engine['MonsterAI'].Rand2()%100) < lpObj.SetOpReflectionDamage ){
				gObjAddMsgSendDelay(lpTargetObj, 10, lpObj.getObjId(), 10, AttackDamage);
			}

			if ( bCombo ){
				var iComboDamage = ( Strength + Dexterity + Energy ) / 2;	// #formula
				AttackDamage += iComboDamage;

				if ( lpObj.Type == 1 && lpTargetObj.Type == 1 )	{
					iTempShieldDamage = this.GetShieldDamage(lpObj, lpTargetObj, iComboDamage);
					lpTargetObj.iShield -= iTempShieldDamage;
					lpTargetObj.Life -= iComboDamage - iTempShieldDamage;
					iTotalShieldDamage += iTempShieldDamage;

					if ( lpTargetObj.Life < 0.0 )	{
						lpTargetObj.Life = 0.0;
					}
				}else{
					lpTargetObj.Life -= iComboDamage;

					if ( lpTargetObj.Life < 0.0 ){
						lpTargetObj.Life = 0.0;
					}
				}

				MsgDamage |= 0x80;
				skill = 59;
			}

			if ( (Engine['MonsterAI'].Rand2()%100) < lpObj.SetOpDoubleDamage ){
				if ( skill == 78 ){
					gObjUseSkill.FireScreamExplosionAttack(lpObj, lpTargetObj, AttackDamage);
				}

				if ( lpObj.Type == 1 && lpTargetObj.Type == 1 ){
					iTempShieldDamage = this.GetShieldDamage(lpObj, lpTargetObj, AttackDamage);
					lpTargetObj.iShield -= iTempShieldDamage;
					lpTargetObj.Life -= AttackDamage - iTempShieldDamage;
					iTotalShieldDamage += iTempShieldDamage;
					AttackDamage += AttackDamage;

					if ( lpTargetObj.Life < 0.0){
						lpTargetObj.Life = 0.0;
					}
				}else{
					lpTargetObj.Life -= AttackDamage;
					AttackDamage += AttackDamage;

					if ( lpTargetObj.Life < 0.0)
					{
						lpTargetObj.Life = 0.0;
					}
				}

				MsgDamage |= 0x40;
			}

			if ( Engine['Config'].g_ShieldSystemOn == true ){
				AttackDamage -= iTotalShieldDamage;
			}

			if ( Engine['Config'].g_ShieldSystemOn == false ){
				if ( lpObj.Type == 1 && lpTargetObj.Type == 1 ){
					//if ( CC_MAP_RANGE(lpObj->MapNumber) && CC_MAP_RANGE(lpTargetObj->MapNumber) ){
					//	AttackDamage = AttackDamage * 50 / 100;
					//}
				}
			}

			gObjLifeCheck(lpTargetObj, lpObj, AttackDamage, 0, MSBFlag, MsgDamage, skill, iTotalShieldDamage);

			if ( iTotalShieldDamage > 0 ){
				//ogAddTD("[PvP System] Victim:[%s][%s], Attacker:[%s][%s] - SD[%d] HP[%f] -> SD[%d] HP[%f]",
				//	lpTargetObj->AccountID, lpTargetObj->Name, lpObj->AccountID, lpObj->Name,
				//	lpTargetObj->iShield + iTotalShieldDamage, lpTargetObj->Life + AttackDamage, 
				//	lpTargetObj->iShield, lpTargetObj->Life);
			}
		}else{
			Engine['Protocol'].GCDamageSend(lpObj.getObjId(), lpTargetObj.getObjId(), 0, 0, MsgDamage, 0);
		}

		if ( lpObj.Life <= 0.0 && lpObj.Type == 1 ){
			if ( lpObj.m_CheckLifeTime <= 0 ){
				lpObj.lpAttackObj = lpTargetObj;

				if ( lpTargetObj.Type == 1 ){
					lpObj.m_bAttackerKilled = true;
				}else{
					lpObj.m_bAttackerKilled = false;
				}

				lpObj.m_CheckLifeTime = 3;
			}
		}

		if ( lpMagic ){
			gObjUseSkill.SpecificSkillAdditionTreat(lpObj, lpTargetObj, lpMagic, AttackDamage);
		}

		return true;
	},
	GetTargetDefense: function(lpObj, lpTargetObj, MsgDamage){
		var skilldefense = lpTargetObj.m_SkillDefense;
		var targetdefense = lpTargetObj.m_Defense + skilldefense;

		if ( lpObj.Type == 2 && lpTargetObj.Type == 2 ){
			targetdefense += lpTargetObj.m_ItemOptionExFor380.OpAddDefense / 2;
		}

		targetdefense -= (targetdefense * lpTargetObj.m_SkillMagumReduceDefense)/100;
		
		if ( lpObj.m_MonsterSkillElementInfo.m_iSkillElementDefenseTime > 0 ){
			targetdefense += lpObj.m_MonsterSkillElementInfo.m_iSkillElementDefense;

			if ( targetdefense <0 ){
				targetdefense = 0;
			}

		}

		var percentdamage = 0;

		if ( lpObj.pInventory[7].IsItem() != false )
		{
			percentdamage = lpObj.pInventory[7].IsWingOpGetOnePercentDamage();
		}

		percentdamage += lpObj.SetOpIgnoreDefense;

		if ( percentdamage != 0)
		{
			if ( (Engine['MonsterAI'].Rand2()%100) <= percentdamage)
			{
				targetdefense = 0;
				MsgDamage = 1;
			}
		}

		return targetdefense;
	},
	GetAttackDamageWizard: function(lpObj,targetDefense, lpMagic, effect, bIsOnDuel){
		if ( Engine['Config'].g_ShieldSystemOn == true ){
			if ( bIsOnDuel == true ){
				bIsOnDuel = false;
			}
		}

		var damagemin;
		var damagemax;
		var ad;

		if ( lpMagic.m_Skill == 40 ){
			if ( lpObj.SkillHellFire2Count >= 0 ){
				var SkillHellFire2CountDamageTable =[
					0,	20,	50,	99,	160,
					225,	325,	425,	550,	700,
					880,	1090,	1320
				];
				var CountDamage;

				if ( lpObj.SkillHellFire2Count > 12 ){
					CountDamage = 0;
				}else{
					CountDamage = SkillHellFire2CountDamageTable[lpObj.SkillHellFire2Count];
				}

				ad = ( lpObj.Strength + lpObj.AddStrength ) / 2 + CountDamage;
				damagemin = ad + lpObj.m_MagicDamageMin;
				damagemax = ad + lpObj.m_MagicDamageMax;

				damagemin += lpObj.SetOpAddSkillAttack;
				damagemax += lpObj.SetOpAddSkillAttack;

				//int SkillAttr = MagicDamageC.GetSkillAttr(lpMagic.m_Skill);
				var SkillAttr = 1;
				if ( SkillAttr != -1 ){
					damagemin += lpObj.m_AddResistance[SkillAttr];
					damagemax += lpObj.m_AddResistance[SkillAttr];
				}

				damagemin += lpObj.m_JewelOfHarmonyEffect.HJOpAddSkillAttack;
				damagemax += lpObj.m_JewelOfHarmonyEffect.HJOpAddSkillAttack;
			}
		}else{
			ad = lpMagic.GetDamage();

			damagemin = lpMagic.m_DamageMin + lpOb.m_MagicDamageMin;
			damagemax = lpMagic.m_DamageMax + lpObj.m_MagicDamageMax;

			damagemin += lpObj.SetOpAddSkillAttack;
			damagemax += lpObj.SetOpAddSkillAttack;

			//int SkillAttr = MagicDamageC.GetSkillAttr(lpMagic->m_Skill);
			SkillAttr = 1;
			if ( SkillAttr != -1 ){
				damagemin += lpObj.m_AddResistance[SkillAttr];
				damagemax += lpObj.m_AddResistance[SkillAttr];
			}

			damagemin += lpObj.m_JewelOfHarmonyEffect.HJOpAddSkillAttack;
			damagemax += lpObj.m_JewelOfHarmonyEffect.HJOpAddSkillAttack;
		}

		var Right = lpObj.pInventory[0];

		if ( Right.IsItem() ){
			if ( (Right.m_Type >= ITEMGET(5,0) && Right.m_Type < ITEMGET(6,0) ) ||
				 Right.m_Type == ITEMGET(0,31) ||
				 Right.m_Type == ITEMGET(0,21) ||
				 Right.m_Type == ITEMGET(0,23) ||
				 Right.m_Type == ITEMGET(0,25) ){
					if ( Right.m_IsValidItem  ){
						var damage = Right.m_Magic / 2 + Right.m_Level * 2;	// #formula
						damage -= (Right.m_CurrentDurabilityState * damage);	// #formula

						damagemin += damagemin * damage / 100;	// #formula
						damagemax += damagemax * damage / 100;	// #formula
				}
			}
		}

		var subd = damagemax - damagemin;

		
		if ( bIsOnDuel ){
			ad = ( damagemin + (Engine['MonsterAI'].Rand2()%(subd+1)) ) * 60 / 100 - targetDefense;	// #formula
		}else{
			ad = ( damagemin + (Engine['MonsterAI'].Rand2()%(subd+1)) ) - targetDefense;
		}
			if ( lpObj.m_CriticalDamage > 0 )
			{
				if ( (Engine['MonsterAI'].Rand2()%100) < lpObj.m_CriticalDamage )
				{
					if ( bIsOnDuel )
					{
						ad = damagemax * 60 / 100 - targetDefense;
					}
					else
					{
						ad = damagemax - targetDefense;
					}

					ad += lpObj.SetOpAddCriticalDamage;
					ad += lpObj.m_JewelOfHarmonyEffect.HJOpAddCriticalDamage;
					ad += lpObj.SkillAddCriticalDamage;
					effect = 3;
				}
			}

			if ( lpObj.m_ExcelentDamage > 0 )
			{
				if ( (Engine['MonsterAI'].Rand2()%100) < lpObj.m_ExcelentDamage )
				{
					if ( bIsOnDuel )
					{
						ad = damagemax * 60 / 100 - targetDefense;
					}
					else
					{
						ad = damagemax - targetDefense;
					}

					ad += damagemax * 20 / 100;
					ad += lpObj.SetOpAddExDamage;
					effect = 2;
				}
			}
		

		ad += lpObj.m_SkillAttack;

		if ( lpObj.m_SkillAttack2 )
		{
			ad += 10;
		}

		return ad;
	}

}


exports.Init = function(E){ Engine = E; return TMAttack;}