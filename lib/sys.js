var in_array = function (value, array, callback) {
	if (array.indexOf(value) > -1) {
		callback(true);
	} else {
		callback(false);
	}
};


var time = function () {
	return Math.floor(Date.now() / 1000);	
};


exports.in_array = in_array;
exports.time = time;