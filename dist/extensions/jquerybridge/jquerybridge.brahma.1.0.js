/* brahma as jQuery plugin */

Brahma('brahma-jquerybridge', function($) {
	
	jQuery.Brahma = window.jQuery.fn.Brahma = function(callback) {
			
	callback.apply(Brahma(this));
		return this;
	};
	
	// deprecated
	jQuery.tie = jQuery.fn.tie = Brahma.tie =  Brahma.ext.tie = function(func) {
		func.apply(this);
		return this;
	};
  	
	jQuery.with = jQuery.fn.with = Brahma.with =  Brahma.ext.with = function(func) {
		func.apply(this);
		return this;
	};

	jQuery.under = jQuery.fn.under = Brahma.under = Brahma.ext.under = function(obj) {
		return $(obj).prependTo(this);
	};

	jQuery.put = jQuery.fn.put = Brahma.put = Brahma.ext.put = function(obj) {
		return $(obj).appendTo(this);
	};
	
	jQuery.and = Brahma.and = jQuery.fn.and = Brahma.ext.and = function(obj) {
		return $(obj).appendTo(this.parent());
	};

	jQuery.condition = jQuery.fn.condition = Brahma.condition = Brahma.ext.condition = function(condit, onTrue, onFalse) {
		if (condit) {
			
			return onTrue.call(this, condit);
		} else {
			if (typeof onFalse == 'function') return onFalse.call(this);
			return this;
		};
	};

	jQuery.ramp = Brahma.ramp = jQuery.fn.ramp = Brahma.ext.ramp = function() {
		var current = this;
		for (var i=0;i<arguments.length;i++) {
			var variable = arguments[i];
			if (variable instanceof Array) {
				for (var a=0;a<variable.length;a++) {
					$(current).put(variable[variable]);
				};
				current = $(current).parent();
			} else {
				current = $(current).put(arguments[i])
			};
		};
		return current;
	};
	
}, ['jquery']);