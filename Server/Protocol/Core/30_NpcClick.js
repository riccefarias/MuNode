

var Engine = {};

var stepDirections = [-1, -1, 0, -1, 1, -1, 1, 0,
		1, 1, 0, 1, -1, 1, -1, 0 ];
		

var ProtoCore = {
	Code: 0x30,
	Proccess: function(aIndex,data){
		
				
				var me = Engine.ObjectManager.get(aIndex);
				
				//me.m_State = 2;
				
				
				var pId  = data[2];
				    pId |= (data[1] << 8);
					
				console.log("Click on: "+pId);
					
				
	}
}

exports.Init = function(E){ Engine = E; return ProtoCore; };