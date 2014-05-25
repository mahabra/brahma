/* miraclebush as jQuery plugin */
console.log('ji');
if (typeof jQuery != 'undefined') {
	
		jQuery.bush = window.jQuery.fn.bush = function(callback) {
	
			callback.apply($bush(this));
			return this;
		}
		jQuery.tie = jQuery.fn.tie = $bush.tie =  $bush.ext.tie = function(func) {
			func.apply(this);
			return this;
		};
	  
		jQuery.under = jQuery.fn.under = $bush.under = $bush.ext.under = function(obj) {
			return $(obj).prependTo(this);
		};

		jQuery.put = jQuery.fn.put = $bush.put = $bush.ext.put = function(obj) {
			return $(obj).appendTo(this);
		};
		
		jQuery.and = $bush.and = jQuery.fn.and = $bush.ext.and = function(obj) {
			return $(obj).appendTo(this.parent());
		};

		jQuery.condition = $bush.condition = function(condit, onTrue, onFalse) {
			if (condit) {
				return onTrue.apply(this);
			} else {
				if (typeof onFalse == 'function') return onFalse.apply(this);
				return this;
			};
		};

		jQuery.ramp = $bush.ramp = function() {
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
};