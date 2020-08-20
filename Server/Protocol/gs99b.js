
var Decryption = require('./decryptor.js');
var DataServer = require('../DataServer/MySql.js');

var fs = require('fs');

var CoreCode = {};

fs.readdir("./Protocol/Core/",function(err,files){
	for(var I in files){
		console.log("LoadModule: "+files[I]);
	
		var temp = require("./Core/"+files[I]);
		CoreCode[temp.Code] = temp.Proccess;
	}

});

var v99b = {
		handshake: function(id){
			var vv= Buffer.concat([new Buffer([0xC1,0x0C,0xF1,0x00,(0x01 & 0xFF),(id >> 8),(id)]),new Buffer("09928"),new Buffer([0x00])]);
			
			return vv;
		},
		Core: function(aIndex,data){
			
			if(CoreCode[data[0]]){
				CoreCode[data[0]](aIndex,data);
			}else{
				console.log("Invalid Packet "+data[0]);
			}
			
			/*switch(data[0]){
				case 0xF1:{
					
				}
			}*/
			
			
			
		}
}


module.exports = v99b;