var net = require('net');

var Engine = {};



var PLAYER_VIEW_RANGE = 5;
var MAX_ITEM_MAP = 300;


function ObjWorld(mapId,mapName,TerrainId){
	TerrainId = ((TerrainId==undefined)?mapId:TerrainId);
	console.log(Engine.Colors.green("[GameServer] Create map (#"+mapId+") "+mapName));
	this.mapName = mapName;
	this.mapId = mapId;
	this.objInMap = {}; 
	this.itmInMap = [];
	this._regions = {};
	this._terrain = Engine['Config'].LoadMap(TerrainId);
	
	
	var ix = 0;
	while(ix<86){
		var iy = 0;
		while(iy<86){
			if(this._regions[ix]==undefined){
				this._regions[ix] = {};
			}
			this._regions[ix][iy] = new Engine.MuRegion();
			iy++;
		}
		ix++
	}
	
	console.log(Engine.Colors.green("[GameServer] Map created (#"+mapId+") "+mapName));
}


ObjWorld.prototype.GetRandomItemDropLocation = function(cX, cY, iRangeX,iRangeY,iLoopCount){
	var iUX = cX;
	var iUY = cY;

	if ( iRangeX <= 0 ){
		iRangeX = 1;
	}

	if ( iRangeY <= 0 ){
		iRangeY = 1;
	}

	if ( iLoopCount <= 0 ){
		iLoopCount = 1;
	}

	while ( iLoopCount-- > 0 ){
		cX = ( Engine['MonsterAI'].Rand2() % (iRangeX+1) ) * (((Engine['MonsterAI'].Rand2()%2==0)?-1:1)) + iUX;
		cY = ( Engine['MonsterAI'].Rand2() % (iRangeY+1) ) * (((Engine['MonsterAI'].Rand2()%2==0)?-1:1)) + iUY;

		var attr = this.GetAttr(cX, cY);

		if ( (attr&4) != 4 && (attr&8) != 8){
			return {X: cX,Y: cY};
		}
	}

	return false;
}


ObjWorld.prototype.checkViewport = function(aIndex,x,y){
	var lpObj = Engine.ObjectManager.get(aIndex);
	var x1 = Math.floor(lpObj.getX()/3) - PLAYER_VIEW_RANGE - 1;
	var x2 = Math.floor(lpObj.getX()/3) + PLAYER_VIEW_RANGE + 1;
	var y1 = Math.floor(lpObj.getY()/3) - PLAYER_VIEW_RANGE - 1;
	var y2 = Math.floor(lpObj.getY()/3) + PLAYER_VIEW_RANGE + 1;
	
	
	var x3 = Math.floor(x/3);
	var y3 = Math.floor(y/3);
				
	if (x1 < 0) {
		x1 = 0;
	}
	if (y1 < 0) {
		y1 = 0;
	}
	if (y3 < 0) {
		y3 = 0;
	}
	if (x2 > 85) {
		x2 = 85;
	}
	if (y2 > 85) {
		y2 = 85;
	}
	if (y3 > 85) {
		y3 = 85;
	}
	if((x1<=x3) && (x2>=x3) && (y1<=y3) && (y2>=y3)){
		return true;
	}else{
		
	//console.log("X: "+x1+"<="+x3+"=>"+x2);
	//console.log("Y: "+y1+"<="+y3+"=>"+y2);
		
		return false;
	}
}

ObjWorld.prototype.GetAttr = function(x,y){
	if ( x < 0 ){
		return 4;
	}

	if ( y < 0 ){
		return 4;
	}

	if ( x > 255 ){
		return 4;
	}

	if ( y > 255 ){
		return 4;
	}

	return this._terrain[x][y];

}

ObjWorld.prototype.GetStandAttr = function(x,y){
	if ( x > 255 ){
		return false;
	}

	if ( y > 255 ){
		return false;
	}

	var attr = this._terrain[x][y];

	if ( (attr&2) == 2 ){
		return false;
	}

	if ( (attr&4) == 4 ){
		return false;
	}

	if ( (attr&8) == 8 ){
		return false;
	}

	return true;
}

