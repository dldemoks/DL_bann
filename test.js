var dateFormat = require('dateformat'),
	banned = require('./lib/banned')();
	
banned.addBann({
	type: 'ip',
	val: '123.456.78.90',
	time: 1200,
	mid: 65,
	msg: "Bad boy"
}, function(err){
	if (err) console.log(err);
});

banned.inBann({
	userID: 315,
	ip: '123.456.78.90'
}, function(err, res){
	if (err) console.log(err);
	console.log(res);
});

banned.historyBann({
	type: 'ip',
	val: '123.456.78.90'
}, function(err, res){
	if (err) console.log(err);
	console.log(res);
});