var Engine = {};


var Logger = {
	Proccess: function(msg){
		
		var sobra = (79 - (msg.length)) / 2;
		var sobraLeft = Math.ceil(sobra);
		var sobraRight = Math.floor(sobra);
		var spacerLeft = "";
		var spacerRight = "";
		var i = 0;
		while(i<sobraLeft){
			spacerLeft+=" ";
			i++;		
		}
		
		var i = 0;
		while(i<sobraRight){
			spacerRight+=" ";
			i++;		
		}
		
		var newMsg = spacerLeft+""+msg+""+spacerRight;
		
		return newMsg;
	},
	Proccess2: function(msg){
		
		var sobra = (77 - (msg.length));
		var spacerRight = "";
		
		
		var i = 0;
		while(i<sobra){
			spacerRight+=" ";
			i++;		
		}
		
		var newMsg = "  "+msg+""+spacerRight;
		
		return newMsg;
	},
	Post: function(msg){
		
		
		console.log(Engine.Colors.bgGreen.white(this.Proccess("")));
		console.log(Engine.Colors.bgGreen.white(this.Proccess(msg)));
		console.log(Engine.Colors.bgGreen.white(this.Proccess("")));
	},
	Add: function(msg,color){
		switch(color){
			default:
				console.log(Engine.Colors.bgYellow.red(this.Proccess2(msg)));
		}
	}
}

exports.Init = function(E){ Engine = E; return Logger; }