var net = require('net');
var mysql      = require('mysql');

var Engine = {};

var sql = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : 'aiwprton',
		database: 'muonline'
});


sql.connect(function(err){
	if (err) {
		console.error('error connecting: ' + err.stack);
		return;
	}
});

var DataServer = {
	Login: function(u,p,c){
		sql.query("SELECT * FROM tbl_accounts WHERE username='"+u+"' LIMIT 1", function(err, rows) {
			if(rows.length==1){
				if(rows[0].password==p){
					c([1,rows[0].id,rows[0].status]);
				}else{					
					c([-2]);
				}
			}else{
				c([-1]);
			}
		});
	},
	LoadInventory: function(ch,cb){
		sql.query("SELECT * FROM tbl_inventory WHERE name='"+ch+"' ORDER BY slot ASC LIMIT 76", function(err, rows) {
				var items = {};
				for(var i in rows){
					items[rows[i].slot] = {slot: rows[i].slot,group: rows[i].igroup,index: rows[i].iindex,level: rows[i].ilevel,dur: rows[i].dur};
				}
				cb(items);
		});
	},
	LoadInventoryWear: function(ch,cb){
		sql.query("SELECT * FROM tbl_inventory WHERE name='"+ch+"' AND slot<12 ORDER BY slot ASC LIMIT 12", function(err, rows) {
				var items = {};
				for(var i in rows){
					items[rows[i].slot] = {slot: rows[i].slot,group: rows[i].igroup,index: rows[i].iindex,level: rows[i].ilevel};
				}
				cb(items);
		});
	},
	LoadMyGuild: function(ch,cb){
		sql.query("SELECT * FROM tbl_guild_member WHERE name='"+ch+"' ORDER BY id ASC LIMIT 1", function(err, rows) {
				var gData = [];
				for(var i in rows){
					gData = {GuildId: rows[i].gid,GuildStatus: rows[i].status};
				}
				cb(gData);
		});
	},
	LoadGuildInfo: function(gId,cb){
		sql.query("SELECT * FROM tbl_guilds WHERE id='"+gId+"' ORDER BY id ASC LIMIT 1", function(err, grows) {
			if(grows.length==1){
				sql.query("SELECT * FROM tbl_guild_member WHERE gid='"+gId+"' ORDER BY status DESC LIMIT 100", function(err, rows) {
					
					var members = [];
					for(var m in rows){
						members.push({Name: rows[m].name,Status: rows[m].status,Server: -1});
					}
					
					
					var gInfo = {	gId: grows[0].id,
							gName: grows[0].gName,
							gMark: grows[0].gMark,
							gScore: grows[0].gScore,
							gUnion: grows[0].gAliance,
							gHostility: rows[0].gHostility,
							gMembers: members};
							
					cb(gInfo);
							
				});
							
			}else{
				cb(false);
			}
		});
		
	},
	LoadInventoryMulti: function(cList,next,cb){
		
		console.log(cList);
		console.log(next);
		
		var gl = this;
		if(next>=cList.length){
			cb(cList);
		}else{
			this.LoadInventoryWear(cList[next].name,function(items){
				cList[next].inventory = items;
				
				gl.LoadInventoryMulti(cList,(next+1),cb);
			});
		}
	},
	LoadCharacters: function(u,c){
		var gl = this;
		sql.query("SELECT * FROM tbl_characters WHERE acc='"+u+"' ORDER BY id ASC LIMIT 5", function(err, rows) {
			var cList = [];
			for(var cc in rows){
				cList.push({cid: rows[cc].id,name: rows[cc].name,cLevel: rows[cc].clevel,Ctl: rows[cc].ctlCode,Class: rows[cc].cClass});
			}
			gl.LoadInventoryMulti(cList,0,c);
			//c(cList);
		});
	},
	LoadCharacter: function(u,ch,c){
		sql.query("SELECT * FROM tbl_characters WHERE acc='"+u+"' AND name='"+ch+"' ORDER BY id ASC LIMIT 1", function(err, rows) {
			//console.log(err);
			
			c({Name: rows[0].name,cLevel: rows[0].clevel,Exp: rows[0].cexp,Zen: rows[0].cZen,Class: rows[0].cClass,Ctl: rows[0].ctlCode,Map: rows[0].map,X: rows[0].x,Y: rows[0].y,
				UpPoints: rows[0].upPoints,Str: rows[0].str,Agi: rows[0].agi,Vit: rows[0].vit,Ene: rows[0].ene,Cmd: rows[0].cmd,
				MaxHp: rows[0].maxHp,MaxMana: rows[0].maxMana,MaxSp: rows[0].maxSp,MaxBp: rows[0].maxBp,PkLevel: rows[0].PkLevel,PkTime: rows[0].PkTime});
		});
	}
}


exports.Init = function(E){ Engine = E; return DataServer;}