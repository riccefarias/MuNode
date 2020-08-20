
var Engine = {};

var PLAYER_VIEW_RANGE = 3;

function ObjRegion(){
	this._objects = [];
}

ObjRegion.prototype.addObject = function(lpObj){
		//System.out.println("ADICIONADO "+obj._streamId);
	
	console.log(lpObj.getName()+" adicionado em "+lpObj.getX()+","+lpObj.getY());	
	
	this._objects.push(lpObj);
	
	return this._objects.length;
	
}


ObjRegion.prototype.removeObject = function(lpObj){
	for(var o in this._objects){
		if(this._objects[o] == lpObj){
			delete this._objects[o] ;
			
			return;
		}
	}
}

ObjRegion.prototype.getObjects = function(){
	return this._objects;
}




exports.Init = function(E){ Engine = E; return ObjRegion ; }