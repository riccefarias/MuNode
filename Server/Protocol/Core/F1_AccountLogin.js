
var	Decryption = require('../decryptor.js');

var Engine = {};

var ProtoCore = {
	Code: 0xF1,
	Proccess: function(aIndex,data){
		switch(data[1]){
			case 0x01:{
				
				data = Decryption.Dec3bit(data,2, 10);
				data = Decryption.Dec3bit(data,12, 10);
				_use = Decryption.readS(data,2, 10);
				_pas = Decryption.readS(data,12, 10);
				_ser = Decryption.readS(data,31, 16);
	     				
				_pc = Decryption.readS(data,47, 39);
				
				console.log(data);
				console.log(data.toString());
				
				status = 0x00;
							
							
				console.log("Login..."+_use+" "+_pas+" "+_ser);
				Engine.DataServer.Login(_use,_pas,function(r){
					switch(r[0]){
						case -1:
							status = 0x02;
						break;
						case -2:
							status = 0x00;
						break;
						case 1:
							if(r[2]==1){
								status = 0x05;
							}else{
								
								status = 0x01;
								Engine.ObjectManager.get(aIndex).setAccount(_use,r[1]);
							}
						break;
					}
					
					
					var response = new Buffer([0xC1,0x05,0xF1,0x01,status,0x00]);
					
					Engine['WS'].send({cmd: 'LGN',Id: aIndex,Account: _use,Response: status});
					
					Engine.ObjectManager.DataSend(aIndex,response);
					
					
					
				});
			}
			break;
			case 0x02:{
				//logout
			}
			break;
			case 0x03:{
				
			}
			
		}
	}
}

exports.Init = function(E){ Engine = E; return ProtoCore; };