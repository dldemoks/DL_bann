module.exports = payeerBanned;

var redis = require('redis'),
	redisCL = redis.createClient(15937),
	dateFormat = require('dateformat'),
	sys = require('./sys'),
	typeBann = ['userID', 'ip'];

function payeerBanned() {
	if (!(this instanceof payeerBanned)) return new payeerBanned();
}

///////// добавление в бан по параметру ///////////
/* 
req = {
	type: userID,
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
				if (res)
				{
					var keylog = 'ps:banlog:' + req.type + ':' + req.val;
					redisCL.hmset(keylog, {
						mid: req.mid,
						datexp: datexp,
						msg: req.msg,
					}, function(err){
						return callback(false);
					});
				}
				else
				{
					return callback(true);
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
						arrRes[type] = (res) ? true : false;
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

///////// информация по бану /////////
/*
req = {
	type: userID,
	val: 315
}
*/

payeerBanned.prototype.infoBann = function(req, callback){
	sys.in_array(req.type, typeBann, function(checkType){
		if (checkType)
		{
			redisCL.hgetall('ps:banlog:' + req.type + ':' + req.val, function(err, bandata){
				return callback(false, bandata);
			});
		}
		else
		{
			return callback(false, {});
		}
	});
};