Brahma.applications.fabric('module',['events','tie'], function() {});
/* Функция создает простой модуль */
Brahma.module = function(extend,args) {
	return Brahma.applications.create('module',extend||{},args||[]);
};