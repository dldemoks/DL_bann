module.exports = my_redis;

var redis = require('redis'),
	redisCL = redis.createClient(),
	async = require('async'),
	sys = require('./sys');

function my_redis() {
	if (!(this instanceof my_redis)) return new my_redis();
};

my_redis.prototype.formSave = function(data, callback){
	
	var arrRes = {},
		error = false,
		message,
		key_list = 'test:list:forms:' + data.UserID,
		hkey = 'test:form:' + data.UserID + ':' + data.ps;
	
	async.parallel([
		function(callback){
			async.forEach(Object.keys(data), function(param, callback){
				sys.xss({text: data[param]}, function(err, res){
					if (err)
					{
						error = true;
						message = err.error;
					}
					callback();
				});
			}, function(err){
				callback();
			});
		},
		function(callback){
			if (!/^[\d]+$/.test(data.ps))
			{
				error = true;
				message = 'ps is not numeric';
			}
			callback();
		}
	], function(err){
		if (!error)
		{
			async.series([
				function(callback){
					redisCL.sadd(key_list, data.ps, function(err, res){
						redisCL.scard(key_list, function(err, countForms){
							if (countForms > 20)
							{
								redisCL.spop(key_list, function(err, deleted_ps){
									redisCL.del('test:form:' + data.UserID + ':' + deleted_ps, function(err, res){
										callback();
									});
								});
							}
							else
							{
								callback();
							}
						});
					});
				},
				function(callback){
					redisCL.hlen(hkey, function(err, countFields){
						if (countFields < 15)
						{
							redisCL.hset(hkey, data.name, data.value, function(err, res){
								callback();
							});
						}
						else
						{
							callback();
						}
					});
				},
				function(callback){
					redisCL.smembers(key_list, function(err, arrFID){
						async.forEach(arrFID, function(ps, callback){
							redisCL.hgetall('test:form:' + data.UserID + ':' + ps, function(err, form){
								arrRes[ps] = form;
								callback();
							});
						}, function(err){
							callback();
						});
					});
				}
			], function(err){
				return callback(error, arrRes);
			});
		}
		else
		{
			return callback(error, message);
		}
	});
};