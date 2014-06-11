/* majestic as jQuery plugin */

Majestic('majestic.jquerybridge', function() {
	
	if (typeof require == "function" && (typeof define == "function" && define.amd)) {

	} 
	(function(require) {
		require(['jquery'], function() {
			
				
				jQuery.bush = window.jQuery.fn.bush = function(callback) {
			
					callback.apply(Majestic(this));
					return this;
				};
				
				jQuery.tie = jQuery.fn.tie = Majestic.tie =  Majestic.ext.tie = function(func) {
					func.apply(this);
					return this;
				};
			  
				jQuery.under = jQuery.fn.under = Majestic.under = Majestic.ext.under = function(obj) {
					return $(obj).prependTo(this);
				};

				jQuery.put = jQuery.fn.put = Majestic.put = Majestic.ext.put = function(obj) {
					return $(obj).appendTo(this);
				};
				
				jQuery.and = Majestic.and = jQuery.fn.and = Majestic.ext.and = function(obj) {
					return $(obj).appendTo(this.parent());
				};

				jQuery.condition = jQuery.fn.condition = Majestic.condition = Majestic.ext.condition = function(condit, onTrue, onFalse) {
					if (condit) {
						return onTrue.apply(this);
					} else {
						if (typeof onFalse == 'function') return onFalse.apply(this);
						return this;
					};
				};

				jQuery.ramp = Majestic.ramp = jQuery.fn.ramp = Majestic.ext.ramp = function() {
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
			
		});
	})(
		((typeof jQuery == 'undefined') && (typeof require == "function" && (typeof define == "function" && define.amd))) ? require : function(r, callback) {
			if (typeof jQuery != 'undefined') callback();
			else throw('Majestic: extension require jQuery');
		}
	);
	
});