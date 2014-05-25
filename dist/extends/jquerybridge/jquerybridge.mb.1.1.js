/* miraclebush as jQuery plugin */
if (typeof jQuery != 'undefined') {
	
		jQuery.miracle = window.jQuery.fn.miracle = function(callback) {
	
			callback.apply(Miracle(this));
			return this;
		}
		jQuery.tie = jQuery.fn.tie = Miracle.tie =  Miracle.ext.tie = function(func) {
			func.apply(this);
			return this;
		};
	  
		jQuery.under = jQuery.fn.under = Miracle.under = Miracle.ext.under = function(obj) {
			return $(obj).prependTo(this);
		};

		jQuery.put = jQuery.fn.put = Miracle.put = Miracle.ext.put = function(obj) {
			return $(obj).appendTo(this);
		};
		
		jQuery.and = Miracle.and = jQuery.fn.and = Miracle.ext.and = function(obj) {
			return $(obj).appendTo(this.parent());
		};

		jQuery.condition = jQuery.fn.condition = Miracle.condition = Miracle.ext.condition = function(condit, onTrue, onFalse) {
			if (condit) {
				return onTrue.apply(this);
			} else {
				if (typeof onFalse == 'function') return onFalse.apply(this);
				return this;
			};
		};

		jQuery.ramp = Miracle.ramp = jQuery.fn.ramp = Miracle.ext.ramp = function() {
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