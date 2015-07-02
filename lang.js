var lng = require('./lib/lang')('../json/lang.json', 'ru');

	lng.getmess('banned', {
		UserName: 'Nick', 
		ModerName: 'Moder 1'
	}, function(err, res){
		console.log(res);
	});
