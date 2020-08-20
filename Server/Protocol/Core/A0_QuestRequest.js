

var Engine = {};



var ProtoCore = {
	Code: 0xA0,
	Proccess: function(aIndex,data){
		
				var me = Engine.ObjectManager.get(aIndex);
				
				var response = new Buffer([0xC1,0x05,0xA0,0x03,0xFF]);
				
				me.send(response);
	}
}

exports.Init = function(E){ Engine = E; return ProtoCore; };