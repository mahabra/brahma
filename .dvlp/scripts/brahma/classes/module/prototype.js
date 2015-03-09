(function() {
	var proto = {};
	proto.prototype = {
		modules : {},
		/* Расширет модуль */
		assing : function(dist) {
			Brahma.extend(this, dist);
			return this;
		}
	};
	return proto;
})()
