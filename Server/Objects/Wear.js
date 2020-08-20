
var Engine = {};


function ObjWear(pclass,items){
	
	this.iLevels = [0,0,0,0,0,0,0,0];
  	this.iExc = [0,0,0,0,0,0,0,0];
  	var index = 0;
	
	
	
	var _CharSet = new Buffer([pclass,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	
	
	
	// mão esquerda
  	if(items[0]!=undefined){
		var itm = items[0];
  	    var itemCode = itm.group*512 + itm.index;
      			
      	_CharSet[1] =   (itemCode & 0xFF);
      	_CharSet[12] |= ((itemCode & (15<<8)) >> 4);

      	this.iLevels[0] =  this.getLevelSmall(itm.level);
  	}else{
		_CharSet[1] = -1;
  	    _CharSet[12] |= 0xF0;
  	}
	// mão direita
  	if(items[1]!=undefined){
		var itm = items[1];
  	    var itemCode = itm.group*512 + itm.index;
      			
      	_CharSet[2] =   (itemCode & 0xFF);
      	_CharSet[13] |= ((itemCode & (15<<8)) >> 4);

      	this.iLevels[1] =  this.getLevelSmall(itm.level);
  	}else{
		_CharSet[2] = -1;
  	    _CharSet[13] |= 0xF0;
  	}
	
	
	// helm
  	if(items[2]!=undefined){
		var itm = items[2];
  	    var itemCode = itm.group*512 + itm.index & 0xFF;
      			
      	index = (itemCode & 0x0F) * 16;
      	_CharSet[9] |= this.setItem(itemCode,2);
		this.iLevels[2] = this.getLevelSmall(itm.level);
  	}else{
		
  	    index = 0xF0;
  	    _CharSet[9] |= 0x80;
  	    _CharSet[13] |= 0x0F;
  	}
	
	// armor
	if(items[3]!=undefined){
		var itm = items[3];
  	    var itemCode = (itm.group*512 + itm.index) & 0xFF;
		
		index |= (itemCode & 0x0F);
		_CharSet[9] |= this.setItem(itemCode,3);
      	this.iLevels[3] = this.getLevelSmall(itm.level);
  	}else{
  	    index |= 0x0F;
  	    _CharSet[9] |= 0x40;
  	    _CharSet[14] |= 0xF0;
  	 }
  	        
  	_CharSet[3] = index;
	
	// pants
  	if(items[4]!=undefined){
		var itm = items[4];
  	    var itemCode = itm.group*512 + itm.index;
		
      	index = (itemCode & 0x0F) * 16;
      	_CharSet[9] |= this.setItem(itemCode,4);
      	this.iLevels[4] = this.getLevelSmall(itm.level);
  	}else{
  	    index = 0xF0;
  	    _CharSet[9] |= 0x20;
  	    _CharSet[14] |= 0x0F;
  	}   
	
  	// gloves
  	if(items[5]!=undefined){
		var itm = items[5];
  	    var itemCode = itm.group*512 + itm.index;
		
		index |= (itemCode & 0x0F);
		_CharSet[9] |= this.setItem(itemCode,5);
		this.iLevels[5] = this.getLevelSmall(itm.level);
		
  	}else{
  	    index |= 0x0F;
  	    _CharSet[9] |=0x10;
  	    _CharSet[15] |= 0xF0;
  	}

  	_CharSet[4] = index;
  	        
  	// boots
  	if(items[6]!=undefined){
		var itm = items[6];
  	    var itemCode = itm.group*512 + itm.index;
		
		index = (itemCode & 0x0F) * 16;
		_CharSet[9] |= this.setItem(itemCode,6);
		this.iLevels[6] = this.getLevelSmall(itm.level);
  	}else{
  	    index = 0xF0;
  	    _CharSet[9] |= 0x08;
  	     _CharSet[15] |= 0x0F;
  	}   
  	       
  	// wings
  	if(items[7]!=undefined){
		var itm = items[7];
  	    var itemCode = itm.group*512 + itm.index;
		
  	        	
  	    switch(itemCode){
	        case 0:{
  	        	index |= 0x00;
	        }
			break;
			case 1:{
  	        	index |= 0x04;
			}
			break;
			case 2:{
				index |= 0x08;
			}
			break;
  	        case 3:{
  	        	index |= 0x0C;
  	        	_CharSet[9] |= 0x01;
  	        }

  	        case 4:{
  	        	index |= 0x0C;
  	        	_CharSet[9] |= 0x02;
  	        }

  	        case 5:{
  	        	index |= 0x0C;
  	        	_CharSet[9] |= 0x03;
  	        }

  	        case 6:{
  	        	index |= 0x0C;
  	        	_CharSet[9] |= 0x04;
  	        }

  	        case 30:{
  	        	index |= 0x0C;
  	        	_CharSet[9] |= 0x05;
  	        }
  	        default:{
  	    	    index |= 0x0C;
  	        }
			break;
  	    }
      			//index |= (itemCode & 0x03) * 4;
      			//_CharSet[5] |= setItem(itemCode,7);
  	        	
  	        	//index |= 0x18 & 0x03;
  	}else{
  	    index |= 0x0C;
  	}
	
	
	// pet
  	if(items[8]!=undefined){
		var itm = items[8];
  	    var itemCode = itm.group*512 + itm.index;
  	        	
  	        	// 0x00 - angel
  	        	// 0x01 - satan
  	        	
  	        	//index |= 0x02;
  	        	

	        	//index |= 0x00;
	        	//_CharSet[10] |= 0x01;
  	        	
  	    switch(itemCode){
	  	    case 0:{
	  	        index |= 0x00;
	  	    }
	  	    break;
	  	    case 1:{
				index |= 0x01;
	  	    }
	  	    break;
	  	    case 2:{
	  	        index |= 0x02;
	  	    }
	  	    case 3:{
				index |= 0x3;
	  	        _CharSet[10] |= 0x01;
	  	    }
	  	    case 4:{
				index |= 0x3;
	  	        _CharSet[12] |= 0x01;
	  	    }
	  	    case 37:{
	  	        index |= 0x3;
	  	        _CharSet[10] &= 0xFE;
	  	        _CharSet[12] &= 0xFE;
	  	        _CharSet[12] |= 0x04;
	  	        _CharSet[17] = 0;
	  	        		
	  	        _CharSet[16] |= 0x01; // ver tipos de fenrir
	  	    }
	  	    break;
	  	    default:{
				index |= 0x03;
	  	    }
	  	    break;
  	    }
  	        	
  	}else{
  	    index |= 0x03;
  	}
	
	
  	_CharSet[5] = index;
	
	
  	var levelindex = this.iLevels[0];
		levelindex |= this.iLevels[1] << 3;
		levelindex |= this.iLevels[2] << 6;
		levelindex |= this.iLevels[3] << 9;
		levelindex |= this.iLevels[4] << 12;
		levelindex |= this.iLevels[5] << 15;
		levelindex |= this.iLevels[6] << 18;
			
		_CharSet[6] =  (levelindex >> 16 & 0xFF);
		_CharSet[7] =  ((levelindex >> 8) & 0xFF);
		_CharSet[8] =  ((levelindex ) & 0xFF);
  	        
  	        
		//_CharSet[10] |= 0xFE; // glow exc
		//_CharSet[11] = 255; // glow set?
	
	
	return _CharSet;
}

ObjWear.prototype.setItem= function(t,p){
			switch(p){
				case 2:{
					return ((t & 0x10)<<3);
				}
				case 3:{
					return ((t & 0x10)<<2);
				}
				case 4:{
					return ((t & 0x10)<<1);
				}
				case 5:{
					return ((t & 0x10));
				}
				case 6:{
					return ((t & 0x10)>>1);
				}

				case 7:{
					return ((t & 0x03)<<2);
				}

				case 8:{
					return ((t & 0x03));
				}
				default:
					return 0;
			}
}

ObjWear.prototype.getLevelSmall = function(level){
			if(level >= 13){
				return 7;
			}

			if(level==12){
				return 6;
			}

			if(level == 11){
				return 5;
			}

			if(level >= 9 && level <= 10){
				return 4;
			}

			if(level >= 7 && level <= 8){
				return 3;
			}

			if(level >= 5 && level <= 6){
				return 2;
			}
			
			if(level >= 3 && level <= 4){
				return 1;
			}
			
			return 0;
		}





exports.Init = function(E){ Engine = E; return ObjWear};