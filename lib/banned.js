module.exports = payeerBanned;

var redis = require('redis'),
	redisCL = redis.createClient(15937),
	dateFormat = require('dateformat'),
	async = require('async'),
	sys = require('./sys'),
	typeBann = ['userID', 'ip'];

function payeerBanned(){
	if (!(this instanceof payeerBanned)) return new payeerBanned();
}

///////// добавление в бан по параметру ///////////
/* 
req = {
	type: 'userID',
	val: 315,
	time: 900,
	mid: 65,
	msg: "Bad boy"
}
*/

payeerBanned.prototype.addBann = function(req, callback){
	sys.in_array(req.type, typeBann, function(checkType){
		if (checkType)
		{
			var datexp = Date.now() + req.time * 1000;
			redisCL.zadd('ps:banlist:' + req.type, datexp, req.val, function(err, res){
				if (!err)
				{
					var keylog = 'ps:banlog:' + req.type + ':' + req.val;
					redisCL.zcard(keylog, function(err, res){
						var count = res + 1;
						redisCL.zadd(keylog, count, JSON.stringify({
							count: count,
							mid: req.mid,
							time: req.time * 1000,
							msg: req.msg,
						}), function(err){
							return callback(false);
						});
					});
				}
				else
				{
					return callback(err);
				}
			});
		}
	});
};

///////// проверить на наличие бана по указанным параметрам /////////
/*
req = {
	userID: 315,
	ip: 123.456.78.90
}
*/

payeerBanned.prototype.inBann = function(req, callback){
	
	var arrRes = {};
	
	async.forEach(Object.keys(req), function(type, callback){
		sys.in_array(type, typeBann, function(checkType){
			if (checkType)
			{
				redisCL.zremrangebyscore('ps:banlist:' + type, '-inf', Date.now(), function(err, res){
					redisCL.zscore('ps:banlist:' + type, req[type], function(err, res){
						arrRes[type] = res : false;
						callback();
					});
				});
			}
			else
			{
				arrRes[type] = false;
				callback();
			}
		});
	}, function(err){
		return callback(false, arrRes);
	});
};

///////// история банов /////////
/*
req = {
	type: userID,
	val: 315
}
*/

payeerBanned.prototype.historyBann = function(req, callback){
	
	var arrRes = [];
	sys.in_array(req.type, typeBann, function(checkType){
		if (checkType)
		{
			redisCL.zrange('ps:banlog:' + req.type + ':' + req.val, 0, -1, function(err, res){
				async.forEach(res, function(banitem, callback){
					arrRes.push(JSON.parse(banitem));
					callback();
				}, function(err){
					return callback(false, arrRes);
				});
			});
		}
		else
		{
			return callback(false, []);
		}
	});
};