

var Engine = {};

var stepDirections = [-1, -1, 0, -1, 1, -1, 1, 0,
		1, 1, 0, 1, -1, 1, -1, 0 ];
		

var ProtoCore = {
	Code: 0x18,
	Proccess: function(aIndex,data){
		
				
				var me = Engine.ObjectManager.get(aIndex);
				console.log("Direction: [");
				console.log(data);
				console.log("]");
				
				
					
				var response = new Buffer([0xC1,0x07,0x18,(((me.getObjId() >> 8) & 0xFF)) ,
												((me.getObjId()) & 0xFF ),data[1],data[2]]);
												
												
				Engine.ObjectManager.DataSendV2(me,response);

	}
}

exports.Init = function(E){ Engine = E; return ProtoCore; };