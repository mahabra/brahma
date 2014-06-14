/*!
 * majestic UIL framework
 *
 * Version 1.0.
 *
 * Released under the MIT license:

Copyright (C) 2014 Vladimir Kalmykov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 * Visit for more info: http://majestic.vladimirkalmykov.com/
* majestic using Sizzle lib (http://sizzlejs.com/)
 */

/* Starting majestic */



(function(define) {
	
	var binds = [];
	var onFillQueues = [];

	if (typeof window.Majestic == "function") {
		delete(window.Majestic);
	};
	window.Get = window.$majestic = window.Majestic = function() {
		
		if (this === window) {
			
			var air = new window.Majestic;
			var callback = false;
			var extensionName = false;
			var option3 = false;
			switch (arguments.length) {

				case 2:
				case 3:
					var selector = arguments[0];
					var options = arguments[1];
					if (arguments.length>2) option3 = arguments[2];

					if (typeof selector == 'string' && typeof options == 'function') {
						// > it must be require call
						var tmpselector = options;
						var extensionName = selector;
						var selector = tmpselector;
						// > looking for argument[2] (depends)
						if (arguments.length>2) {
							options = arguments[2];
						} else {
							options = {};
						};
						var elements = [];
					} else {
						var elements = Majestic.nodeQuery.call(this, selector);
					};
				break;
				case 1:
					var selector = arguments[0];
					var options = {};
					var elements = Majestic.nodeQuery.call(this, selector);
					
				break;
				case 0:
					var selector = '';
					var options = {};
					var elements = Majestic.nodeQuery.call(this, selector);
				break;
			}
			
			var require_amd = [];

			// > First arguments is a function = context/depend mode
			switch(typeof selector) {
				case 'function':
					/* Check require another's libraries test */
					if (typeof option3 == "function") {
						if (!option3.apply(air)) return false;
					};

					callback = selector;
					selector = '';
					// > Check extensionName and append to air.amd.defined
					if (extensionName) {

						if (air.amd.defined.indexOf(extensionName) < 0) 
						air.amd.defined.push(extensionName);
					};	
					
					if (Majestic.isArray(options) && options.length>0) {
						
						require_amd = options;
					} else {
						/* eval factory now */
						callback.apply(air);
					};
				break;
			};

			for (var index=0;index<elements.length;index++) {
				
				air[index] = elements[index];
				
			};
			
			if (index>1) air.context = document;
			else if (index>0) air.context = elements[0].parentNode;
			else air.context = null;
			air.length = index;
			air.selector = selector;
			air.majesticBush = '1.2';
			// add callback to onFillQueues
			if (typeof callback == 'function') {
				if (onFillQueues) {

					onFillQueues.push({callback: callback, require_amd: require_amd});
				}
				else {
					air.includeQueue({callback: callback, require_amd: require_amd});
				}
			};

			return air;
		}
	};
	
	window.Majestic.ext = window.Majestic.prototype = {
		selector: "",
		constructor: window.Majestic,
		init: function( selector ) {
			return window.Majestic.ext.constructor;
		}
	};
	
	window.Majestic.info = {
		homesite: 'http://majestic.vladimirkalmykov.com',
		version: '1.2.1.1'
	};

	/*
		Throw exception and die
	*/
	window.Majestic.die = window.Majestic.ext.die = function(message) {
			throw('Majestic: '+message);
	};

	/*
	AMD service
	*/
	window.Majestic.amd = window.Majestic.ext.amd = new (function(Majestic) {
		this.M = Majestic;
		this.loadings = 0;
		this.queue = [];
		this.defined = [];
		this.isReady = function() {
			if (this.loadings>0) return false;
			return true;
		};
		this.ready = this.onReady = function(callback) {

			if (this.isReady()) { callback.apply(this.M); }
			else {

				this.queue.reverse().push(callback);
				this.queue.reverse();
			};
		};
		this.require = function(amd, callback) {

			var that = this;
			var amd = amd;
			if (typeof require == 'function') {
				
				that.loadings++;
				require(amd, function() {
					that.loaded(amd);
				});
				if (typeof callback == 'function') this.ready(callback);
			} else {
				if (typeof callback == 'function') {
					
					callback.apply(this.M);
				};
			};
		};
		this.loaded = function(amd) {
			this.loadings--;
			var amd = amd || [];

			/* set amd mark */
			for (var i = 0; i<amd.length;i++) {
				this.defined.push(amd[i]);
			};

			if (this.loadings<1) {
				this.loadings=0;
				if (this.queue.length>0) {
					var queue = this.queue;
					
					this.queue = [];
					for (var i =0; i<queue.length;i++) {
						
						queue[i].apply(this.M);
					}
				}
			}
		}
	})(window.Majestic);

	/* > Include queue that initialed by calling Majestic('extension_name', function() {

	}, ['depends', 'components']) */
	window.Majestic.includeQueue = window.Majestic.ext.includeQueue = function(queue) {
		// > Check for require compoentns
		if (Majestic.isArray(queue.require_amd)) {
			// Look for depends existings
			var require_amd = [];
			
			for (var i=0;i<queue.require_amd.length;i++) {
				
				if (window.Majestic.amd.defined.indexOf(queue.require_amd[i])<0) {
					if (typeof define == 'function' && define.amd) {
						require_amd.push(queue.require_amd[i]);
						//
					} else {
						throw('Majestic: required `'+options[i]+'` component. Visit '+Majestic.info.homesite+' to get it');
					};
				};
			};
		};
		
		/* its about requiring amd */
		if (require_amd.length>0) {

			Majestic.amd.require(require_amd, queue.callback);
		} else {
			/* if required compoennts defined execute */
			queue.callback.apply(Majestic);
		};
	}

	// Try to get preposition of selector
	window.Majestic.bench = window.Majestic.ext.bench = function(args, tieback) {
		var elem;
		if (args.length > 1) {
			if (typeof args[0] === "object") elem = Majestic(args[0]) || this.selector;
			else {
				elem = Majestic.nodeQuery(args[0]);
			};
			options = args[1];
		} else if (args.length>0) {
			elem = this.selector;
			options = args[0];
		} else {
			elem = this.selector;
			options = {};
		};
		
		return tieback.call(this, elem, options);
	};
	
	window.Majestic.nodeQuery = window.Majestic.ext.nodeQuery = function(query) {
		
		switch(typeof query) {
			case 'string':
				
				var queryExpr = /<([a-zA-Z0-9_]+) \/>/i;
				result = queryExpr.exec(query);
				if (result == null) {
					return Sizzle(query);
				} else {	
					
					return [document.createElement(result[1].toUpperCase())];
				};
			break;
			case 'function':
				return [];
			break;
			case 'object':
			default:
				if (query instanceof Array) {
					return query;
				} else {
					// test for jquery
					if (typeof query.jquery == 'string') {
						var elements = [];
						for (var j=0;j<query.length;j++) elements.push(query[j]);
						return elements;
					// test for self
					} else if (typeof query.majesticBush == 'string') {
						return query;					
					} else {
						return [query];
					};
				}
			break;
		};
	};
	
	// > PHP like function
	window.Majestic.isArray = function(obj) {
		if (obj instanceof Array) return true;
		return false;
	}

	window.Majestic.each = window.Majestic.ext.each = function() {
		
		return Majestic.bench.call(this, arguments, function(elem, options) {
			
			for (var i=0; i<elem.length; i++) {
				
				options.call(elem[i], i, elem[i]);
			};
			return elem;
		});
	};
	
	window.Majestic.put = window.Majestic.ext.put = function() {
		return Majestic.bench.call(this, arguments, function(elem, options) {
			switch(typeof options) {
				case 'string':
					var node = Majestic.nodeQuery.call(this, options);
					var elem = elem;
					
					Majestic(elem).each(function() {
						this.appendChild(node[0]);
					});
					
				break;
				case 'object':
					var node = options[0];
					
					Majestic(elem).each(function() {
						this.appendChild(node);
					});
					
				break;
			};
			
			return Majestic(node);
		});
	};
	
	window.Majestic.css = window.Majestic.ext.css = function() {
		
		return Majestic.bench.call(this, arguments, function(elem, options) {
			for (var i in options) {
				
				elem[0].style[i] = options[i]+'px';
			};		
			return Majestic(elem);
		});
	};
	
	window.Majestic.attr = window.Majestic.ext.attr = function() {
		var elem;
		return Majestic.bench.call(this, arguments, function(elem, options) {
			var options = options;
				Majestic(elem).each(function() {
					for (var i in options) {
						this.setAttribute(i, options[i]+'px');
					};	
				});
			return Majestic(elem);
		});
	};
	
	window.Majestic.width = window.Majestic.ext.width = function() {
		return Majestic.bench.call(this, arguments, function(elem, options) {
			return elem[0].offsetWidth;
		});
	};
	
	window.Majestic.height = window.Majestic.ext.height = function() {
		return Majestic.bench.call(this, arguments, function(elem, options) {
			return elem[0].offsetHeight;
		});
	};
	
	window.Majestic.html = window.Majestic.ext.html = function(html) {
		var html = html || '';
		return Majestic.bench.call(this, arguments, function(elem, options) {
			
			return elem[0].innerHTML = html;
		});
	};
	
	/* majestic.domReady */
	window.Majestic.domReady = function(callback) {
		
		if(document.readyState == 'complete') {
			
			callback({});
		} else {
			if (typeof binds.domReady != 'object') binds.domready = [];
			binds.push(callback);
			document.onload = window.onload = function(e) {
				var e = e;
				
				for (var i=0; i<binds.length;i++) {
					binds[i].call(e);
				}
			};
		};
	}
	
	/* browser */
	window.Majestic.browser = {
		
	};
	
	/* get browser version */
	(function(navigator) {
		this.opera = false;
		this.chrome = false;
		this.safari = false;
		this.name = 'unknown';
		this.ie = false;
		this.iemin = true;
		
		if (navigator.userAgent.toLowerCase().indexOf('safari')>-1 && navigator.userAgent.toLowerCase().indexOf('chrome')<0) {
			this.safari = true;
			this.name = 'safari';
		}
		if (navigator.userAgent.toLowerCase().indexOf('opera')>-1) {
			this.opera = true;
			this.name = 'opera';
		}
		if (navigator.userAgent.toLowerCase().indexOf('chrome')>-1) {
			
			this.chrome = true;
			this.name = 'chrome';
		}
		
		if (navigator.userAgent.toLowerCase().indexOf('msie 9')>-1) {
			
			this.ie = true;
			this.name = 'ie9';
		}
		
		if (navigator.userAgent.toLowerCase().indexOf('msie 8')>-1) {
			
			this.ie = true;
			this.iemin = true;
			this.name = 'ie8';
		}
		
		if (navigator.userAgent.toLowerCase().indexOf('msie 7')>-1) {
		
			this.ie = true;
			this.iemin = true;
			this.name = 'ie7';
		}
		
	}).call(window.Majestic.browser, navigator);
	
	/* majestic.api */	
	window.Majestic.api = {};
	
	window.Majestic.api.rand = function(min, max) {
		var rand = min - 0.5 + Math.random()*(max-min+1)
		return  Math.round(rand);
	};
	
	/* return value if it present in array `variants` or `fault` */
	window.Majestic.api.only = function(variants, fault, value, ignoreCase) {
		var ignoreCase = ignoreCase || false;
		if (ignoreCase) value = value.toLowerCase();
		for (var i=0;i<variants.length;i++) {
			if (ignoreCase) variants[i]=variants[i].toLowerCase();
			if (variants[i]==value) return value;
		};
		return fault;
	};
	
	/* foreach child elements that has attrName */

	window.Majestic.api.eachByAttr = function(el, attrName, eachcallback) {
		var attrName = attrName.split('[').join('\\[').split(']').join('\\]');
		
		if (el instanceof Array) {
			var nodelist = [];
			for (var na = 0; na<el.length; na++) {
				var rquery =  Sizzle('['+attrName+']', el[na]);
				if (rquery) for (var irq = 0;irq<rquery.length;irq++) {
					nodelist.push(rquery[irq]);
				};
			};
		} else {
			var nodelist = Sizzle('['+attrName+']', el);
		};
		
		if (typeof nodelist == 'object') {
			for (var i = 0; i<nodelist.length; i++) {
				eachcallback.call(nodelist[i]);
			};
		};
	};
	
	window.Majestic.api.hasAttribute = function(el, attrName) {
		var attrName = attrName.split('[').join('\\[').split(']').join('\\]');
			
		if (el.getAttribute(attrName)!=null) return true;
		else return false;
	};
	
	/* majestic modules constrcutor */
	window.Majestic.module = function(module) {
		return Majestic.api.extend(module, {
			config : {},
			setConfig : function() {
				
				if (typeof arguments[0] == 'string' && arguments.length>1) {
					
					this.config[arguments[0]] = arguments[1];
					
				} else if (typeof arguments[0] == 'object') {
					
					for (var i in arguments[0]) {
						
						this.setConfig(i, arguments[0][i]);
					};
				};
				return this;
			},
			tie : function(callback) {
				callback.call(this);
				return this;
			},
			eventListners : {},
			bind : function(e, callback, once) {
				var once = once;
				if (typeof this.eventListners[e] != 'object') this.eventListners[e] = [];
				this.eventListners[e].push({
					callback: callback,
					once: once
				});
				return this;
			},
			trigger : function() {
				
				
				if (typeof arguments[0] == 'integer') {
					var uin = arguments[0];
					var e = arguments[1];
					var args = (arguments.length>2) ? arguments[2] : [];
				} else {
					var uin = false;
					var e = arguments[0];
					var args = (arguments.length>1) ? arguments[1] : [];
				};
				
				if (typeof this.eventListners[e] == 'object' && this.eventListners[e].length>0) {
					var todelete = [];
					for (var i = 0; i<this.eventListners[e].length; i++) {
						if (typeof this.eventListners[e][i] == 'object') {
							this.eventListners[e][i].callback.apply(this, args);
							if (this.eventListners[e][i].once) {
								todelete.push(i);
							};
						};
					};
					
					if (todelete.length>0) for (var i in todelete) {
						this.eventListners[e].splice(todelete[i], 1);
					};
				};
				return this;
			},
			// > set config value and call trgiiger `reconfig`
			set : function(key, value) {

				switch(typeof key) {
					case 'string':
						
						this.config[key] = value;
					break;
					case 'object':
						var c = this.config;
						for (var q=0;q<key.length-1;q++) {
							
							if (typeof this.config[key[q]] == 'undefined')
							this.config[key[q]] = {};
							c = this.config[key[q]]
							
						};
						c[key[key.length-1]] = value;
					break;
				}
				this.trigger('reconfig', [key]);
			},
			// get config value
			get : function(key) {
				return this.config[key];
			}
		});
	};
	
	// extend
	window.Majestic.api.extend = function() {
			
			var target = arguments[0], proto = arguments[1];
			var e2D = (arguments.length>2) ? arguments[2] : false;
			
			for (var i in proto) {
				switch ( typeof proto[i] ) {
					case 'undefined':
					case 'null':
						target[i] = null;
					break;
					case 'object': 
						if (e2D) {
							target[i] = proto[i];
						} else {
							if (proto[i] instanceof Array) {
								target[i] = [];
								
								Majestic.api.extend(target[i],proto[i]);
							} else {
								target[i] = {};
								for (var ii in proto[i]) {
									target[i][ii] = proto[i][ii];
								};
							};
						}
						
					break;
					case 'boolean':
					case 'number':
					case 'string':
					case 'function':
						
						target[i] = proto[i];
						
					break;
				};
			};
			
			return target;
		};
	/* majestic uil constructor */
	window.Majestic.library = window.Majestic.ui = function() {
		
		if (this === window || typeof this == 'function') {
			if (typeof arguments[0] == 'string') {
				var name = arguments[0];
				if (arguments.length>1) {
					if (typeof arguments[1] == 'string') {
						var uil = Majestic.ui[arguments[1]];
					} else {
						var uil = arguments[1];
					};
				}
				else 
				{
					var uil = {};
				};
			} else {
				var name = false;
				var uil = arguments[0];
			};
			
			if (name && typeof Majestic.ui[name] != 'undefined') return Majestic.api.extend(Majestic.ui[name], uil);
			
			Majestic.api.extend(uil, Majestic.module({
				widgets : {},
				count: 0,
				init : function() {
					
					var uil = this;
					
					// listen
					this.listen();
					
					// Framework events
					this.bind('beforeParse', function(el, widget) {
						Majestic.ui.trigger('beforeParse', [uil, el, widget]);
					});
					
					this.bind('afterParse', function(el, widget) {
						Majestic.ui.trigger('afterParse', [uil, el, widget]);
					});
					
					return this;	
				},
				relisten: function() {
					var uil = this;

					if(document.readyState == 'complete') uil.parse(window.document.getElementsByTagName('body')[0]); 
				},
				listen: function() {
					var uil = this;
					Majestic.domReady(function(e) {
						
						uil.parse(window.document.getElementsByTagName('body')[0]); 
					});
					
					if (typeof jQuery != 'undefined') {
						// jQuery support
						$(document).bind('change', function(e, el) {
							uil.parse(el || $('body'));
						});
					};
					
				},
				parse : function(el) { 
					var uil = this;
					if (this.count<1) return;

					Majestic.api.eachByAttr(el, 'ui-'+this.config.name, function() {
						
						var widget = this.getAttribute('ui-'+uil.config.name+'');
						if (Majestic.api.hasAttribute(this, 'ui-initialized')) return this; 
						if (typeof uil.widgets[widget] == 'function') {
							uil.trigger('beforeParse', [this, widget]);
							this.setAttribute("ui-initialized", "true");
							uil.widgets[widget].call(uil, this);
							uil.trigger('afterParse', [this, widget]);
						} else if (typeof uil.widgets[this.getAttribute('ui-'+uil.config.name+'')] == 'object') {
							uil.trigger('beforeParse', [this, widget]);
							this.setAttribute("ui-initialized", "true");
							uil.widgets[widget].render(this, (function(el) {
								return {};
							})(this));
							uil.trigger('afterParse', [this, widget]);
						};
					});
					
					Majestic.api.eachByAttr(el, 'data-ui-'+this.config.name, function() {
						var widget = this.getAttribute('data-ui-'+uil.config.name+'');
						if (Majestic.api.hasAttribute(this, 'ui-initialized')) return this; 
						if (typeof uil.widgets[widget] == 'function') {
							uil.trigger('beforeParse', [this, widget]);
							this.setAttribute("ui-initialized", "true");
							uil.widgets[widget].call(uil, this);
							uil.trigger('afterParse', [this, widget]);
						} else if (typeof uil.widgets[this.getAttribute('ui-'+uil.config.name+'')] == 'object') {
							uil.trigger('beforeParse', [this, widget]);
							this.setAttribute("ui-initialized", "true");
							uil.widgets[widget].render(this, (function(el) {
								return {};
							})(this));
							uil.trigger('afterParse', [this, widget]);
						};
					});
					
					return this;
				},
				
				widget : function(widget) {
					if (typeof arguments[0] == 'string') {
						var name = arguments[0];
						var widget_content = arguments[1];
					} else {
						var name = false;
					};
					switch(typeof widget_content) {
						case 'function':
							
							if (name) this.widgets[name] = widget_content;
							else return widget_content;
						break;
						case 'object':
							if (name) this.widgets[name] = Majestic.module(widget_content);
							else return Majestic.module(widget_content);
						break;
					};
					this.count++;
					this.relisten();
					return this;
				}
			})).setConfig({
				name :  arguments[0]
			}).init()
			.tie(function() {
				Majestic.ui.names.push(name);
				if (name) Majestic.ui[name] = this;
			});
			
			if (!name) return this;
			else return Majestic.ui[name];
		};
	};
	
	window.Majestic.ui = window.Majestic.module(window.Majestic.ui);
	
	window.Majestic.ui.prototype = {
		constructor: window.Majestic.ui
	};
	
	window.Majestic.ui.names = [];
	window.Majestic.ui.parse = function(el) {
		
		var el = el || window.document.getElementsByTagName('body')[0];
		for(var i=0;i<Majestic.ui.names.length;i++) {
			Majestic.ui[Majestic.ui.names[i]].parse(el);
		};
	};

	/*
		Creating extension
	*/
	window.Majestic.extension = function(name, callback) {
		if (this.amd.defined.indexOf(name)<0) this.amd.defined.push(name);
		callback.apply(window.Majestic);
	};

	/*
	Create/addon widget by method life
	Example:
	Majestic.applet('mywidget', {
		exec : function() {
			return this.hello();
		}
	}); // < Creating new life element
	
	// > append new function to exists widget by method life
	Majestic.applet('mywidget').hello = function() {
		
	};

	// > Make a copy of widget by method life
	Majestic.applet('newWidget', 'mywidget', {
		exec : function() {
			return this.hi();
		}
	})

	// > Make life to node element by method life
	Majestic('#mywrap').applet('mywidget');

	*/
	window.Majestic.widgets = {};
	window.Majestic.widget = window.Majestic.ext.widget = function() {
		if (this === window || typeof this == 'function') {
			// > name of widget
			var name = arguments[0];
			// > data
			if (arguments.length>1) {
				switch(typeof arguments[1]) {
					case 'object':
						var $data = arguments[1];
					break;
					case 'string': // copy
						var copy = arguments[1];
						if (typeof Majestic.widgets[copy] != 'undefined') {
							$data = this.api.extend({}, Majestic.widgets[copy]);
						} else {
							$data = {};
						};
						if (arguments.length>2 && typeof arguments[2] == 'object') {
							$data = this.api.extend($data, arguments[2]);
						};						
					break;
				}
				
			} else {
				$data = {};
			};			
			

			// > return widget protptype if exists
			if (name && typeof Majestic.widgets[name] != 'undefined') return Majestic.api.extend(Majestic.widgets[name], $data);

			// > create new widget
			var widget = {
				elements: null,
				privates: {
					intervals: {
						
					},
					conditions: {

					}
				},
				options: {},
				manual: function(options) {
					var options = options;
					Majestic(options.panel).applet('visualJson', {
						rules: this.tuning,
						source: this.config,
						context: this,
						result: options.codeViewer,
						code: "Majestic(\"#example\").widget(\""+this.classname+"\", [*json*]);"
					}, function() {
						if (typeof options.onChange == 'function') this.bind('change', function() {
							options.onChange();
						});
					});
				},
				animate: function(options, time, callback) {
					var options = options
					var time = time || 1000;
					var callback = callback || false;
					if (typeof time == 'function') {
						var callback = time;
						var time = 1000;
					};



					if (typeof options == 'object') {
						// > uin for condition to callback
						do {
							var conditionUin = Majestic.api.rand(1,99999);
						} while(typeof this.privates.conditions[conditionUin] != "undefined");

						var count = 0;
						for (var i in options) {
							count++;
							(function(widget, key, startValue, endValue, time, steps, callback) {
								
								/* if interval exists delete em */
								if (typeof widget.privates.intervals[key] == 'object') {
									
									clearInterval(widget.privates.intervals[key].timer);
									delete widget.privates.intervals[key];
								};
								/* if value is not number type set value immediately */
								if (typeof startValue != 'number') {
									widget.set(key, endValue);
									widget.privates.conditions[conditionUin].done();
									return;
								};
								var key = key;
								var widget = widget;
								widget.privates.intervals[i] = {
									start: startValue,
									end: endValue,
									step: 0,
									steps: steps,
									condition: conditionUin,
									timer: setInterval(function() {

										widget.privates.intervals[key].step++;
										var val = startValue + ( ((endValue-startValue)/widget.privates.intervals[key].steps)*widget.privates.intervals[key].step );
										
										widget.set(key, val);
										if (widget.privates.intervals[key].step>=widget.privates.intervals[key].steps) {
											clearInterval(widget.privates.intervals[key].timer);
											delete widget.privates.intervals[key];
											widget.privates.conditions[conditionUin].done();
										}
									}, time/steps)
								};

							})(this, i, this.get(i), options[i], time, (time/10), callback);
							
						};
						// callback condition
						
						this.privates.conditions[conditionUin] = new (function(widget, count, callback, uin) {
							this.countBack = count;
							this.callback = callback;
							this.widget = widget;
							this.uin = uin;
							this.done = function() {
								
								this.countBack--;
								if (this.countBack==0) {
									delete widget.privates.conditions[this.uin];
									if (typeof this.callback == 'function') this.callback.apply(widget);
								};
							}
						})(this, count, callback, conditionUin);
					};
				}
			};

			// merge with $data and make it Majestic module
			widget = Majestic.api.extend(widget, $data);
			Majestic.api.extend(widget, Majestic.module({
				
			})).setConfig({
				name : name
			});

			Majestic.widgets[name] = widget;
			
			
			if (!name) return this;
			else return Majestic.widgets[name];
		} else {
			// > Test for plugin exists
			if (typeof Majestic.widgets[arguments[0]] != 'object') {
				throw('Majestic: require `'+arguments[0]+'` plugin. Visit '+Majestic.info.homesite+' to download it.');
			}

			// > We can give options to life elemnt
			var options = arguments.length>1 && typeof arguments[1] == 'object' ? arguments[1] : {}; 

			var wid = function() {
			};
					
			var plug = new wid();
			Majestic.api.extend(plug, Majestic.widgets[arguments[0]]);
					
							
			plug.elements = this;
			plug.options = Majestic.api.extend(plug.options, options);
			plug.classname = arguments[0];
			
			// > ! Append life variable to element
			Majestic(this)[0].applet = plug;

			try {
				
			} catch(e) {
				
				throw('Majestic error: undefined plugin `'+arguments[0]+'`');
				return {};
			}
			
			
			var result = plug.execute();
			
			return plug;
		}
	}

	window.Majestic.applets = {};
	window.Majestic.applet = window.Majestic.ext.applet = function() {
		if (this === window || typeof this == 'function') {
			// > name of applet
			var name = arguments[0];
			// > data
			if (arguments.length>1) {
				switch(typeof arguments[1]) {
					case 'object':
						var $data = arguments[1];
					break;
					case 'string': // copy
						var copy = arguments[1];
						if (typeof Majestic.applets[copy] != 'undefined') {
							$data = this.api.extend({}, Majestic.applets[copy]);
						} else {
							$data = {};
						};
						if (arguments.length>2 && typeof arguments[2] == 'object') {
							$data = this.api.extend($data, arguments[2]);
						};						
					break;
				}
				
			} else {
				$data = {};
			};			
			
			// > add to installed compoennts
			if (this.amd.defined.indexOf('majestic.'+name)<0) 
			this.amd.defined.push('majestic.'+name);

			// > return applet protptype if exists
			if (name && typeof Majestic.applets[name] != 'undefined') return Majestic.api.extend(Majestic.applets[name], $data);

			// > create new applet
			var applet = {
				elements: null,
				options: {}
			};

			// merge with $data and make it Majestic module
			applet = Majestic.api.extend(applet, $data);

			Majestic.applets[name] = applet;
			
			
			if (!name) return this;
			else return Majestic.applets[name];
		} else {
			// > Test for plugin exists
			if (typeof Majestic.applets[arguments[0]] != 'object') {
				
				throw('Majestic: require `'+arguments[0]+'` applet. Visit '+Majestic.info.homesite+' to download it.');
			}

			// > We can give options to life elemnt
			var options = arguments.length>1 && typeof arguments[1] == 'object' ? arguments[1] : {}; 

			var wid = function() {
			};
					
			var plug = new wid();
			plug = Majestic.api.extend(plug, Majestic.applets[arguments[0]]);
			plug = Majestic.module(plug).setConfig({
				name : arguments[0]
			});		
				
			plug.elements = this;
			
			plug.options = Majestic.api.extend(plug.options, options, true);
			plug.tie = function(callback) {
				callback.apply(this);
				return this;
			}
			// > ! Append life variable to element
			Majestic(this)[0].applet = plug;

			try {
				
			} catch(e) {
				
				throw('Majestic error: undefined plugin `'+arguments[0]+'`');
				return {};
			}

			// > inside tie function
			if (typeof arguments[2] == "function") {
				arguments[2].apply(plug);
			}

			var result = plug.execute();
			if (typeof result == 'undefined') return plug;
			else return result;
		}
	}

	window.Majestic.plugin = window.Majestic.ext.plugin = function() {
		
		if (this === window || typeof this == 'function') {
			
			var name = arguments[0];
			if (arguments.length>1 && typeof arguments[1] == 'object') var $data = arguments[1];
			else $data = {};
			
			
			
			if (name && typeof Majestic.plugin[name] != 'undefined') return Majestic.api.extend(Majestic.plugin[name], plugin);
			
			// -- init plugin
			var plugin = {
				elements: null,
				options: {}
			};
		
			plugin = Majestic.api.extend(plugin, $data);
			Majestic.api.extend(plugin, Majestic.module({
				
			})).setConfig({
				name : name
			});
			
			Majestic.plugin[name] = plugin;
			
			
			if (!name) return this;
			else return Majestic.plugin[name];
		} else {
				
				var options = arguments.length>1 && typeof arguments[1] == 'object' ? arguments[1] : {};
				
				var plug = function() {
					};
					
					plug = new plug();
					Majestic.api.extend(plug, Majestic.plugin[arguments[0]]);
					
					
					
					plug.elements = this;
					
					plug.options = Majestic.api.extend(plug.options, options);
				
				try {
					
				} catch(e) {
					
					throw('Majestic error: undefined plugin `'+arguments[0]+'`');
					return {};
				}
				return plug.execute();
		};
	};
	
	window.Majestic.plugin.prototype = {
		constructor: window.Majestic.plugin
	};
	
	/*
	majestic document
	*/
	window.Majestic.document = {
	
	};
	
	/*
	window.Majestic.document.uin
	*/
	
	window.Majestic.document.identifiers = {
		all: [],
		create: function(prefix) {
			
			
			var id = (prefix || '')+Majestic.api.rand(111111111,9999999999);
			var protect = 0;
			while (this.all.indexOf(id)>-1) {
				var id = (prefix || '')+Majestic.api.rand(111111111,9999999999);
				protect++;
				if (protect>100) {
					throw('deadly loop');
					break; return false;
				};
			};
			
			this.all.push(id);
			return id;
		}
	};
	
	// ref
	window.Majestic.document.createid = function(prefix) { return window.Majestic.document.identifiers.create(prefix || ''); };
	
	/*
	majestic document zindex
	*/
	window.Majestic.document.zindex = {
		max: 0,
		all	: [],
		recalc	: function() {
			while (!this.all[this.max] && this.max!=0) {
				this.max--;
			};
		},
		get : function(count) {
			for(var i = 1; i<=count; i++) {
				this.all[this.max+i] = true;
			};
			
			this.max += count;
			
			return this.max-(count-1);
		},
		free : function(index, count) {
			if (typeof(index) != 'object') {
				indexes = [index];
				if (typeof(count) == 'number') {
					for (var i=1;i<count;i++) {
						
						indexes.push(index+i);
					};
				};
			} else {
				var indexes = [index];
			};
			
			for (var i=0;i<indexes.length;i++) {
				
				window.Majestic.document.zindex.all[indexes[i]] = false;
			};
			window.Majestic.document.zindex.recalc();
		}
	};
	
	/*[[ext]]*/
	/*[[plugins]]*/



	// > Eval on load queues
	if (onFillQueues.length>0) {

		for (var q = 0;q<onFillQueues.length;q++) {		

			window.Majestic.includeQueue(onFillQueues[q]);
		}
	}
	onFillQueues = false;

	define(function() {
		return window.Majestic;
	});
	
})(typeof define === 'function' && define.amd ? define : function(Majestic) {
   
    //var _Majestic = window.Majestic,
    //    Majestic = factory();
   // window.Majestic = Majestic();
    //Majestic.noConflict = function() {
      //  window.Majestic = _Majestic;
//return Majestic;
    //}
});