
var Engine = {};




var TMSoccer= {
	GetBattleSoccerGoalMove: function(ground){
	if ( (ground<0) || (ground>1) ){
		return 0;
	}

	//return gBSGround[ground]->GetGoalMove();
	}
}



exports.Init = function(E){ Engine = E; return TMSoccer;}