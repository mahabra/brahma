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
	
	window.$bush = function() {
		
		if (this === window) {
			
			var air = new window.$bush;
			
			switch (arguments.length) {
				case 2:
					var selector = arguments[0];
					var options = arguments[1];
					
					var elements = $bush.nodeQuery.call(this, selector);
					
				break;
				case 1:
					var selector = arguments[0];
					var options = {};
					var elements = $bush.nodeQuery.call(this, selector);
					
				break;
				case 0:
					var selector = '';
					var options = {};
					var elements = $bush.nodeQuery.call(this, selector);
				break;
			}
			
			for (var index=0;index<elements.length;index++) {
				
				air[index] = elements[index];
				
			};
			
			if (index>1) air.context = document;
			else if (index>0) air.context = elements[0].parentNode;
			else air.context = null;
			air.length = index;
			air.selector = selector;
			
			return air;
		}
	};
	
	window.$bush.ext = window.$bush.prototype = {
		selector: "",
		constructor: window.$bush,
		init: function( selector ) {
			return window.$bush.ext.constructor;
		}
	};
	
	// Try to get preposition of selector
	window.$bush.bench = window.$bush.ext.bench = function(args, tieback) {
		var elem;
		if (args.length > 1) {
			if (typeof args[0] === "object") elem = $bush(args[0]) || this.selector;
			else {
				elem = $bush.nodeQuery(args[0]);
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
	
	window.$bush.nodeQuery = window.$bush.ext.nodeQuery = function(query) {
		
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
					} else {
						return [query];
					};
				}
			break;
		};
	};
	
	window.$bush.each = window.$bush.ext.each = function() {
		
		return $bush.bench.call(this, arguments, function(elem, options) {
			
			for (var i=0; i<elem.length; i++) {
				
				options.call(elem[i], i, elem[i]);
			};
			return elem;
		});
	};
	
	window.$bush.put = window.$bush.ext.put = function() {
		return $bush.bench.call(this, arguments, function(elem, options) {
			switch(typeof options) {
				case 'string':
					var node = $bush.nodeQuery.call(this, options);
					var elem = elem;
					
					$bush(elem).each(function() {
						this.appendChild(node[0]);
					});
					
				break;
				case 'object':
					var node = options[0];
					
					$bush(elem).each(function() {
						this.appendChild(node);
					});
					
				break;
			};
			
			return $bush(node);
		});
	};
	
	window.$bush.css = window.$bush.ext.css = function() {
		
		return $bush.bench.call(this, arguments, function(elem, options) {
			for (var i in options) {
				
				elem[0].style[i] = options[i]+'px';
			};		
			return $bush(elem);
		});
	};
	
	window.$bush.attr = window.$bush.ext.attr = function() {
		var elem;
		return $bush.bench.call(this, arguments, function(elem, options) {
			var options = options;
				$bush(elem).each(function() {
					for (var i in options) {
						this.setAttribute(i, options[i]+'px');
					};	
				});
			return $bush(elem);
		});
	};
	
	window.$bush.width = window.$bush.ext.width = function() {
		return $bush.bench.call(this, arguments, function(elem, options) {
			return elem[0].offsetWidth;
		});
	};
	
	window.$bush.height = window.$bush.ext.height = function() {
		return $bush.bench.call(this, arguments, function(elem, options) {
			return elem[0].offsetHeight;
		});
	};
	
	window.$bush.html = window.$bush.ext.html = function(html) {
		var html = html || '';
		return $bush.bench.call(this, arguments, function(elem, options) {
			
			return elem[0].innerHTML = html;
		});
	};
	
	/* miraclebush.domReady */
	window.$bush.domReady = function(callback) {
		if (typeof binds.domReady != 'object') binds.domready = [];
		binds.push(callback);
		document.onload = window.onload = function(e) {
			var e = e;
			
			for (var i=0; i<binds.length;i++) {
				binds[i].call(e);
			}
		};
	}
	
	/* miraclebush.api */	
	window.$bush.api = {};
	
	window.$bush.api.rand = function(min, max) {
		var rand = min - 0.5 + Math.random()*(max-min+1)
		return  Math.round(rand);
	};
	
	window.$bush.api.only(variants, fault, value, ignoreCase) {
		var ignoreCase = ignoreCase || false;
		if (ignoreCase) value = value.toLowerCase();
		for (var i=0;i<variants.length;i++) {
			if (ignoreCase) variants[i]=variants[i].toLowerCase();
			if (variants[i]==value) return value;
		};
		return fault;
	};
	
	window.$bush.api.eachByAttr = function(el, attrName, eachcallback) {
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
	
	window.$bush.api.hasAttribute = function(el, attrName) {
		var attrName = attrName.split('[').join('\\[').split(']').join('\\]');
			
		if (el.getAttribute(attrName)!=null) return true;
		else return false;
	};
	
	/* miraclebush modules constrcutor */
	window.$bush.module = function(module) {
		return $bush.api.extend(module, {
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
			}
		});
	};
	
	// We love jQuery.extend, but we need more independent and support non-jQuery-projects.
	window.$bush.api.extend = function() {
			var src, copyIsArray, copy, name, options, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
			if ( typeof target === "boolean" ) {
				deep = target;
				target = arguments[ i ] || {};
				i++;
			};
			
			if ( typeof target !== "object" && !(typeof target == 'function') ) {
				target = {};
			};			
			if ( i === length ) {
				target = this;
				i--;
			};
			for ( ; i < length; i++ ) {
				
				if ( (options = arguments[ i ]) != null ) {
					
					for ( name in options ) {
						src = target[ name ];
						copy = options[ name ];

						
						if ( target === copy ) {
							continue;
						}

						
						if ( deep && copy && ( (function(obj) { if (!obj || typeof (obj) !== "object" || obj.nodeType || ( obj == window )) return false; else return true; })(copy) || (copyIsArray = (function(value) { if (value instanceof Array) return true; else return false; })(copy)) ) ) {
							if ( copyIsArray ) {
								copyIsArray = false;
								clone = src && (function() { if (value instanceof Array) return true; else return false; })(src) ? src : [];

							} else {
								clone = src && (function(obj) { if (!obj || typeof (obj) !== "object" || obj.nodeType || ( obj == window )) return false; else return true; })(src) ? src : {};
							}

							
							target[ name ] = extend( deep, clone, copy );

						
						} else if ( copy !== undefined ) {
							target[ name ] = copy;
						}
					}
				}
			}
			return target;
		};
	
	/* miraclebush uil constructor */
	window.$bush.ui = function() {
		
		if (this === window || typeof this == 'function') {
			if (typeof arguments[0] == 'string') {
				var name = arguments[0];
				if (arguments.length>1) {
					if (typeof arguments[1] == 'string') {
						var uil = $bush.ui[arguments[1]];
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
			
			if (name && typeof $bush.ui[name] != 'undefined') return $bush.api.extend($bush.ui[name], uil);
			
			$bush.api.extend(arguments[1], $bush.module({
				widgets : {},
				init : function() {
					
					var uil = this;
					
					$bush.domReady(function(e) {
						uil.parse(window.document.getElementsByTagName('body')[0]); 
					});
					
					if (typeof jQuery != 'undefined') {
						// jQuery support
						$(document).on('change', function(e, el) {
							uil.parse(el || $('body'));
						});
					};
					
					// Framework events
					this.bind('beforeParse', function(el, widget) {
						$bush.ui.trigger('beforeParse', [uil, el, widget]);
					});
					
					this.bind('afterParse', function(el, widget) {
						$bush.ui.trigger('afterParse', [uil, el, widget]);
					});
					
					return this;	
				},
				parse : function(el) { 
					var uil = this;
					$bush.api.eachByAttr(el, 'ui-'+this.config.name, function() {
						
						var widget = this.getAttribute('ui-'+uil.config.name+'');
						if ($bush.api.hasAttribute(this, 'ui-initialized')) return this; 
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
					
					$bush.api.eachByAttr(el, 'data-ui-'+this.config.name, function() {
						var widget = this.getAttribute('data-ui-'+uil.config.name+'');
						if ($bush.api.hasAttribute(this, 'ui-initialized')) return this; 
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
							if (name) this.widgets[name] = $bush.module(widget_content);
							else return $bush.module(widget_content);
						break;
					};
					return this;
				}
			})).setConfig({
				name :  arguments[0]
			}).init()
			.tie(function() {
				$bush.ui.names.push(name);
				if (name) $bush.ui[name] = this;
			});
			
			if (!name) return this;
			else return $bush.ui[name];
		};
	};
	
	window.$bush.ui = window.$bush.module(window.$bush.ui);
	
	window.$bush.ui.prototype = {
		constructor: window.$bush.ui
	};
	
	window.$bush.ui.names = [];
	window.$bush.ui.parse = function(el) {
		var el = el || window.document.getElementsByTagName('body')[0];
		for(var i=0;i<$bush.ui.names.length;i++) {
			$bush.ui[$bush.ui.names[i]].parse(el);
		};
	};
	
	window.$bush.plugin = window.$bush.ext.plugin =function() {
		
		if (this === window || typeof this == 'function') {
			
			var name = arguments[0];
			if (arguments.length>1 && typeof arguments[1] == 'object') var $data = arguments[1];
			else $data = {};
			
			
			
			if (name && typeof $bush.plugin[name] != 'undefined') return $bush.api.extend($bush.plugin[name], plugin);
			
			// -- init plugin
			var plugin = {
				elements: null,
				options: {}
			};
		
			plugin = $bush.api.extend(plugin, $data);
			$bush.api.extend(plugin, $bush.module({
				
			})).setConfig({
				name : name
			});
			
			$bush.plugin[name] = plugin;
			
			if (!name) return this;
			else return $bush.plugin[name];
		} else {
				var options = arguments.length>1 && typeof arguments[1] == 'object' ? arguments[1] : {};
				try {
					var plug = new (function() {
					})();
					$bush.api.extend(plug, $bush.plugin[arguments[0]]);
					plug.elements = this;
					plug.options = $bush.api.extend(plug.options, options);
				} catch(e) {
					console.log(e);
					throw('$bush error: undefined plugin `'+arguments[0]+'`');
					return {};
				}
				return plug.initial();
		};
	};
	
	window.$bush.plugin.prototype = {
		constructor: window.$bush.plugin
	};
	
	/*
	miraclebush document
	*/
	window.$bush.document = {
	
	};
	
	/*
	window.$bush.document.uin
	*/
	
	window.$bush.document.identifiers = {
		all: [],
		get: function(prefix) {
			do {
				var id = (prefix || '')+$bush.api.rand();
			} while(all.indexOf(id)>-1);
			this.all.push(id);
			return id;
		}
	};
	
	/*
	miraclebush document zindex
	*/
	window.$bush.document.zindex = {
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
				
				window.$bush.document.zindex.all[indexes[i]] = false;
			};
			window.$bush.document.zindex.recalc();
		}
	};
	
	/*[[ext]]*/
	/*[[plugin]]*/
})(window);