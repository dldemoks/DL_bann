module.exports = LanguageModule;

var async = require('async');

function LanguageModule(filepath, lang){
	if (!(this instanceof LanguageModule)) return new LanguageModule('../json/lang.json', 'ru');
	this.data = require(filepath);
	this.language = lang;
}

LanguageModule.prototype.data = {};
LanguageModule.prototype.language = 'ru';

LanguageModule.prototype.getmess = function(type, req, callback){
	var _this = this;
	var lang = this.language;
	var restr;
	if (_this.data[lang][type] != undefined)
	{
		restr = _this.data[lang][type];
		async.forEach(Object.keys(req), function(word, callback){
			restr = restr.replace('#' + word + '#', req[word]);
			callback();
		}, function(err){
			return callback(false, restr);
		});
	}
	else
	{
		return callback(true, 'undefined type');
	}
};