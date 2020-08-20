

var Engine = {};

var stepDirections = [-1, -1, 0, -1, 1, -1, 1, 0,
		1, 1, 0, 1, -1, 1, -1, 0 ];
		

var ProtoCore = {
	Code: 0xD7,
	Proccess: function(aIndex,data){
		
				
				var me = Engine.ObjectManager.get(aIndex);
				
				var _x = (data[1] & 0xff);
				var _y = (data[2] & 0xff);
				
				var stepCount = (data[3] & 0x0F);
				if (stepCount <= 15) {
					var headingDirection = ((data[3] >> 4) & 0x0F); // where
																			// char
																			// will
																			// head
																			// after
																			// completing
																			// walk
					var stepDirection = 0;
					for (var i = 0; i < stepCount; i++) {
						if ((i % 2) == 0) {
							stepDirection = ((data[4 + Math.floor(i / 2)] >> 4));
						} else {
							stepDirection = (data[4 + Math.floor(i / 2)] & 0x0F);
						}
						
						
						_x += stepDirections[stepDirection * 2];
						_y += stepDirections[(stepDirection * 2) + 1];
						
						
						console.log("STEP ("+data[4 + Math.floor(i / 2)]+"): "+stepDirection+" "+stepDirections[stepDirection * 2]+" "+stepDirections[(stepDirection * 2) +1]);
						console.log("XY: "+_x+" "+_y);
					}

				
				
					me.setXY(_x,_y,headingDirection);
					
					var response = new Buffer([0xC1,0x08,0xD3,(((me.getObjId() >> 8) & 0xFF)) ,
													((me.getObjId()) & 0xFF ),_x,_y,(headingDirection << 4)]);
					
					Engine.ObjectManager.DataSend(aIndex,response);
					//Engine.ObjectManager.DataSendV2(me,response);
					
					
					/*out.writeByte(0xC1);
					out.writeByte(0x08);
					out.writeByte(0xD3);
					
					out.writeShort(aIndex);

					out.writeByte(_x);
					out.writeByte(_y);
					out.writeByte(headingDirection << 4);
					
					
					*/
				}
					
				
				
				//var response = Buffer.concat([new Buffer([0xC1,(msg.length+14),0x00]),name,new Buffer(msg),new Buffer([0x00])]);
					
			
				
				//ObjectManager.DataSend(aIndex,response);

	}
}

exports.Init = function(E){ Engine = E; return ProtoCore; };