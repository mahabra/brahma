Brahma.applications.fabric('module',['events','tie'], function() {});
Brahma.module = function(extend,args) {
	return Brahma.applications.create('module',extend||{},args||[]);
};