Brahma('brahma-ajax', function() {
	var ajax_proto = function() {
		this.options = {
			url : '',
			type: 'post',
			data: {},
			dataType: 'json',
			cache: false,
			error : function() {
				Brahma.die(response);
			},
			success : function() {

			}
		};
		this.request = null;
		this.config = function(options) {
			if (arguments.length>1) {
				this.options[arguments[0]] = arguments[1];
			} else if (arguments.length==1) {
				switch(typeof arguments[0]) {
					case 'object':
						this.options = Brahma.api.extend(this.options, options);
					break;
					default:
						return this.options[arguments[0]] || null;
					break;
				}
			} else {
				return this.options;
			};
			return this;			
		};
		/*
		0 - url
		1 - data
		2 - success
		3 - error
		*/
		this.initialArguments = function(args) {

			var args = args || [];
			var options = {
				url : args.length>0 ? args[0] : '',
				data : args.length>1 ? args[1] : {},
				success : args.length>2 ? args[2] : function() {},
				error : args.length>3 ? args[3] : function() {}
			};

			return options;
		};
		
		this.post = function() {

			this.options.type = 'post';
			this.__perform(this.initialArguments(arguments));
			return this;
		};

		this.get = function() {
			this.options.type = 'get';
			this.__perform(this.initialArguments(arguments));
			return this;
		};

		this.__perform = function(options) {

			var options = $.extend(this.options, options);
			
			this.request = $.ajax(options);
		};

		if (arguments.length>1) {
			this.__perform(this.initialArguments(arguments));
		};
	};

	Brahma.ajax = function() {
		return new ajax_proto();
	};

	if ("undefined" != typeof Brahma.ajax.__proto__)
	Brahma.ajax.__proto__ = Brahma.ajax.prototype = new ajax_proto();
	else Brahma.api.extend(Brahma.ajax, ajax_proto);
	
}, ['brahma-jquerybridge']);