/*!
 * miraclebush UIL framework
 *
 * Version 1.0.
 *
 * Released under the MIT license:

Copyright (C) 2014 Vladimir Kalmykov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 * Visit for more info: http://miraclebush.vladimirkalmykov.com/
* miraclebush using Sizzle lib (http://sizzlejs.com/)
 */

/* Starting miraclebush */
(function(window) {
	
	var binds = [];
	
	window.$kust = window.$bush = window.Miracle = function() {
		
		if (this === window) {
			
			var air = new window.Miracle;
			var callback = false;
			switch (arguments.length) {
				case 2:
					var selector = arguments[0];
					var options = arguments[1];
					
					var elements = Miracle.nodeQuery.call(this, selector);
					
				break;
				case 1:
					var selector = arguments[0];
					var options = {};
					var elements = Miracle.nodeQuery.call(this, selector);
					
				break;
				case 0:
					var selector = '';
					var options = {};
					var elements = Miracle.nodeQuery.call(this, selector);
				break;
			}
			
			// > First arguments is a function = context/depend mode
			switch(typeof selector) {
				case 'function':
					callback = selector;
					selector = '';
					// > Check for options
					if (Miracle.isArray(options)) {
						// Look for depends existings
						for (var i=0;i<options.length;i++) {
							
							if (typeof window.Miracle.ext.installedComponents[options[i]] == 'undefined') {
								throw('Miracle: required `'+options[i]+'` component. Visit '+Miracle.info.homesite+' to get it');
							};
						};
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
			air.miracleBush = '1.2';
			// eval callback
			if (typeof callback == 'function') {
				callback.apply(air);
			};

			return air;
		}
	};
	
	window.Miracle.ext = window.Miracle.prototype = {
		selector: "",
		constructor: window.Miracle,
		init: function( selector ) {
			return window.Miracle.ext.constructor;
		}
	};
	
	// > Installed compoents (components include plugins & extensions);
	window.Miracle.installedComponents = window.Miracle.ext.installedComponents = {};

	window.Miracle.info = {
		homesite: 'http://miracle.vladimirkalmykov.com'
	};

	// Try to get preposition of selector
	window.Miracle.bench = window.Miracle.ext.bench = function(args, tieback) {
		var elem;
		if (args.length > 1) {
			if (typeof args[0] === "object") elem = Miracle(args[0]) || this.selector;
			else {
				elem = Miracle.nodeQuery(args[0]);
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
	
	window.Miracle.nodeQuery = window.Miracle.ext.nodeQuery = function(query) {
		
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
					} else if (typeof query.miracleBush == 'string') {
						return query;					
					} else {
						return [query];
					};
				}
			break;
		};
	};
	
	// > PHP like function
	window.Miracle.isArray = function(obj) {
		if (obj instanceof Array) return true;
		return false;
	}

	window.Miracle.each = window.Miracle.ext.each = function() {
		
		return Miracle.bench.call(this, arguments, function(elem, options) {
			
			for (var i=0; i<elem.length; i++) {
				
				options.call(elem[i], i, elem[i]);
			};
			return elem;
		});
	};
	
	window.Miracle.put = window.Miracle.ext.put = function() {
		return Miracle.bench.call(this, arguments, function(elem, options) {
			switch(typeof options) {
				case 'string':
					var node = Miracle.nodeQuery.call(this, options);
					var elem = elem;
					
					Miracle(elem).each(function() {
						this.appendChild(node[0]);
					});
					
				break;
				case 'object':
					var node = options[0];
					
					Miracle(elem).each(function() {
						this.appendChild(node);
					});
					
				break;
			};
			
			return Miracle(node);
		});
	};
	
	window.Miracle.css = window.Miracle.ext.css = function() {
		
		return Miracle.bench.call(this, arguments, function(elem, options) {
			for (var i in options) {
				
				elem[0].style[i] = options[i]+'px';
			};		
			return Miracle(elem);
		});
	};
	
	window.Miracle.attr = window.Miracle.ext.attr = function() {
		var elem;
		return Miracle.bench.call(this, arguments, function(elem, options) {
			var options = options;
				Miracle(elem).each(function() {
					for (var i in options) {
						this.setAttribute(i, options[i]+'px');
					};	
				});
			return Miracle(elem);
		});
	};
	
	window.Miracle.width = window.Miracle.ext.width = function() {
		return Miracle.bench.call(this, arguments, function(elem, options) {
			return elem[0].offsetWidth;
		});
	};
	
	window.Miracle.height = window.Miracle.ext.height = function() {
		return Miracle.bench.call(this, arguments, function(elem, options) {
			return elem[0].offsetHeight;
		});
	};
	
	window.Miracle.html = window.Miracle.ext.html = function(html) {
		var html = html || '';
		return Miracle.bench.call(this, arguments, function(elem, options) {
			
			return elem[0].innerHTML = html;
		});
	};
	
	/* miraclebush.domReady */
	window.Miracle.domReady = function(callback) {
		
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
	window.Miracle.browser = {
		
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
		
	}).call(window.Miracle.browser, navigator);
	
	/* miraclebush.api */	
	window.Miracle.api = {};
	
	window.Miracle.api.rand = function(min, max) {
		var rand = min - 0.5 + Math.random()*(max-min+1)
		return  Math.round(rand);
	};
	
	/* return value if it present in array `variants` or `fault` */
	window.Miracle.api.only = function(variants, fault, value, ignoreCase) {
		var ignoreCase = ignoreCase || false;
		if (ignoreCase) value = value.toLowerCase();
		for (var i=0;i<variants.length;i++) {
			if (ignoreCase) variants[i]=variants[i].toLowerCase();
			if (variants[i]==value) return value;
		};
		return fault;
	};
	
	/* foreach child elements that has attrName */

	window.Miracle.api.eachByAttr = function(el, attrName, eachcallback) {
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
	
	window.Miracle.api.hasAttribute = function(el, attrName) {
		var attrName = attrName.split('[').join('\\[').split(']').join('\\]');
			
		if (el.getAttribute(attrName)!=null) return true;
		else return false;
	};
	
	/* miraclebush modules constrcutor */
	window.Miracle.module = function(module) {
		return Miracle.api.extend(module, {
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
			}
		});
	};
	
	// extend
	window.Miracle.api.extend = function() {
			
			var target = arguments[0], proto = arguments[1];
			
			for (var i in proto) {
				switch ( typeof proto[i] ) {
					case 'undefined':
					case 'null':
						target[i] = null;
					break;
					case 'object': 
						if (proto[i] instanceof Array) {
							target[i] = [];
							
							Miracle.api.extend(target[i],proto[i]);
						} else {
							target[i] = {};
							
							Miracle.api.extend(target[i],proto[i]);
						};
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
	/* miraclebush uil constructor */
	window.Miracle.library = window.Miracle.ui = function() {
		
		if (this === window || typeof this == 'function') {
			if (typeof arguments[0] == 'string') {
				var name = arguments[0];
				if (arguments.length>1) {
					if (typeof arguments[1] == 'string') {
						var uil = Miracle.ui[arguments[1]];
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
			
			if (name && typeof Miracle.ui[name] != 'undefined') return Miracle.api.extend(Miracle.ui[name], uil);
			
			Miracle.api.extend(uil, Miracle.module({
				widgets : {},
				count: 0,
				init : function() {
					
					var uil = this;
					
					// listen
					this.listen();
					
					// Framework events
					this.bind('beforeParse', function(el, widget) {
						Miracle.ui.trigger('beforeParse', [uil, el, widget]);
					});
					
					this.bind('afterParse', function(el, widget) {
						Miracle.ui.trigger('afterParse', [uil, el, widget]);
					});
					
					return this;	
				},
				relisten: function() {
					if(document.readyState == 'complete') uil.parse(window.document.getElementsByTagName('body')[0]); 
				},
				listen: function() {
					
					Miracle.domReady(function(e) {
						
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
					Miracle.api.eachByAttr(el, 'ui-'+this.config.name, function() {
						
						var widget = this.getAttribute('ui-'+uil.config.name+'');
						if (Miracle.api.hasAttribute(this, 'ui-initialized')) return this; 
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
					
					Miracle.api.eachByAttr(el, 'data-ui-'+this.config.name, function() {
						var widget = this.getAttribute('data-ui-'+uil.config.name+'');
						if (Miracle.api.hasAttribute(this, 'ui-initialized')) return this; 
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
							if (name) this.widgets[name] = Miracle.module(widget_content);
							else return Miracle.module(widget_content);
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
				Miracle.ui.names.push(name);
				if (name) Miracle.ui[name] = this;
			});
			
			if (!name) return this;
			else return Miracle.ui[name];
		};
	};
	
	window.Miracle.ui = window.Miracle.module(window.Miracle.ui);
	
	window.Miracle.ui.prototype = {
		constructor: window.Miracle.ui
	};
	
	window.Miracle.ui.names = [];
	window.Miracle.ui.parse = function(el) {
		var el = el || window.document.getElementsByTagName('body')[0];
		for(var i=0;i<Miracle.ui.names.length;i++) {
			Miracle.ui[Miracle.ui.names[i]].parse(el);
		};
	};

	/*
		Creating extension
	*/
	window.Miracle.extension = function(name, callback) {
		if (typeof this.installedComponents[name] == 'undefined') this.installedComponents[name] = 0;
		this.installedComponents[name]++;
		callback.apply(window.Miracle);
	};

	/*
	Create/addon widget by method life
	Example:
	Miracle.life('mywidget', {
		exec : function() {
			return this.hello();
		}
	}); // < Creating new life element
	
	// > append new function to exists widget by method life
	Miracle.life('mywidget').hello = function() {
		
	};

	// > Make a copy of widget by method life
	Miracle.life('newWidget', 'mywidget', {
		exec : function() {
			return this.hi();
		}
	})

	// > Make life to node element by method life
	Miracle('#mywrap').life('mywidget');

	*/
	window.Miracle.plugins = {};
	window.Miracle.life = window.Miracle.ext.life = function() {
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
						if (typeof Miracle.plugins[copy] != 'undefined') {
							$data = this.api.extend({}, Miracle.plugins[copy]);
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
			if (name && typeof Miracle.plugins[name] != 'undefined') return Miracle.api.extend(Miracle.plugins[name], $data);

			// > create new widget
			var widget = {
				elements: null,
				options: {}
			};

			// merge with $data and make it Miracle module
			widget = Miracle.api.extend(widget, $data);
			Miracle.api.extend(widget, Miracle.module({
				
			})).setConfig({
				name : name
			});

			Miracle.plugins[name] = widget;
			
			
			if (!name) return this;
			else return Miracle.plugins[name];
		} else {
			// > Test for plugin exists
			if (typeof Miracle.plugins[arguments[0]] != 'object') {
				throw('Miracle: require touch plugin. Visit '+Miracle.info.homesite+' to download it.');
			}

			// > We can give options to life elemnt
			var options = arguments.length>1 && typeof arguments[1] == 'object' ? arguments[1] : {}; 

			var wid = function() {
			};
					
			plug = new wid();
			Miracle.api.extend(plug, Miracle.plugins[arguments[0]]);
					
							
			plug.elements = this;
			plug.options = Miracle.api.extend(plug.options, options);
			
			// > ! Append life variable to element
			Miracle(this)[0].life = plug;

			try {
				
			} catch(e) {
				
				throw('Miracle error: undefined plugin `'+arguments[0]+'`');
				return {};
			}

			var result = plug.execute();
			if (typeof result == 'undefined') return plug;
			else return result;
		}
	}

	window.Miracle.plugin = window.Miracle.ext.plugin = function() {
		
		if (this === window || typeof this == 'function') {
			
			var name = arguments[0];
			if (arguments.length>1 && typeof arguments[1] == 'object') var $data = arguments[1];
			else $data = {};
			
			
			
			if (name && typeof Miracle.plugin[name] != 'undefined') return Miracle.api.extend(Miracle.plugin[name], plugin);
			
			// -- init plugin
			var plugin = {
				elements: null,
				options: {}
			};
		
			plugin = Miracle.api.extend(plugin, $data);
			Miracle.api.extend(plugin, Miracle.module({
				
			})).setConfig({
				name : name
			});
			
			Miracle.plugin[name] = plugin;
			
			
			if (!name) return this;
			else return Miracle.plugin[name];
		} else {
				
				var options = arguments.length>1 && typeof arguments[1] == 'object' ? arguments[1] : {};
				
				var plug = function() {
					};
					
					plug = new plug();
					Miracle.api.extend(plug, Miracle.plugin[arguments[0]]);
					
					
					
					plug.elements = this;
					
					plug.options = Miracle.api.extend(plug.options, options);
				
				try {
					
				} catch(e) {
					
					throw('Miracle error: undefined plugin `'+arguments[0]+'`');
					return {};
				}
				return plug.execute();
		};
	};
	
	window.Miracle.plugin.prototype = {
		constructor: window.Miracle.plugin
	};
	
	/*
	miraclebush document
	*/
	window.Miracle.document = {
	
	};
	
	/*
	window.Miracle.document.uin
	*/
	
	window.Miracle.document.identifiers = {
		all: [],
		create: function(prefix) {
			
			
			var id = (prefix || '')+Miracle.api.rand(111111111,9999999999);
			var protect = 0;
			while (this.all.indexOf(id)>-1) {
				var id = (prefix || '')+Miracle.api.rand(111111111,9999999999);
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
	window.Miracle.document.createid = function(prefix) { return window.Miracle.document.identifiers.create(prefix || ''); };
	
	/*
	miraclebush document zindex
	*/
	window.Miracle.document.zindex = {
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
				
				window.Miracle.document.zindex.all[indexes[i]] = false;
			};
			window.Miracle.document.zindex.recalc();
		}
	};
	
	/*[[ext]]*/
	/*[[plugins]]*/
})(window);