ObjWorld.prototype.CheckWall = function(sx1, sy1, sx2, sy2){
	
	var _sx = 0;
	var _st = 0;
	var _fx = 0;
	var _fy = 0;

	if(sx1<sx2){
		_sx = sx1;
		_fx = sx2;
	}else{
		_sx = sx2;
		_fx = sx1;
	}

	if(sy1<sy2){
		_sy = sy1;
		_fy = sy2;
	}else{
		_sy = sy2;
		_fy = sy1;
	}

	while(_sx<_fx){
		while(_sy<_fy){
			if((this._terrain[_sx][_sy]&4)==4){
				return false;
			}
			_sy++;
		}
		_sx++;
	}

	return true;
}

ObjWorld.prototype.getItem = function(id){
	return this._itmInMap[id];
}

ObjWorld.prototype.dropItem = function(){
		if(this.itmInMap.length<MAX_ITEM_MAP){
			
			//var item = new Item();
			var item = {};
			this.itmInMap.push(item);
			this.addObject(item);
		}
}

ObjWorld.prototype.addObject = function(rObj){
	
	var x = rObj.getX();
	var y = rObj.getY();
	
			
			//rObj._streamId = makeStreamId();
			//rObj.lastUpdate = new Date().getTime();
			
	if (this.objInMap[rObj.getObjId()]!=undefined) {
		// o cara ja ta no mapa
		if(rObj.getType()==0){
				//sendMeeting(rObj,x, y,false);
		}
		return false;
	}
	
	this.objInMap[rObj.getObjId()] = rObj;
	//_allPcs.put(rObj.getObjId(), rObj);
	
	if(this._regions[Math.round(x/3)]==undefined){
		this._regions[Math.round(x/3)] = {};
	}
	if(this._regions[Math.round(x/3)][Math.round(y/3)]==undefined){
		this._regions[Math.round(x/3)][Math.round(y/3)] = new MuRegion();
	}
			
	this._regions[Math.round(x/3)][Math.round(y/3)].addObject(rObj);
			
			
//	System.out.println("[World]["+_mapName+"]["+_addName+"] adicionado em ("+(x/3)+","+(y/3)+")");
	return true;
}

ObjWorld.prototype.updateObj = function(lpObj){
	var x1 = Math.round(lpObj.getX() / 3);
	var y1 = Math.round(lpObj.getY() / 3);
	var x2 = Math.round(lpObj.getOldX() / 3);
	var y2 = Math.round(lpObj.getOldY() / 3);
			
	
	if ((x1 == x2) && (y1 == y2)) {
		 // se continuar no mesmo mapPoint apenas envia o "moove"
				
		//System.out.println("Mesmo POINT");
		return true;
	}
			

	
	this._regions[x2][y2].removeObject(lpObj);
	this._regions[x1][y1].addObject(lpObj);
			
	return true;
}

ObjWorld.prototype.getViews = function(x,y){
	var objectResult = [];
	
	var x1 = Math.floor(x/3) - PLAYER_VIEW_RANGE;
	var x2 = Math.floor(x/3) + PLAYER_VIEW_RANGE;
	var y1 = Math.floor(y/3) - PLAYER_VIEW_RANGE;
	var y2 = Math.floor(y/3) + PLAYER_VIEW_RANGE;
				
	if (x1 < 0) {
		x1 = 0;
	}
	if (y1 < 0) {
		y1 = 0;
	}
	if (x2 > 85) {
		x2 = 85;
	}
	if (y2 > 85) {
		y2 = 85;
	}
	for (var i = x1; i <= x2; i++) {
		for (var j = y1; j <= y2; j++) {
			//console.log("Varredura em "+i+","+j);
			
			var temp = this._regions[i][j].getObjects();
			
			for(var tp in temp){
				objectResult.push(temp[tp]);
			}
			
		}
	}
	
	
	return objectResult;
	
}



function Init(E){
	Engine = E;
	
	
	return ObjWorld;
}


exports.Init = Init;