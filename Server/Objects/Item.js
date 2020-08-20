var Engine = {};



function ObjItem(group,index,iLevel,iDur,iLuck,iSkill,iOption,iExc,iSerial){
	
	this._iHex = new Buffer(7);
	
	this.iType = ((group * 512) + index);
	
	this._iGroup = group;
	this._iIndex = index;
	this._iLevel = iLevel;
	this._iDur = iDur;
	this._iLuck = iLuck;
	this._iSkill = iSkill;
	this._iOption = iOption;
	this._iExc = ((iExc)?iExc:[0,0,0,0,0,0]);
	this._iSerial = iSerial;

	
	
	return this;
}
ObjItem.prototype.IsItem = function(){
	return true;
}

ObjItem.prototype.createHex = function(){
		var mType = ((this._iGroup * 512) + this._iIndex);
		

		this._iHex[0] = (mType & 0xFF);
		
			
		this._iHex[1] =  (this._iLevel * 8);
		this._iHex[1] += ((this._iSkill==1)?128:0);
		this._iHex[1] += ((this._iLuck==1)?4: 0);
		this._iHex[1] += this._iOption & 3;
		
			
		this._iHex[2] = (this._iDur);
			

		this._iHex[3] = ((mType & 0x100) >> 1);

		this._iHex[3] += ((this._iOption >=4)?64:0);

		this._iHex[3] += ((this._iExc[0] == 1)?32:0);
		this._iHex[3] += ((this._iExc[1] == 1)?16:0);
		this._iHex[3] += ((this._iExc[2] == 1)?8:0);
		this._iHex[3] += ((this._iExc[3] == 1)?4:0);
		this._iHex[3] += ((this._iExc[4] == 1)?2:0);
		this._iHex[3] += ((this._iExc[5] == 1)?1:0);

		this._iHex[5] = ((mType & 0x1E00) >> 5);
}

ObjItem.prototype.getHex = function(){
	
	this.createHex();
	
	return this._iHex;
	
}





exports.Init = function(E){ Engine = E; return ObjItem};