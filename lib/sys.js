var validator = require('validator');

var in_array = function (value, array, callback) {
	if (array.indexOf(value) > -1) 
	{
		callback(true);
	}
	else 
	{
		callback(false);
	}
};

var time = function () {
	return Math.floor(Date.now() / 1000); 
};

var xss = function(req, callback) {
	
	var res = validator.trim(req.text);
	res = validator.escape(res);

	if (validator.isNull(res)) 
	{
		return callback({error: 'empty message'}, '');
	} 
	else 
	{
		if (!validator.isLength(res, 1, 250)) 
		{
			return callback({error: 'length message to 250'}, '');
		}
		else
		{
			if (/^[^\s]{50,}$/.test(res)) 
			{
				return callback({error: 'spam message'}, ''); 
			} 
			else
			{
				return callback(false, res);
			}
		}
	}
};

module.exports = 
{
	in_array: in_array,
	time: time,
	xss: xss
};