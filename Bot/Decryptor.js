var net = require('net');
var trim = require('trim');


var C2Keys = [0xE7, 0x6D, 0x3A, 0x89,
			0xBC, 0xB2, 0x9F, 0x73, 0x23, 0xA8,
			0xFE, 0xB6, 0x49, 0x5D, 0x39, 0x5D, 0x8A,
			0xCB, 0x63, 0x8D, 0xEA, 0x7D, 0x2B, 0x5F,
			0xC3, 0xB1, 0xE9, 0x83, 0x29, 0x51,
			0xE8, 0x56 ];
			
			
var LoginKeys=[0xFC, 0xCF, 0xAB];

var Decryptor = {
	dec: function(buf,pos) {
	  	var a = new Buffer(buf.length);

	  	a[0] = buf[0];
		var t = 0;

	  	var b = pos + 1;
	  	for (var i = 0; i < (buf.length - 1); i++, b++) {

	  		if (b >= 32) {
	  			b = 0;
	  		}
	  		t = this.dec1(buf[i], buf[i + 1], b);
	  		a[i + 1] = t;

	  	}

	  	return a;

	},
	enc: function(buf,pos) {
	  	//var a = new Buffer(buf.length);

	  //	a[0] = buf[0];
		//var t = 0;
		len = buf.length;
		for( var p =1; p < len; ++p){
			buf[p] ^= buf[p-1] ^ C2Keys[(p+pos) %32];
		}
	  	return buf;

	},
	dec1: function(a, n, pos) {
	  		var t =  (a ^ C2Keys[pos]);
	  		var t2 = (n ^ t);
	  		return t2;
	},
	Dec3bit: function(_decrypt, start, len) {
	  		for (var i = start; i < start + len; i++) {
	  			_decrypt[i] = (_decrypt[i] ^ LoginKeys[(i - start) % 3]);
	  		}
			
			return _decrypt;
	},
	readS: function(_decrypt, _from, to) {
  		
  		try {
			
			//var end = _decrypt.indexOf(new Buffer([0x00]));
			
			//console.log("END: "+end);
			var c = 0;
			var off = -1;
			while(c<to){
				if(_decrypt[_from+c]==0x00){
					var off = c;
					break;
				}
				c++;
			}
			
			if(off>-1){
				to = off;
			}
			
			
			var result = new Buffer((to));
			_decrypt.copy(result,0,_from,(_from+to));
			
			
			
			return result.toString();
  		} catch (e) {
			console.log(e);
  			result = "";
  		}

  		return result;
  	}
}


module.exports = Decryptor;