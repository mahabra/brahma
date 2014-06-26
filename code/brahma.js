/*  
require and requirecss functions 
performed by Vladimir Kalmykov, 2013 under MIT license
Use it if requirejs is not defined.
 */ 
if (typeof window.require != "function") {
	window.require = function(e, t) {
		var n = new function(e, t) {

			if (typeof e == "string") e = [e];
			this.loads = e.length;
			this.src = e;
			this.stop = false;
			this.callback = t || false;
			this.init = function() {
				var e = this;
				for (var t = 0; t < this.src.length; t++) {
					
					var q = (typeof window.require._config.paths[this.src[t]] == "string") ? window.require._config.paths[this.src[t]] : this.src[t];
					var n = q.substr(q.length - 3, 3) != ".js" ? q + ".js" : q;
					if (window.require._defined.indexOf(q)>-1) { e.loaded(n); return; };
					var r = function() {
						return document.documentElement || document.getElementsByTagName("HEAD")[0]
					}().appendChild(document.createElement("SCRIPT"));
					r.setAttribute("type", "text/javascript");
					r.setAttribute("async", false);
					r.onload = function() {
						window.require._defined.push(n);
						e.loaded(n)
					};
					r.src = n+(function(args) {
						if (args!='') return '?'+args;
						return '';
					})(window.require._config.urlArgs);
				}
			};
			this.loaded = function(e) {
				if (this.stop) return;
				this.loads--;
				if (this.loads < 1) {
					if (typeof this.callback == "function") this.callback();
					this.stop = true
				}
			};
			this.init()
		}(e, t || false)
	};
	window.require.ext = window.require.prototype = {
		selector: "",
		constructor: window.require,
		init: function( ) {
			return window.require.ext.constructor;
		}
	};
	window.require._defined = [];
	window.require._config = {
		urlArgs: '',
		paths: {}
	}
	window.require.config = function(data) {
		var data = data || {};
		if (typeof data.paths == 'object') {
			for (var i in data.paths) {
				window.require._config.paths[i] = data.paths[i];
			}
		}
	};
};
if (typeof window.requirecss != "function") var requirecss = function(e, t) {
	if (typeof e != "object") e = [e];
	for (var n = 0; n < e.length; n++) {
		var r = e[n].substr(e[n].length - 4, 4) != ".css" ? e[n] + ".css" : e[n];
		var i = function() {
			return document.documentElement || document.getElementsByTagName("HEAD")[0]
		}().appendChild(document.createElement("LINK"));
		i.setAttribute("rel", "stylesheet");
		i.onload = t;
		i.href = r
	}
};

/*!
 * brahma UIL framework
 *
 * Version 1.0.
 *
 * Released under the MIT license:

Copyright (C) 2014 Vladimir Kalmykov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 * Visit for more info: http://brahma.vladimirkalmykov.com/
* brahma using Sizzle lib (http://sizzlejs.com/)
 */

/* Starting brahma */
(function(define) {
	
	var binds = [];
	var onFillQueues = [];

	if (typeof window.Brahma == "function") {
		delete(window.Brahma);
	};
	window.Get = window.$brahma = window.Brahma = function() {
		
		if (this === window) {
			
			var air = new window.Brahma;
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
						var elements = Brahma.nodeQuery.call(this, selector);
					};
				break;
				case 1:
					var selector = arguments[0];
					var options = {};
					var elements = Brahma.nodeQuery.call(this, selector);
					
				break;
				case 0:
					var selector = '';
					var options = {};
					var elements = Brahma.nodeQuery.call(this, selector);
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
					
					if (Brahma.isArray(options) && options.length>0) {
						
						require_amd = options;
					} else {
						/* eval factory now */
						air.amd.ready(function() {
							
							callback.apply(this);
						});
					};
				break;
			};

			if (typeof elements != "undefined") for (var index=0;index<elements.length;index++) {
				
				air[index] = elements[index];
				
			};
			
			if (index>1) air.context = document;
			else if (index>0) air.context = elements[0].parentNode;
			else air.context = null;
			air.length = index;
			air.selector = selector;
			air.brahmaBush = '1.2';
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
	
	window.Brahma.ext = window.Brahma.prototype = {
		selector: "",
		constructor: window.Brahma,
		init: function( selector ) {
			return window.Brahma.ext.constructor;
		}
	};
	
	window.Brahma.info = {
		homesite: 'http://brahma.vladimirkalmykov.com',
		version: '1.2.1.1'
	};

	/*
		Throw exception and die
	*/
	window.Brahma.die = window.Brahma.ext.die = function(message) {
			throw('Brahma: '+message);
	};

	/*
	AMD service
	*/
	window.Brahma.amd = window.Brahma.ext.amd = new (function(Brahma) {
		this.M = Brahma;
		this.loadings = 0;
		this.queue = [];
		this.defined = [];
		this.requested = []; // < queues that already request or requested
		this.isReady = function(depends) {
			var depends = depends || false;
			if (!depends || typeof depends != 'object') {
				if (this.loadings>0) return false;
				return true;
			} else {
				for (var i=0;i<depends.length;i++) {

					if (this.defined.indexOf(depends[i])<0) {
						return false;
					};

				};

				return true;
			}
		};
		this.ready = this.onReady = function() {

			if (arguments.length==1) {
				var callback = arguments[0];
				var depends = false;
			} else {
				var callback = arguments[1];
				var depends = arguments[0];
			};

			if (this.isReady(depends)) { callback.apply(this.M); }
			else {

				this.queue.push({
					callback: callback,
					depends: depends
				});
				//this.queue.reverse();
			};
		};
		this.require = function(amd, callback) {
			
			var that = this;
			var amd = amd;
			if (typeof require == 'function') {
				var real = [];
				for (var i =0;i<amd.length;i++) {
					if (this.requested.indexOf(amd[i]) < 0) {
						this.requested.push(amd[i]);
						real.push(amd[i]);
					};
				};

				if (real.length>0) {
					this.loadings++;
					
					require(real, function() {
						that.loaded(real);
					});
				};

				
				if (typeof callback == 'function') this.ready(amd, callback);
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
					
					queue = queue.reverse();
					for (var i =0; i<queue.length;i++) {
						// eval functions if this.loadings still < 1

						if (this.isReady(queue[i].depends)) {
							
							queue[i].callback.apply(this.M);
						}
						else this.queue.push(queue[i]);
					}
				}
			}
		}
	})(window.Brahma);

	/* > Include queue that initialed by calling Brahma('extension_name', function() {

	}, ['depends', 'components']) */
	window.Brahma.includeQueue = window.Brahma.ext.includeQueue = function(queue) {
		// > Check for require compoentns


		if (Brahma.isArray(queue.require_amd)) {
			// Look for depends existings
			var require_amd = [];
			
			for (var i=0;i<queue.require_amd.length;i++) {
				
				if (window.Brahma.amd.defined.indexOf(queue.require_amd[i])<0) {

					if ((typeof define == 'function' && define.amd) || typeof require == "function") {
						require_amd.push(queue.require_amd[i]);
						//
					} else {
						throw('Brahma: required `'+queue.require_amd[i]+'` module. Visit '+Brahma.info.homesite+'/required to get it');
					};
				} else {
					
				}
			};
		};
		
		/* its about requiring amd */
		if (require_amd.length>0) {
			
			Brahma.amd.require(require_amd, queue.callback);
		} else {
			
			/* if required compoennts defined execute */
			Brahma.amd.ready(queue.callback);
		};
	}

	// Try to get preposition of selector
	window.Brahma.bench = window.Brahma.ext.bench = function(args, tieback) {
		var elem;
		if (args.length > 1) {
			if (typeof args[0] === "object") elem = Brahma(args[0]) || this.selector;
			else {
				elem = Brahma.nodeQuery(args[0]);
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
	
	window.Brahma.nodeQuery = window.Brahma.ext.nodeQuery = function(query) {
		
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
					} else if (typeof query.brahmaBush == 'string') {
						return query;					
					} else {
						return [query];
					};
				}
			break;
		};
	};
	
	// > PHP like function
	window.Brahma.isArray = function(obj) {
		if (obj instanceof Array) return true;
		return false;
	}

	window.Brahma.each = window.Brahma.ext.each = function() {
		
		return Brahma.bench.call(this, arguments, function(elem, options) {
			
			for (var i=0; i<elem.length; i++) {
				
				options.call(elem[i], i, elem[i]);
			};
			return elem;
		});
	};
	
	window.Brahma.put = window.Brahma.ext.put = function() {
		return Brahma.bench.call(this, arguments, function(elem, options) {
			switch(typeof options) {
				case 'string':
					var node = Brahma.nodeQuery.call(this, options);
					var elem = elem;
					
					Brahma(elem).each(function() {
						this.appendChild(node[0]);
					});
					
				break;
				case 'object':
					var node = options[0];
					
					Brahma(elem).each(function() {
						this.appendChild(node);
					});
					
				break;
			};
			
			return Brahma(node);
		});
	};
	
	window.Brahma.css = window.Brahma.ext.css = function() {
		
		return Brahma.bench.call(this, arguments, function(elem, options) {
			for (var i in options) {
				
				elem[0].style[i] = options[i]+'px';
			};		
			return Brahma(elem);
		});
	};
	
	window.Brahma.attr = window.Brahma.ext.attr = function() {
		var elem;
		return Brahma.bench.call(this, arguments, function(elem, options) {
			var options = options;
				Brahma(elem).each(function() {
					for (var i in options) {
						this.setAttribute(i, options[i]+'px');
					};	
				});
			return Brahma(elem);
		});
	};
	
	window.Brahma.width = window.Brahma.ext.width = function() {
		return Brahma.bench.call(this, arguments, function(elem, options) {
			return elem[0].offsetWidth;
		});
	};
	
	window.Brahma.height = window.Brahma.ext.height = function() {
		return Brahma.bench.call(this, arguments, function(elem, options) {
			return elem[0].offsetHeight;
		});
	};
	
	window.Brahma.html = window.Brahma.ext.html = function(html) {
		var html = html || '';
		return Brahma.bench.call(this, arguments, function(elem, options) {
			
			return elem[0].innerHTML = html;
		});
	};
	
	/* brahma.domReady */
	window.Brahma.domReady = function(callback) {
		
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
	window.Brahma.browser = {
		
	};
	
	/* get browser version */
	(function(navigator) {
		this.opera = false;
		this.chrome = false;
		this.safari = false;
		this.firefox = false;
		this.mozilla = false;
		this.name = 'unknown';
		this.ie = false;
		this.iemin = false;
		
		if (navigator.userAgent.toLowerCase().indexOf('safari')>-1 && navigator.userAgent.toLowerCase().indexOf('apple')>-1 && navigator.userAgent.toLowerCase().indexOf('chrome')<0) {
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

		if (navigator.userAgent.toLowerCase().indexOf('mozilla')>-1 && navigator.userAgent.toLowerCase().indexOf('firefox')>-1 && navigator.userAgent.toLowerCase().indexOf('chrome')<0) {
			
			this.firefox = true;
			this.mozilla = true;
			this.name = 'firefox';
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
		
	}).call(window.Brahma.browser, navigator);
	
	/* brahma.api */	
	window.Brahma.api = {};
	
	window.Brahma.api.rand = function(min, max) {
		var rand = min - 0.5 + Math.random()*(max-min+1)
		return  Math.round(rand);
	};
	
	/* return value if it present in array `variants` or `fault` */
	window.Brahma.api.only = function(variants, fault, value, ignoreCase) {
		var ignoreCase = ignoreCase || false;
		if (ignoreCase) value = value.toLowerCase();
		for (var i=0;i<variants.length;i++) {
			if (ignoreCase) variants[i]=variants[i].toLowerCase();
			if (variants[i]==value) return value;
		};
		return fault;
	};
	
	/* foreach child elements that has attrName */

	window.Brahma.api.eachByAttr = function(el, attrName, eachcallback) {
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
	
	window.Brahma.api.hasAttribute = function(el, attrName) {
		var attrName = attrName.split('[').join('\\[').split(']').join('\\]');
			
		if (el.getAttribute(attrName)!=null) return true;
		else return false;
	};
	
	/* brahma modules constrcutor */
	window.Brahma.module = function(module) {
		return Brahma.api.extend(module, {
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
			// function deprecated
			tie : function(callback) {
				callback.call(this);
				return this;
			},
			with : function(callback) {
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
				return this;
			},
			// get config value
			get : function(key) {
				return this.config[key];
			}
		});
	};
	
	// extend
	window.Brahma.api.extend = function() {
			
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
								
								Brahma.api.extend(target[i],proto[i]);
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

	// extend recursive (unsafe)
	window.Brahma.api.extendRecursive = function() {
			
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
								
								window.Brahma.api.extendRecursive(target[i],proto[i]);
							} else if ( proto[i] != null && proto[i].constructor  &&
									!({}).hasOwnProperty.call( proto[i].constructor.prototype, "isPrototypeOf" )) {
                                
								target[i] = proto[i];
							} else {
                                if (typeof target[i] == "undefined") target[i] = {};
								 
							target[i] = window.Brahma.api.extendRecursive(target[i],proto[i]);
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

	/* brahma uil constructor */
	window.Brahma.library = window.Brahma.ui = function() {
		
		if (this === window || typeof this == 'function') {
			if (typeof arguments[0] == 'string') {
				var name = arguments[0];
				if (arguments.length>1) {
					if (typeof arguments[1] == 'string') {
						var uil = Brahma.ui[arguments[1]];
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
			
			if (name && typeof Brahma.ui[name] != 'undefined') return Brahma.api.extend(Brahma.ui[name], uil);
			
			Brahma.api.extend(uil, Brahma.module({
				widgets : {},
				count: 0,
				init : function() {
					
					var uil = this;
					
					// listen
					this.listen();
					
					// Framework events
					this.bind('beforeParse', function(el, widget) {
						Brahma.ui.trigger('beforeParse', [uil, el, widget]);
					});
					
					this.bind('afterParse', function(el, widget) {
						Brahma.ui.trigger('afterParse', [uil, el, widget]);
					});
					
					return this;	
				},
				relisten: function() {
					var uil = this;

					if(document.readyState == 'complete') uil.parse(window.document.getElementsByTagName('body')[0]); 
				},
				listen: function() {
					var uil = this;
					Brahma.domReady(function(e) {
						
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

					Brahma.api.eachByAttr(el, 'ui-'+this.config.name, function() {
						
						var widget = this.getAttribute('ui-'+uil.config.name+'');
						if (Brahma.api.hasAttribute(this, 'ui-initialized')) return this; 
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
					
					Brahma.api.eachByAttr(el, 'data-ui-'+this.config.name, function() {
						var widget = this.getAttribute('data-ui-'+uil.config.name+'');
						if (Brahma.api.hasAttribute(this, 'ui-initialized')) return this; 
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
							if (name) this.widgets[name] = Brahma.module(widget_content);
							else return Brahma.module(widget_content);
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
				Brahma.ui.names.push(name);
				if (name) Brahma.ui[name] = this;
			});
			
			if (!name) return this;
			else return Brahma.ui[name];
		};
	};
	
	window.Brahma.ui = window.Brahma.module(window.Brahma.ui);
	
	window.Brahma.ui.prototype = {
		constructor: window.Brahma.ui
	};
	
	window.Brahma.ui.names = [];
	window.Brahma.ui.parse = function(el) {
		
		var el = el || window.document.getElementsByTagName('body')[0];
		for(var i=0;i<Brahma.ui.names.length;i++) {
			Brahma.ui[Brahma.ui.names[i]].parse(el);
		};
	};

	/*
		Creating extension
	*/
	window.Brahma.extension = function(name, callback) {
		if (this.amd.defined.indexOf(name)<0) this.amd.defined.push(name);
		callback.apply(window.Brahma);
	};

	/*
	Create/addon widget by method life
	Example:
	Brahma.applet('mywidget', {
		exec : function() {
			return this.hello();
		}
	}); // < Creating new life element
	
	// > append new function to exists widget by method life
	Brahma.applet('mywidget').hello = function() {
		
	};

	// > Make a copy of widget by method life
	Brahma.applet('newWidget', 'mywidget', {
		exec : function() {
			return this.hi();
		}
	})

	// > Make life to node element by method life
	Brahma('#mywrap').applet('mywidget');

	*/
	window.Brahma.widgets = {};
	window.Brahma.widget = window.Brahma.ext.widget = function() {
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
						if (typeof Brahma.widgets[copy] != 'undefined') {
							$data = this.api.extend({}, Brahma.widgets[copy]);
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
			if (name && typeof Brahma.widgets[name] != 'undefined') return Brahma.api.extend(Brahma.widgets[name], $data);

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
					Brahma(options.panel).applet('visualjson', {
						rules: this.tuning,
						source: this.config,
						context: this,
						result: options.codeViewer,
						code: options.code || "Brahma(\"#example\").widget(\""+this.classname+"\", /*config*/);"
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
							var conditionUin = Brahma.api.rand(1,99999);
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

			// merge with $data and make it Brahma module
			widget = Brahma.api.extend(widget, $data);

			Brahma.api.extend(widget, Brahma.module({
				
			}));

			if (typeof $data.config == 'object') widget.config = Brahma.api.extend(widget.config, $data.config);
			



			Brahma.widgets[name] = widget;
			
			
			if (!name) return this;
			else return Brahma.widgets[name];
		} else {
			// > Test for plugin exists
			if (typeof Brahma.widgets[arguments[0]] != 'object') {
				throw('Brahma: require `'+arguments[0]+'` plugin. Visit '+Brahma.info.homesite+' to download it.');
			}

			// > We can give options to life elemnt
			var options = arguments.length>1 && typeof arguments[1] == 'object' ? arguments[1] : {}; 

			var wid = function() {
			};
					
			var plug = new wid();

			Brahma.api.extend(plug, Brahma.widgets[arguments[0]]);
					
							
			plug.elements = this;

			plug.config = Brahma.api.extend(plug.config, options);
			plug.classname = arguments[0];
			
			// > ! Append life variable to element
			/* I DONT KNOW WY BUT IT DOESNT WORK!!! */
			if (typeof Brahma(this)[0].widgets != 'object') Brahma(this)[0].widgets = {};
			Brahma(this)[0].widgets[arguments[0]] = plug;

			try {
				
			} catch(e) {
				
				throw('Brahma error: undefined plugin `'+arguments[0]+'`');
				return {};
			}
			
			
			var result = plug.execute();
			
			return plug;
		}
	}

	window.Brahma.applets = {};
	window.Brahma.applet = window.Brahma.ext.applet = function() {
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
						if (typeof Brahma.applets[copy] != 'undefined') {
							$data = this.api.extend({}, Brahma.applets[copy]);
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
			if (this.amd.defined.indexOf('brahma.'+name)<0) 
			this.amd.defined.push('brahma.'+name);

			// > return applet protptype if exists
			if (name && typeof Brahma.applets[name] != 'undefined') return Brahma.api.extend(Brahma.applets[name], $data);

			// > create new applet
			var applet = {
				elements: null,
				options: {},
				config: {},
				withSelector: function(callback) {

					if (typeof callback == 'function') callback.apply(this.elements);
					return this;
				}
			};

			// merge with $data and make it Brahma module
			applet = Brahma.api.extend(applet, $data);
			if (typeof $data.config == 'object') applet.config = Brahma.api.extend(applet.config, $data.config);

			Brahma.applets[name] = applet;
			
			
			if (!name) return this;
			else return Brahma.applets[name];
		} else {
			// > Test for plugin exists
			if (typeof Brahma.applets[arguments[0]] != 'object') {
				throw('Brahma: require `'+arguments[0]+'` applet. Visit '+Brahma.info.homesite+' to download it.');
			}

			// > We can give options to life elemnt
			var options = arguments.length>1 && typeof arguments[1] == 'object' ? arguments[1] : {}; 

			var wid = function() {
			};
					
			var plug = new wid();
			Brahma.api.extend(plug, Brahma.applets[arguments[0]]);
			plug = Brahma.module(plug).setConfig({
				name : arguments[0]
			});			
							
			plug.elements = this;
			plug.config = Brahma.api.extendRecursive(plug.config, options);
			
			
			plug.classname = arguments[0];
			
			// > ! Append life variable to element
			Brahma(this)[0].applet = plug;

			try {
				
			} catch(e) {
				
				throw('Brahma error: undefined plugin `'+arguments[0]+'`');
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

	window.Brahma.plugin = window.Brahma.ext.plugin = function() {
		
		if (this === window || typeof this == 'function') {
			
			var name = arguments[0];
			if (arguments.length>1 && typeof arguments[1] == 'object') var $data = arguments[1];
			else $data = {};
			
			
			
			if (name && typeof Brahma.plugin[name] != 'undefined') return Brahma.api.extend(Brahma.plugin[name], plugin);
			
			// -- init plugin
			var plugin = {
				elements: null,
				options: {}
			};
		
			plugin = Brahma.api.extend(plugin, $data);
			Brahma.api.extend(plugin, Brahma.module({
				
			})).setConfig({
				name : name
			});
			
			Brahma.plugin[name] = plugin;
			
			
			if (!name) return this;
			else return Brahma.plugin[name];
		} else {
				
				var options = arguments.length>1 && typeof arguments[1] == 'object' ? arguments[1] : {};
				
				var plug = function() {
					};
					
					plug = new plug();
					Brahma.api.extend(plug, Brahma.plugin[arguments[0]]);
					
					
					
					plug.elements = this;
					
					plug.config = Brahma.api.extend(plug.config, options);
				
				try {
					
				} catch(e) {
					
					throw('Brahma error: undefined plugin `'+arguments[0]+'`');
					return {};
				}
				return plug.execute();
		};
	};
	
	window.Brahma.plugin.prototype = {
		constructor: window.Brahma.plugin
	};
	
	/*
	brahma document
	*/
	window.Brahma.document = {
	
	};
	
	/*
	window.Brahma.document.uin
	*/
	
	window.Brahma.document.identifiers = {
		all: [],
		create: function(prefix) {
			
			
			var id = (prefix || '')+Brahma.api.rand(111111111,9999999999);
			var protect = 0;
			while (this.all.indexOf(id)>-1) {
				var id = (prefix || '')+Brahma.api.rand(111111111,9999999999);
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
	window.Brahma.document.createid = function(prefix) { return window.Brahma.document.identifiers.create(prefix || ''); };
	
	/*
	brahma document zindex
	*/
	window.Brahma.document.zindex = {
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
				
				window.Brahma.document.zindex.all[indexes[i]] = false;
			};
			window.Brahma.document.zindex.recalc();
		}
	};
	
	/*!
 * Sizzle CSS Selector Engine v1.10.20-pre
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-04-21
 */
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v1.10.16
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-01-13
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	compile,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + -(new Date()),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	strundefined = typeof undefined,
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf if we can't use a native one
	indexOf = arr.indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments quoted,
	//   then not containing pseudos/brackets,
	//   then attribute selectors/non-parenthetical expressions,
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( documentIsHTML && !seed ) {

		// Shortcuts
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document (jQuery #6963)
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, context.getElementsByTagName( selector ) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getElementsByClassName && context.getElementsByClassName ) {
				push.apply( results, context.getElementsByClassName( m ) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
			nid = old = expando;
			newContext = context;
			newSelector = nodeType === 9 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && testContext( context.parentNode ) || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = attrs.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== strundefined && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare,
		doc = node ? node.ownerDocument || node : preferredDoc,
		parent = doc.defaultView;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;

	// Support tests
	documentIsHTML = !isXML( doc );

	// Support: IE>8
	// If iframe document is assigned to "document" variable and if iframe has been reloaded,
	// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
	// IE6-8 do not support the defaultView property so parent will be undefined
	if ( parent && parent !== parent.top ) {
		// IE11 does not have attachEvent, so all must suffer
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", function() {
				setDocument();
			}, false );
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", function() {
				setDocument();
			});
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Check if getElementsByClassName can be trusted
	support.getElementsByClassName = rnative.test( doc.getElementsByClassName ) && assert(function( div ) {
		div.innerHTML = "<div class='a'></div><div class='a i'></div>";

		// Support: Safari<4
		// Catch class over-caching
		div.firstChild.className = "i";
		// Support: Opera<10
		// Catch gEBCN failure to find non-leading classes
		return div.getElementsByClassName("i").length === 2;
	});

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && documentIsHTML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== strundefined ) {
				return context.getElementsByTagName( tag );
			}
		} :
		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== strundefined && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select t=''><option selected=''></option></select>";

			// Support: IE8, Opera 10-12
			// Nothing should be selected when empty strings follow ^= or $= or *=
			if ( div.querySelectorAll("[t^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = doc.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return doc;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch(e) {}
	}

	return Sizzle( expr, document, null, [elem] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[5] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] && match[4] !== undefined ) {
				match[2] = match[4];

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
}

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (oldCache = outerCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							outerCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context !== document && context;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !group ) {
			group = tokenize( selector );
		}
		i = group.length;
		while ( i-- ) {
			cached = matcherFromTokens( group[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	}
	return cached;
};

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function select( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		match = tokenize( selector );

	if ( !seed ) {
		// Try to minimize operations if there is only one group
		if ( match.length === 1 ) {

			// Take a shortcut and set the context if the root selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					support.getById && context.nodeType === 9 && documentIsHTML &&
					Expr.relative[ tokens[1].type ] ) {

				context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
				if ( !context ) {
					return results;
				}
				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, seed );
							return results;
						}

						break;
					}
				}
			}
		}
	}

	// Compile and execute a filtering function
	// Provide `match` to avoid retokenization if we modified the selector above
	compile( selector, match )(
		seed,
		context,
		!documentIsHTML,
		results,
		rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
}

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome<14
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );
/* End of Sizzle */
/* !attention: HTML5 only */
Brahma.url = {
	set : function(url, title, args) {
		
		window.history.pushState((args || null), (title || null), (url || null));
	},
	edit : function(url, title, args) {
		
		window.history.replaceState((args || null), (title || null), (url || null));
	},
	title : function() {
		
	},
	popstate : function(callback) { // history back / forth
		var callback = callback;
		$(window).bind("popstate", function(e) {
			
			callback(location.pathname, location);
		});	
	},
	depatch : function(link, prefix, sufix) {
		var link = link;
		var prefix = prefix || '';
		var sufix = sufix || '';
		var pathname = link;
		if (pathname.substring(0, prefix.length)==prefix) pathname = pathname.substring(prefix.length, pathname.length);
		
		if (pathname.substring(pathname.length-sufix.length)==sufix) pathname = pathname.substring(0, pathname.length-sufix.length);
		if (/^[\/]*$/.test(pathname)) pathname = '/';

		return pathname;
	},
	patch : function(link, prefix, sufix) {
		var link = this.depatch(link, prefix, sufix);
		var prefix = prefix || '';
		var sufix = sufix || '';
		this.depatch(link,prefix,sufix);
		var r = prefix+link+sufix;
		if (/^[\/]*$/.test(r)) r = '/';
		return r;
	}
};
/* brahma as jQuery plugin */

Brahma('brahma.jquerybridge', function() {
	
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
Brahma('brahma.trigonometria', function() {
		
		this.trigonometria = {
			trinatur : function(num) {
				return num;
			},
			de_ra : function(de) {
				var pi = Math.PI;
				var de_ra = (de*(pi/180));
				return de_ra;
			},
			ra_de : function(radian) {
				var y = (radian * 180) / Math.PI;
				while (y>360) y=y-360;
				return y;
			},
			sin : function(ra) {
				if ( (ra == 0) || (ra == 180) || (ra == 360) ) return 0;
				else return Math.sin(this.de_ra(ra));
			},
			cos : function(ra) {
				if ( (ra == 270) || (ra == 90) ) return 0;
				else return Math.cos(this.de_ra(ra));
			},
			delta2sc: function(a, b, $C) {
				
				var c = Math.sqrt(
					Math.pow(a,2) + Math.pow(b, 2) - (2 * a * b * this.cos($C))
				);
				
				var $A = this.ra_de(Math.acos((b*b + c*c - a*a)/(2*b*c)));
				
				var $B = 180-$A-$C;
				
				var result = {
					a: a,
					b: b,
					c: c,
					'$A': $A,
					'$B': $B,
					'$C': $C
				};
				
				return result;
			},
			delta2c1s: function(a, $C, $A) {
				var $B = 180-($C+$A);
				var c = a * (this.sin($C) / this.sin($A));
				var b = a * (this.sin($B) / this.sin($A));
				return {
					a: a,
					b: b,
					c: c,
					'$A': $A,
					'$B': $B,
					'$C': $C
				};
			},
			rotation : function(l, a, back)
			{
				W = l * this.cos(a);
				if (back!=true) {
					if (W<0) return 0;
				};
				return W;
			},
			disrotation : function(a,ac) {
				dis = ac * this.sin(a);
				return dis;
			},
			not0 : function(num) {
				if (num<1) {
				   num = 1;
				};
				return num;
			}, 
			distX: function(radius, radian) {
				return this.disrotation(radian, radius);
			},
			distY: function(radius, radian) {
				return radius*this.sin(90 - radian);
			},
			/*
			@function perspective
			!
			–ì—í–ì¬†–ì¬±–ì¬∑–ì“ê–ì–Ü –ì¬∞–ì¬†–ì¬ß–ì¬¨–ì“ê–ì¬∞–ì¬† –ì¬ß–ì¬†–ì¬µ–ì—û–ì¬†–ì–Ü–ì¬ª–ì—û–ì¬†–ì“ê–ì¬¨–ì¬Æ–ì–à–ì¬Æ –ì–á–ì¬∞–ì¬Æ–ì¬±–ì–Ü–ì¬∞–ì¬†–ì¬≠–ì¬±–ì–Ü–ì—û–ì¬† –ì—û –ì¬ß–ì¬†–ì—û–ì–Å–ì¬±–ì–Å–ì¬¨–ì¬Æ–ì¬±–ì–Ü–ì–Å –ì¬Æ–ì–Ü –ì—ñ–ì¬§–ì¬†–ì¬´–ì“ê–ì¬≠–ì¬≠–ì¬Æ–ì¬±–ì–Ü–ì–Å, –ì“ë–ì¬Æ–ì–Ñ–ì—ñ–ì¬±–ì¬≠–ì¬Æ–ì–à–ì¬Æ –ì¬∞–ì¬†–ì¬±–ì¬±–ì–Ü–ì¬Æ–ì—ó–ì¬≠–ì–Å–ì—ó –ì–Å –ì¬∞–ì¬†–ì¬ß–ì¬¨–ì“ê–ì¬∞–ì¬Æ–ì—û –ì¬¨–ì¬†–ì–Ü–ì¬∞–ì–Å–ì¬∂–ì¬ª
			*/
			perspective: function(focusd, matrixw, distantion) {
				/* ! –ì—ñ–ì¬ß–ì¬≠–ì¬†–ì“ê–ì¬¨ –ì–á–ì¬Æ–ì¬´–ì¬Æ–ì—û–ì–Å–ì¬≠–ì—ñ –ì—ñ–ì–à–ì¬Æ–ì¬´–ì¬† –ì¬Æ–ì–é–ì¬ß–ì¬Æ–ì¬∞–ì¬† */
				var hangle = this.delta2sc(matrixw/2, focusd, 90)['$A'];
				/* ! –ì—ñ–ì¬ß–ì¬≠–ì¬†–ì“ê–ì¬¨ –ì—ë–ì–Å–ì¬∞–ì–Å–ì¬≠–ì—ñ –ì¬Æ–ì–é–ì¬Æ–ì¬ß–ì¬∞–ì“ê–ì—û–ì¬†–ì“ê–ì¬¨–ì¬Æ–ì–à–ì¬Æ –ì–á–ì¬∞–ì¬Æ–ì¬±–ì–Ü–ì¬∞–ì¬†–ì¬≠–ì¬±–ì–Ü–ì—û–ì¬† –ì¬≠–ì¬† –ì¬∞–ì¬†–ì¬±–ì¬±–ì–Ü–ì¬Æ–ì—ó–ì¬≠–ì–Å–ì–Å distantion */
				var areaw = this.delta2c1s(distantion, hangle, (90-hangle)).c;
				
				return areaw;
			}
		};
});
	Brahma('brahma.clipboard', function() {

	Brahma.clipboard = {
		set: function() {
			// In the future
		},
		get: function() {
			// In the future
		}
	};

	Brahma.applet('toclipboard', {
		execute : function() {
			
		}
	});

}, ['zeroclipboard']);
/*!
 * brahma Curve Plugin
 *
 * Version 1.0.
 *
 * Released under the MIT license:

Copyright (C) 2014 Vladimir Kalmykov
*/
	
	Brahma.applet('curve', {
		options: {
				'strokeStyle': 'rgba(0,0,0,0)',
				'lineWidth': 3,
				'fillStyle': '#000000',
				'debug-fillStyle': 'rgba(255, 144, 0, 0.5)',
				'drawframe': 0.01
		},
		current: {
			debug: false,
			test: 123
		},
		init : function() {
			// œÓ‚ÂˇÂÏ ˇ‚ÎˇÂÚÒˇ ÎË Ó·˙ÂÍÚ ÚËÔÓÏ Canvas
			
			if (Brahma(this.elements)[0].tagName.toUpperCase() != 'CANVAS') {
				
				this.canvas = Brahma(this.elements).put('<canvas />');
				
				this.canvas.css({
					'width': Brahma(this.elements).width(),
					'height': Brahma(this.elements).height()
				}).attr({
					'width': Brahma(this.elements).width(),
					'height': Brahma(this.elements).height()
				})
				
				this.canvas = this.canvas[0];
				
			} else {
				this.canvas = Brahma(this.elements)[0];
			};				
			
			// œÓ‚ÂˇÂÏ ÔÓÌËÏ‡ÂÚ ÎË ·‡ÛÁÂ canvas
			if (this.canvas.getContext) {
				this.ctx = this.canvas.getContext('2d'); // œÓÎÛ˜‡ÂÏ 2D ÍÓÌÚÂÍÒÚ
			} else {
				alert('error');
			};
			
			this.ctx.strokeStyle = this.options.strokeStyle; // ÷‚ÂÚ Ó·‚Ó‰ÍË
			this.ctx.lineWidth = this.options.lineWidth; // ÿËËÌ‡ ÎËÌËË
			this.ctx.fillStyle = this.options.fillStyle; // ÷‚ÂÚ Á‡ÎË‚ÍË
		},
		debug : function() {
			this.current.debug = true;
			return this;
		},
		setStyle : function(fillStyle, strokeStyle, lineweight) {
			var fillStyle = fillStyle || this.options.fillStyle;
			var strokeStyle = strokeStyle || this.options.strokeStyle;
			var lineweight = lineweight || this.options.lineWidth;
			this.ctx.fillStyle = fillStyle;
			this.ctx.strokeStyle = strokeStyle;
			this.ctx.lineWidth = lineweight;
			return this;
		},
		linear : function(P0x, P0y, P1x, P1y) {
			
			
			this.ctx.beginPath();
			this.ctx.moveTo(P0x, P0y); // Õ‡˜‡ÎÓ ÎËÌËË 
			
			var t = 0;		
			while ( t<=1 ) {
				
				var x = (1 - t) * P0x + (t * P1x);
				var y = (1 - t) * P0y + (t * P1y);
				
				this.ctx.lineTo(x, y);
				
				t+=this.options.drawframe;
			};
			this.ctx.stroke();
			this.ctx.closePath();
			
			if (this.current.debug) {
				// ! ËÒÛÂÏ ÚÓ˜ÍË
				this.drawCheckpoints.apply(this, arguments);
				
			};
			return this;
		},
		quadratic : function() {
			
			
			var t = 0;	
			var args = arguments;
			var P0x = arguments[0];
			var P0y = arguments[1];
			
			
			var P1x = arguments[arguments.length-2];
			var P1y = arguments[arguments.length-1];
			
			this.ctx.beginPath();
			this.ctx.moveTo(P0x, P0y); // Õ‡˜‡ÎÓ ÎËÌËË 
			
			while ( t<=1 ) {
				
				var x = (Math.pow((1 - t), 2) * P0x);
				
				for (var i = 2;i < arguments.length-3; i+=2) {
					x += (2 * (1 - t) * t * arguments[i])
				};
				
				x += Math.pow(t, 2) * P1y;
				
				var y = (Math.pow((1 - t), 2) * P0y);
				
				for (var i = 3;i < arguments.length-2; i+=2) {
					y += (2 * (1 - t) * t * arguments[i]);
				};
				
				y += Math.pow(t, 2) * P1x;
				
				this.ctx.lineTo(x, y);
				
				t+=this.options.drawframe;
			};
			
			this.ctx.stroke();
			this.ctx.closePath();
			
			if (this.current.debug) {
				// ! ËÒÛÂÏ ÚÓ˜ÍË
				this.drawCheckpoints.apply(this, arguments);
				// ! ËÒÛÂÏ Ì‡Ô‡‚Îˇ˛˘ËÂ
				this.setStyle(this.options['debug-fillStyle'], this.options['debug-fillStyle'], 2);
				this.linear(P0x, P0y, arguments[2], arguments[3]);
				this.linear(arguments[2], arguments[3], P1x, P1y);
				this.setStyle();
			};
			
			return this;
		},
		cubicBezier : function(P0x, P0y, P1x, P1y, P2x, P2y, P3x, P3y) {
			
			
			var t = 0;	
			
			this.ctx.beginPath();
			this.ctx.moveTo(P0x, P0y); // Õ‡˜‡ÎÓ ÎËÌËË 
			
			while ( t<=1 ) {
				
				var x = (Math.pow((1 - t), 3) * P0x) + (3 * Math.pow((1 - t), 2) * t * P1x) + (3* (1 - t) * Math.pow(t, 2) * P2x) + (Math.pow(t, 3) * P3x);
				var y = (Math.pow((1 - t), 3) * P0y) + (3 * Math.pow((1 - t), 2) * t * P1y) + (3* (1 - t) * Math.pow(t, 2) * P2y) + (Math.pow(t, 3) * P3y);
				
				this.ctx.lineTo(x, y);
				
				t+=this.options.drawframe;
			};
			
			this.ctx.lineTo(P3x, P3y);
			
			this.ctx.stroke();
			this.ctx.closePath();
			
			
			if (this.current.debug) {
				// ! ËÒÛÂÏ ÚÓ˜ÍË
				this.drawCheckpoints.apply(this, arguments);
				// ! ËÒÛÂÏ Ì‡Ô‡‚Îˇ˛˘ËÂ
				this.setStyle(this.options['debug-fillStyle'], this.options['debug-fillStyle'], 2);
				this.linear(P0x, P0y, P1x, P1y);
				this.linear(P3x, P3y, P2x, P2y);
				this.setStyle();
			};
			
			return this;
		},
		arc : function () {
			  var options = {
			  	x: 0,
			  	y: 0,
			  	radius: 100,
			  	sAngle: 0,
			  	eAngle: 2 * Math.PI,
			  	counterclockwise: false
			  };
			  if (typeof arguments[0] == 'object') {
			  	options = Miracle.api.extend(options, arguments[0]);
			  } else {
			  	var ui = 0;
			  	for (var i in options) {
			  		if (typeof arguments[ui] != "undefined") options[i] = arguments[ui];
			  		else break;
			  		ui++;
			  	};
			  };

			  this.ctx.beginPath();
		      this.ctx.arc(options.x, options.y, options.radius, options.sAngle, options.eAngle, options.counterclockwise);
		     
		      this.ctx.fill();
		      
		     
		      this.ctx.stroke();
		},
		bezier2D : function() {
			if (arguments.length<8) return this;
			for (var i = 0; i < arguments.length; i+=8) {
				if (arguments.length<(i+1)) return this;
				this.cubicBezier(arguments[i], arguments[i+1], arguments[i+2], arguments[i+3], arguments[i+4], arguments[i+5], arguments[i+6], arguments[i+7], arguments[i+8]);
			};
			
			return this;
		},
		drawCheckpoints : function() {
			this.ctx.fillStyle = '#000000';
			for (var i = 0; i<arguments.length; i+=2) {
				
				this.ctx.beginPath();  
				this.ctx.arc(arguments[i], arguments[i+1], 3, 0, Math.PI * 2, false); 
				this.ctx.fill();					
				this.ctx.closePath();
			};
		},
		clear : function() {
			
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			return this;
		},
		tie : function(callback) {
			
			callback.call(this);
			return this;
		},
		execute: function() {
			this.init();
			return this;
		}
		
	});

Brahma('brahma.mouse', function() {

	Brahma.applet('mouse', {
		execute: function() {
			var that = this;
			
			$(this.elements).each(function() {
				new (function(el, masterclass) {
					this.element = el;
					this.masterclass = masterclass;
					this.status = {
						entered: false,
						hold: false,
						offsetX: 0,
						offsetY: 0,
						x:0,
						y:0
					};
					this.binds = function() {
						
						var that = this;

						// –ù–∞—á–∏–Ω–∞–µ–º —Å–ª–µ–¥–∏—Ç—å –Ω–∞ –º—ã—à—å—é
						$(this.element).bind('mouseenter', function(e) {
							//if (e.target!=e.currentTarget) return;
							if (that.status.entered) return;
							e.stopPropagation();

							that.status.entered = true;
							that.masterclass.trigger('enter', [that.element, that.status, e]);
						});
						
						$(this.element).bind('mouseleave', function(e) {
							if (e.target!=e.currentTarget) return;
							e.stopPropagation();
							
							that.status.entered = false;
							that.masterclass.trigger('leave', [that.element, that.status, e]);
						});
						
						$(this.element).bind('mousemove', function(e) {
							that.capture(e, this);
							if (!that.status.entered) {
								that.masterclass.trigger('enter', [that.element, that.status, e]);
								that.status.entered = true;
							};
							if (that.status.hold) that.masterclass.trigger('drag', [that.element, that.status, e]);
							that.masterclass.trigger('move', [that.element, that.status, e]);		
						});

						$(this.element).bind('mousedown', function(e) {
							that.status.hold = true;
							
							that.masterclass.trigger('down', [that.element, that.status, e]);		
						});

						$(this.element).bind('mouseup', function(e) {
							that.status.hold = false;
							
							that.masterclass.trigger('up', [that.element, that.status, e]);		
						});
					};
					this.capture = function(e, el) {
						/* In case that offsetX target can be child element we ignore e.offset* and calc e.clien* - offset.left */
						/* Another reason is FF, that hates offsetX,offsetY by the nature */
						
						if ((e.offsetX==undefined || e.offsetY==undefined) || e.currentTarget!=e.target) {
							
							var offset = $(this.element).offset();
							var offsetX = e.pageX-offset.left;
							var offsetY = e.pageY-offset.top;
							
						} else {
							
							var offsetX = e.offsetX;
							var offsetY = e.offsetY;
						};
						
						this.status.x = offsetX;
  						 this.status.y = offsetY;
					};
					this.binds();
				})(this, that);
			});
			
		}
	})
}, 'jquerybridge');
/*
Options:
content - string | function
overlayBackgroundColor
*/

Brahma('brahma.overlay', function() {
	
	Brahma.applet('overlay',
	{
		context : null,
		options: {
			content: '',
			panel: {
				style: {

				}
			},
			overlay: {
				style: {
					
				}
			},
			effect: {
				'type': 'fade',
				'direction': 0
			},
			"class": false,
			freezeWrapper: true,
			autoshow: true // autoshow after creating
		},
		current: {
			backup: {}
		},
		wrappers : {
			content : null
		},
		execute : function() {	
			
			// Initial effects
			this.effects.applet = this;
			
			this.context = this.getContext();
			if (this.config.freezeWrapper) this.freezeWrapper();
			this.newOverlay(this.context);
			this.appendContent();
			if (this.config.autoshow) this.show();
			return this;
		},
		getContext : function() {
			try {
				var tagName = $(this.elements)[0].tagName.strToLower();
			} catch(e) {
				var tagName = false;
			};
			switch(tagName) {
				case 'body':
					return $($(this.elements)[0]);
				break;
				default:
					if ($(this.elements)[0]==document) {
						return $('body');
					} else {
						return $('body');
					};
				break;
			}
		},
		/*
		Freeze wrapper - make it unscrollable and untouchable.
		*/
		freezeWrapper: function(callback) {
			var that = this;
			var callback = callback;
			setTimeout(callback, 100);

			var body = $("body");
			/* remember scrollTop */
			this.current.backup = {
				scrollTop: $(this.context).scrollTop()
			};

			/* this variable contains elements that keeps in context node*/
			var not = [];
			// ...
			not = not.join(',');

			/* put all contents of context in freeze-node (wrappers.freezedContainer) */
			$(this.context).children().not(not).wrapAll($('<div />')).tie(function() {
				that.wrappers.freezedContainer = this.parent();
			});


			var contextTagName = $(this.context)[0].tagName.toUpperCase();

			/* Trick for scrollable container. If container has scrollBar then here comes the padding. After making container position absolute, padding disappearing and we see the bad jumping effect. To fix it we must save scrollBar to prevent hiding of padding. */
			if (contextTagName=='BODY') if ($(body).height() > $(window).height()) {
				$("body").css({
					'overflow-y': 'scroll'
				});
			};

			/* if context is not BODY make it position:relative. Becouse freezedContainer will be absolute. */
			if (contextTagName!='BODY') $(this.context).css('position', 'relative');

			/* set style to freezedContainer to make it real freezed */
			$(this.wrappers.freezedContainer).css({
				'position': $(this.context)[0].tagName.toUpperCase() == 'BODY' ? 'fixed' : 'absolute',
				'top': 0,
				'left': 0,
				'width': contextTagName=='BODY' ? '100%' : $(this.context).width(),
				'height': contextTagName=='BODY' ? '100%' : $(this.context).height(),
				'overflow': 'hidden'
			});
			
			/* wrap freezed to another DIV to make fixed scroll */
			$(this.wrappers.freezedContainer).children().not(not).wrapAll($('<div />'));
			$(this.wrappers.freezedContainer).find('>div').css({
				'width': '100%',
				'margin-top': (this.current.backup.scrollTop*-1)+'px'
			});

		},
		/* Unfreeze freezed wrapper content */
		unfreezeWrapper : function() {
			/* Get wrapper tag name */
			var contextTagName = $(this.context)[0].tagName.toUpperCase();

			var that = this;
			
			/* make overflow-y of BODY auto */
			if (contextTagName=='BODY') $(this.context).css({
				'overflow': 'auto'
			});

			/* move all content of context back to wrapper */
			$(this.wrappers.freezedContainer).find('>div').children().appendTo(jQuery(this.context));
			
			/* repair scroll top of context */
			if (contextTagName=='BODY') $(this.context).scrollTop(this.current.backup.scrollTop);

			/* remove Freezed Container */
			$(this.wrappers.freezedContainer).remove();
		},
		newOverlay : function(context) {
			var plugin = this;
			// > get Zindex
			var zindex = Brahma.document.zindex.get();
			
			// > build Nodes
			this.wrappers.overlay = $(context).put($('<div />', {
				'class': 'mb-plugin-overlay'
			}))
			.css(Brahma.api.extend({
				'width': '100%',
				'height': '100%',
				'position': 'fixed',
				'top': '0px',
				'left': '0px',
				'backgroundColor': 'none',
				'backgroundImage': 'none',
				'display': 'none',
				'z-index': zindex
			}, this.config.overlay.style));

			// > build first TABLE
			this.wrappers.table = $(this.wrappers.overlay).put($('<table />', {
				'cellspacing': 0, 
				'cellpadding': 0
			}))
			.css({
				'height': '100%',
				'margin': '0 auto'
			})
			.ramp($('<tbody />'), $('<tr />'))
			.put($('<td />'))
			.css({
				'height': '1%'
			})
			.and($('<td />'))
			.css({
				'height': '100%'
			})
			.tie(function() {

				plugin.wrappers.contentWrapper = $(this).put($('<div />')).css(plugin.config.panel.style).hide()
				.condition(plugin.config["class"], function(c) {
					$(this).addClass(c);
					return this; 
				}, function() { return this; });
				plugin.wrappers.content = $(plugin.wrappers.contentWrapper).put($('<div />'));
			})
			.and($('<td />'))
			.css({
				'height': '1%'
			});
		},
		show : function() {

			var applet = this;
			/*
			Show overlay
			*/
			$(this.wrappers.overlay).fadeIn();
			switch(this.config.effect.type) {
				case 'slide':

					this.effects.slideIn({
						'duration': this.config.effect.duration, 
						'direction': this.config.effect.direction
					}, function() {
						applet.trigger('show');
					});
				break;
				default:
					$(this.wrappers.contentWrapper).show();
					applet.trigger('show');
				break;
			}
			
		},
		appendContent : function() {

			var plugin = this;
			// > append static content
			switch(typeof this.config.content) {
				case 'string':

					this.wrappers.content.html(this.config.content);
					plugin.trigger('ready', [this.wrappers.content]);
				break;
				case 'function':
					this.config.content.call(this, this.wrappers.content);
				break;
			}
			
			// > append url request data
			if (typeof this.config.url == 'string') $(this.wrappers.content).load(this.config.url, function() {
				plugin.trigger('ready', [plugin.wrappers.content]);
			});
			return this;
		},
		html : function() {
			if (arguments.length<1) {
				return this.wrappers.content;
			} else {
				this.wrappers.content.html(arguments[0]);
			}
		},
		hide: function(callback) {
			this.trigger('beforeHide'); // < trigger
			var callback = callback;
			var applet = this;
			switch(this.config.effect.type) {
				case 'slide':
					

					this.effects.slideOut({
						'duration': this.config.effect.duration, 
						'direction': this.config.effect.direction
					}, function() {
						// hide content totaly
						$(applet.wrappers.contentWrapper).hide();	

						// > hide overlay
						$(applet.wrappers.overlay).fadeOut(function() {
							applet.trigger('hide');
							if (typeof callback == "function") callback.apply(applet);
						});	
					});
				break;
				default:
					$(applet.wrappers.overlay).fadeOut();
					
					applet.trigger('hide');
					if (typeof callback == "function") callback.apply(applet);
				break;
			}
		},
		close: function() {
			
			this.hide(function() {
				this.remove();
			});
			

		},
		remove : function() {
			this.trigger('beforeDestroy'); // < trigger
			$(this.wrappers.content).remove();
			if (this.config.freezeWrapper) this.unfreezeWrapper();
			$(this.wrappers.overlay).remove();
			this.destroy();
		},
		destroy : function() {
			$.each(this, function() {
				
				delete this;
			});
		}
	});

	Brahma.applet('overlay').effects = Brahma.module({
		applet: null, 
		_slide: function(options, callback) {
			/* calc distance from eleemnt to the edge */
			var screenHeight = $(this.applet.context).height();
			if (screenHeight==0) screenHeight = $(window).height();

			var screenWidth = $(this.applet.context).width();
			if (screenWidth==0) screenWidth = $(window).width();

			var position = {
				top: (screenHeight-$(this.applet.wrappers.contentWrapper).height())/2,
				left: (screenWidth-$(this.applet.wrappers.contentWrapper).width())/2
			};
			
			var cover = {
				top: position.top+$(this.applet.wrappers.contentWrapper).height(),
				right: (screenWidth-position.left),
				bottom: position.top+$(this.applet.wrappers.contentWrapper).height(),
				left: position.left+$(this.applet.wrappers.contentWrapper).width()
			};

			switch(options.direction) {
				case 'top': options.direction = 0; break;
				case 'right': options.direction = 90; break;
				case 'bottom': options.direction = 180; break;
				case 'left': options.direction = 270; break;
			};

			if (options.direction>=0 && options.direction<90) {
				var calc = Brahma.trigonometria.delta2c1s((cover.right>cover.top) ? cover.right : cover.top, options.direction, 90); 
			};

			if (options.direction>=90 && options.direction<180) {
				var calc = Brahma.trigonometria.delta2c1s((cover.right>cover.bottom) ? cover.right : cover.bottom, options.direction, 90); 
			};

			if (options.direction>=180 && options.direction<270) {
				var calc = Brahma.trigonometria.delta2c1s((cover.left>cover.bottom) ? cover.left : cover.bottom, options.direction, 90); 
			};

			if (options.direction>=270 && options.direction<=359) {
				var calc = Brahma.trigonometria.delta2c1s((cover.left>cover.top) ? cover.left : cover.top, options.direction, 90); 
			};
			
			/* > fix bug for firefox with e-num */
			calc.b = Math.round(calc.b);

			if (options.reverse) { // < reverse motion

				var startX = 0;
				var startY = 0;

				var endX = calc.c;
				var endY = -1*calc.b;	
			} else {

				var startX = calc.c;
				var startY = -1*calc.b;

				var endX = 0;
				var endY = 0;
			};
			

			/* shith to hide */
			var shift = (($(this.applet.context).width()-$(this.applet.wrappers.contentWrapper).outerWidth())/2)+$(this.applet.wrappers.contentWrapper).outerWidth();
			
			var options = Brahma.api.extend({
				direction: options.direction || 0,
				duration: options.duration || 450
			}, options || {});

			console.log(startX, startY);
			Brahma(this.applet.wrappers.contentWrapper).applet('transit')
			.jump({
				x: startX,
				y: startY
			})
			.withSelector(function() {
				$(this).show();
			})
			.animate({
				x: endX,
				y: endY
			}, options.duration, (typeof callback == 'function' ? callback : false));
		},
		slideIn: function(options, callback) {
			options.reverse = false;

			this._slide(options, callback);
		},
		slideOut: function(options, callback) {
			var callback = callback;
			var applet = this.applet;
			options.reverse = true;
			this._slide(options, function() {
				$(applet.wrappers.contentWrapper).hide();	
				callback();
			});
		}
	});

}, ['brahma.jquerybridge', 'brahma.trigonometria', 'brahma.transit']);

Brahma.applet("touch", {

});

Brahma.applet("touch", {

}).execute = function(settings) {
	var config = {
			min_move_x: 20,
			min_move_y: 20,
			wipeLeft: function() { },
			wipeRight: function() { },
			wipeUp: function() { },
			wipeDown: function() { },
			preventDefaultEvents: true
	};
	 
	if (settings) $.extend(config, settings);

	this.each(function() {
		 var startX;
		 var startY;
		 var isMoving = false;

		 function cancelTouch() {
			 this.removeEventListener('touchmove', onTouchMove);
			 startX = null;
			 isMoving = false;
		 }	
		 
		 function onTouchMove(e) {
			 if(config.preventDefaultEvents) {
				 e.preventDefault();
			 }
			 if(isMoving) {
				 var x = e.touches[0].pageX;
				 var y = e.touches[0].pageY;
				 var dx = startX - x;
				 var dy = startY - y;
				 if(Math.abs(dx) >= config.min_move_x) {
					cancelTouch();
					if(dx > 0) {
						config.wipeLeft();
					}
					else {
						config.wipeRight();
					}
				 }
				 else if(Math.abs(dy) >= config.min_move_y) {
						cancelTouch();
						if(dy > 0) {
							config.wipeDown();
						}
						else {
							config.wipeUp();
						}
					 }
			 }
		 }
		 
		 function onTouchStart(e)
		 {
			 if (e.touches.length == 1) {
				 startX = e.touches[0].pageX;
				 startY = e.touches[0].pageY;
				 isMoving = true;
				 this.addEventListener('touchmove', onTouchMove, false);
			 }
		 }    	 
		 if ('ontouchstart' in document.documentElement) {
			 this.addEventListener('touchstart', onTouchStart, false);
		 }
	 });

	 return this;
};

Brahma('brahma.transit', function() {
	/*!
	 * jQuery Transit - CSS3 transitions and transformations
	 * (c) 2011-2012 Rico Sta. Cruz <rico@ricostacruz.com>
	 * MIT Licensed.
	 *
	 * http://ricostacruz.com/jquery.transit
	 * http://github.com/rstacruz/jquery.transit
	 */

	(function($) {

	  $.transit = {
	    version: "0.9.9",

	    // Map of $.css() keys to values for 'transitionProperty'.
	    // See https://developer.mozilla.org/en/CSS/CSS_transitions#Properties_that_can_be_animated
	    propertyMap: {
	      marginLeft    : 'margin',
	      marginRight   : 'margin',
	      marginBottom  : 'margin',
	      marginTop     : 'margin',
	      paddingLeft   : 'padding',
	      paddingRight  : 'padding',
	      paddingBottom : 'padding',
	      paddingTop    : 'padding'
	    },

	    // Will simply transition "instantly" if false
	    enabled: true,

	    // Set this to false if you don't want to use the transition end property.
	    useTransitionEnd: false
	  };

	  var div = document.createElement('div');
	  var support = {};

	  // Helper function to get the proper vendor property name.
	  // (`transition` => `WebkitTransition`)
	  function getVendorPropertyName(prop) {
	    // Handle unprefixed versions (FF16+, for example)
	    if (prop in div.style) return prop;

	    var prefixes = ['Moz', 'Webkit', 'O', 'ms'];
	    var prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);

	    if (prop in div.style) { return prop; }

	    for (var i=0; i<prefixes.length; ++i) {
	      var vendorProp = prefixes[i] + prop_;
	      if (vendorProp in div.style) { return vendorProp; }
	    }
	  }

	  // Helper function to check if transform3D is supported.
	  // Should return true for Webkits and Firefox 10+.
	  function checkTransform3dSupport() {
	    div.style[support.transform] = '';
	    div.style[support.transform] = 'rotateY(90deg)';
	    return div.style[support.transform] !== '';
	  }

	  var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

	  // Check for the browser's transitions support.
	  support.transition      = getVendorPropertyName('transition');
	  support.transitionDelay = getVendorPropertyName('transitionDelay');
	  support.transform       = getVendorPropertyName('transform');
	  support.transformOrigin = getVendorPropertyName('transformOrigin');
	  support.transform3d     = checkTransform3dSupport();

	  var eventNames = {
	    'transition':       'transitionEnd',
	    'MozTransition':    'transitionend',
	    'OTransition':      'oTransitionEnd',
	    'WebkitTransition': 'webkitTransitionEnd',
	    'msTransition':     'MSTransitionEnd'
	  };

	  // Detect the 'transitionend' event needed.
	  var transitionEnd = support.transitionEnd = eventNames[support.transition] || null;

	  // Populate jQuery's `$.support` with the vendor prefixes we know.
	  // As per [jQuery's cssHooks documentation](http://api.jquery.com/jQuery.cssHooks/),
	  // we set $.support.transition to a string of the actual property name used.
	  for (var key in support) {
	    if (support.hasOwnProperty(key) && typeof $.support[key] === 'undefined') {
	      $.support[key] = support[key];
	    }
	  }

	  // Avoid memory leak in IE.
	  div = null;

	  // ## $.cssEase
	  // List of easing aliases that you can use with `$.fn.transition`.
	  $.cssEase = {
	    '_default':       'ease',
	    'in':             'ease-in',
	    'out':            'ease-out',
	    'in-out':         'ease-in-out',
	    'snap':           'cubic-bezier(0,1,.5,1)',
	    // Penner equations
	    'easeOutCubic':   'cubic-bezier(.215,.61,.355,1)',
	    'easeInOutCubic': 'cubic-bezier(.645,.045,.355,1)',
	    'easeInCirc':     'cubic-bezier(.6,.04,.98,.335)',
	    'easeOutCirc':    'cubic-bezier(.075,.82,.165,1)',
	    'easeInOutCirc':  'cubic-bezier(.785,.135,.15,.86)',
	    'easeInExpo':     'cubic-bezier(.95,.05,.795,.035)',
	    'easeOutExpo':    'cubic-bezier(.19,1,.22,1)',
	    'easeInOutExpo':  'cubic-bezier(1,0,0,1)',
	    'easeInQuad':     'cubic-bezier(.55,.085,.68,.53)',
	    'easeOutQuad':    'cubic-bezier(.25,.46,.45,.94)',
	    'easeInOutQuad':  'cubic-bezier(.455,.03,.515,.955)',
	    'easeInQuart':    'cubic-bezier(.895,.03,.685,.22)',
	    'easeOutQuart':   'cubic-bezier(.165,.84,.44,1)',
	    'easeInOutQuart': 'cubic-bezier(.77,0,.175,1)',
	    'easeInQuint':    'cubic-bezier(.755,.05,.855,.06)',
	    'easeOutQuint':   'cubic-bezier(.23,1,.32,1)',
	    'easeInOutQuint': 'cubic-bezier(.86,0,.07,1)',
	    'easeInSine':     'cubic-bezier(.47,0,.745,.715)',
	    'easeOutSine':    'cubic-bezier(.39,.575,.565,1)',
	    'easeInOutSine':  'cubic-bezier(.445,.05,.55,.95)',
	    'easeInBack':     'cubic-bezier(.6,-.28,.735,.045)',
	    'easeOutBack':    'cubic-bezier(.175, .885,.32,1.275)',
	    'easeInOutBack':  'cubic-bezier(.68,-.55,.265,1.55)'
	  };

	  // ## 'transform' CSS hook
	  // Allows you to use the `transform` property in CSS.
	  //
	  //     $("#hello").css({ transform: "rotate(90deg)" });
	  //
	  //     $("#hello").css('transform');
	  //     //=> { rotate: '90deg' }
	  //
	  $.cssHooks['transit:transform'] = {
	    // The getter returns a `Transform` object.
	    get: function(elem) {
	      return $(elem).data('transform') || new Transform();
	    },

	    // The setter accepts a `Transform` object or a string.
	    set: function(elem, v) {
	      var value = v;

	      if (!(value instanceof Transform)) {
	        value = new Transform(value);
	      }

	      // We've seen the 3D version of Scale() not work in Chrome when the
	      // element being scaled extends outside of the viewport.  Thus, we're
	      // forcing Chrome to not use the 3d transforms as well.  Not sure if
	      // translate is affectede, but not risking it.  Detection code from
	      // http://davidwalsh.name/detecting-google-chrome-javascript
	      if (support.transform === 'WebkitTransform' && !isChrome) {
	        elem.style[support.transform] = value.toString(true);
	      } else {
	        elem.style[support.transform] = value.toString();
	      }

	      $(elem).data('transform', value);
	    }
	  };

	  // Add a CSS hook for `.css({ transform: '...' })`.
	  // In jQuery 1.8+, this will intentionally override the default `transform`
	  // CSS hook so it'll play well with Transit. (see issue #62)
	  $.cssHooks.transform = {
	    set: $.cssHooks['transit:transform'].set
	  };

	  // jQuery 1.8+ supports prefix-free transitions, so these polyfills will not
	  // be necessary.
	  if ($.fn.jquery < "1.8") {
	    // ## 'transformOrigin' CSS hook
	    // Allows the use for `transformOrigin` to define where scaling and rotation
	    // is pivoted.
	    //
	    //     $("#hello").css({ transformOrigin: '0 0' });
	    //
	    $.cssHooks.transformOrigin = {
	      get: function(elem) {
	        return elem.style[support.transformOrigin];
	      },
	      set: function(elem, value) {
	        elem.style[support.transformOrigin] = value;
	      }
	    };

	    // ## 'transition' CSS hook
	    // Allows you to use the `transition` property in CSS.
	    //
	    //     $("#hello").css({ transition: 'all 0 ease 0' });
	    //
	    $.cssHooks.transition = {
	      get: function(elem) {
	        return elem.style[support.transition];
	      },
	      set: function(elem, value) {
	        elem.style[support.transition] = value;
	      }
	    };
	  }

	  // ## Other CSS hooks
	  // Allows you to rotate, scale and translate.
	  registerCssHook('scale');
	  registerCssHook('translate');
	  registerCssHook('rotate');
	  registerCssHook('rotateX');
	  registerCssHook('rotateY');
	  registerCssHook('rotate3d');
	  registerCssHook('perspective');
	  registerCssHook('skewX');
	  registerCssHook('skewY');
	  registerCssHook('x', true);
	  registerCssHook('y', true);

	  // ## Transform class
	  // This is the main class of a transformation property that powers
	  // `$.fn.css({ transform: '...' })`.
	  //
	  // This is, in essence, a dictionary object with key/values as `-transform`
	  // properties.
	  //
	  //     var t = new Transform("rotate(90) scale(4)");
	  //
	  //     t.rotate             //=> "90deg"
	  //     t.scale              //=> "4,4"
	  //
	  // Setters are accounted for.
	  //
	  //     t.set('rotate', 4)
	  //     t.rotate             //=> "4deg"
	  //
	  // Convert it to a CSS string using the `toString()` and `toString(true)` (for WebKit)
	  // functions.
	  //
	  //     t.toString()         //=> "rotate(90deg) scale(4,4)"
	  //     t.toString(true)     //=> "rotate(90deg) scale3d(4,4,0)" (WebKit version)
	  //
	  function Transform(str) {
	    if (typeof str === 'string') { this.parse(str); }
	    return this;
	  }

	  Transform.prototype = {
	    // ### setFromString()
	    // Sets a property from a string.
	    //
	    //     t.setFromString('scale', '2,4');
	    //     // Same as set('scale', '2', '4');
	    //
	    setFromString: function(prop, val) {
	      var args =
	        (typeof val === 'string')  ? val.split(',') :
	        (val.constructor === Array) ? val :
	        [ val ];

	      args.unshift(prop);

	      Transform.prototype.set.apply(this, args);
	    },

	    // ### set()
	    // Sets a property.
	    //
	    //     t.set('scale', 2, 4);
	    //
	    set: function(prop) {
	      var args = Array.prototype.slice.apply(arguments, [1]);
	      if (this.setter[prop]) {
	        this.setter[prop].apply(this, args);
	      } else {
	        this[prop] = args.join(',');
	      }
	    },

	    get: function(prop) {
	      if (this.getter[prop]) {
	        return this.getter[prop].apply(this);
	      } else {
	        return this[prop] || 0;
	      }
	    },

	    setter: {
	      // ### rotate
	      //
	      //     .css({ rotate: 30 })
	      //     .css({ rotate: "30" })
	      //     .css({ rotate: "30deg" })
	      //     .css({ rotate: "30deg" })
	      //
	      rotate: function(theta) {
	        this.rotate = unit(theta, 'deg');
	      },

	      rotateX: function(theta) {
	        this.rotateX = unit(theta, 'deg');
	      },

	      rotateY: function(theta) {
	        this.rotateY = unit(theta, 'deg');
	      },

	      // ### scale
	      //
	      //     .css({ scale: 9 })      //=> "scale(9,9)"
	      //     .css({ scale: '3,2' })  //=> "scale(3,2)"
	      //
	      scale: function(x, y) {
	        if (y === undefined) { y = x; }
	        this.scale = x + "," + y;
	      },

	      // ### skewX + skewY
	      skewX: function(x) {
	        this.skewX = unit(x, 'deg');
	      },

	      skewY: function(y) {
	        this.skewY = unit(y, 'deg');
	      },

	      // ### perspectvie
	      perspective: function(dist) {
	        this.perspective = unit(dist, 'px');
	      },

	      // ### x / y
	      // Translations. Notice how this keeps the other value.
	      //
	      //     .css({ x: 4 })       //=> "translate(4px, 0)"
	      //     .css({ y: 10 })      //=> "translate(4px, 10px)"
	      //
	      x: function(x) {
	        this.set('translate', x, null);
	      },

	      y: function(y) {
	        this.set('translate', null, y);
	      },

	      // ### translate
	      // Notice how this keeps the other value.
	      //
	      //     .css({ translate: '2, 5' })    //=> "translate(2px, 5px)"
	      //
	      translate: function(x, y) {
	        if (this._translateX === undefined) { this._translateX = 0; }
	        if (this._translateY === undefined) { this._translateY = 0; }

	        if (x !== null && x !== undefined) { this._translateX = unit(x, 'px'); }
	        if (y !== null && y !== undefined) { this._translateY = unit(y, 'px'); }

	        this.translate = this._translateX + "," + this._translateY;
	      }
	    },

	    getter: {
	      x: function() {
	        return this._translateX || 0;
	      },

	      y: function() {
	        return this._translateY || 0;
	      },

	      scale: function() {
	        var s = (this.scale || "1,1").split(',');
	        if (s[0]) { s[0] = parseFloat(s[0]); }
	        if (s[1]) { s[1] = parseFloat(s[1]); }

	        // "2.5,2.5" => 2.5
	        // "2.5,1" => [2.5,1]
	        return (s[0] === s[1]) ? s[0] : s;
	      },

	      rotate3d: function() {
	        var s = (this.rotate3d || "0,0,0,0deg").split(',');
	        for (var i=0; i<=3; ++i) {
	          if (s[i]) { s[i] = parseFloat(s[i]); }
	        }
	        if (s[3]) { s[3] = unit(s[3], 'deg'); }

	        return s;
	      }
	    },

	    // ### parse()
	    // Parses from a string. Called on constructor.
	    parse: function(str) {
	      var self = this;
	      str.replace(/([a-zA-Z0-9]+)\((.*?)\)/g, function(x, prop, val) {
	        self.setFromString(prop, val);
	      });
	    },

	    // ### toString()
	    // Converts to a `transition` CSS property string. If `use3d` is given,
	    // it converts to a `-webkit-transition` CSS property string instead.
	    toString: function(use3d) {
	      var re = [];

	      for (var i in this) {
	        if (this.hasOwnProperty(i)) {
	          // Don't use 3D transformations if the browser can't support it.
	          if ((!support.transform3d) && (
	            (i === 'rotateX') ||
	            (i === 'rotateY') ||
	            (i === 'perspective') ||
	            (i === 'transformOrigin'))) { continue; }

	          if (i[0] !== '_') {
	            if (use3d && (i === 'scale')) {
	              re.push(i + "3d(" + this[i] + ",1)");
	            } else if (use3d && (i === 'translate')) {
	              re.push(i + "3d(" + this[i] + ",0)");
	            } else {
	              re.push(i + "(" + this[i] + ")");
	            }
	          }
	        }
	      }

	      return re.join(" ");
	    }
	  };

	  function callOrQueue(self, queue, fn) {
	    if (queue === true) {
	      self.queue(fn);
	    } else if (queue) {
	      self.queue(queue, fn);
	    } else {
	      fn();
	    }
	  }

	  // ### getProperties(dict)
	  // Returns properties (for `transition-property`) for dictionary `props`. The
	  // value of `props` is what you would expect in `$.css(...)`.
	  function getProperties(props) {
	    var re = [];

	    $.each(props, function(key) {
	      key = $.camelCase(key); // Convert "text-align" => "textAlign"
	      key = $.transit.propertyMap[key] || $.cssProps[key] || key;
	      key = uncamel(key); // Convert back to dasherized

	      if ($.inArray(key, re) === -1) { re.push(key); }
	    });

	    return re;
	  }

	  // ### getTransition()
	  // Returns the transition string to be used for the `transition` CSS property.
	  //
	  // Example:
	  //
	  //     getTransition({ opacity: 1, rotate: 30 }, 500, 'ease');
	  //     //=> 'opacity 500ms ease, -webkit-transform 500ms ease'
	  //
	  function getTransition(properties, duration, easing, delay) {
	    // Get the CSS properties needed.
	    var props = getProperties(properties);

	    // Account for aliases (`in` => `ease-in`).
	    if ($.cssEase[easing]) { easing = $.cssEase[easing]; }

	    // Build the duration/easing/delay attributes for it.
	    var attribs = '' + toMS(duration) + ' ' + easing;
	    if (parseInt(delay, 10) > 0) { attribs += ' ' + toMS(delay); }

	    // For more properties, add them this way:
	    // "margin 200ms ease, padding 200ms ease, ..."
	    var transitions = [];
	    $.each(props, function(i, name) {
	      transitions.push(name + ' ' + attribs);
	    });

	    return transitions.join(', ');
	  }

	  // ## $.fn.transition
	  // Works like $.fn.animate(), but uses CSS transitions.
	  //
	  //     $("...").transition({ opacity: 0.1, scale: 0.3 });
	  //
	  //     // Specific duration
	  //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500);
	  //
	  //     // With duration and easing
	  //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500, 'in');
	  //
	  //     // With callback
	  //     $("...").transition({ opacity: 0.1, scale: 0.3 }, function() { ... });
	  //
	  //     // With everything
	  //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500, 'in', function() { ... });
	  //
	  //     // Alternate syntax
	  //     $("...").transition({
	  //       opacity: 0.1,
	  //       duration: 200,
	  //       delay: 40,
	  //       easing: 'in',
	  //       complete: function() { /* ... */ }
	  //      });
	  //
	  $.fn.transition = $.fn.transit = function(properties, duration, easing, callback) {
	    var self  = this;
	    var delay = 0;
	    var queue = true;

	    // Account for `.transition(properties, callback)`.
	    if (typeof duration === 'function') {
	      callback = duration;
	      duration = undefined;
	    }

	    // Account for `.transition(properties, duration, callback)`.
	    if (typeof easing === 'function') {
	      callback = easing;
	      easing = undefined;
	    }

	    // Alternate syntax.
	    if (typeof properties.easing !== 'undefined') {
	      easing = properties.easing;
	      delete properties.easing;
	    }

	    if (typeof properties.duration !== 'undefined') {
	      duration = properties.duration;
	      delete properties.duration;
	    }

	    if (typeof properties.complete !== 'undefined') {
	      callback = properties.complete;
	      delete properties.complete;
	    }

	    if (typeof properties.queue !== 'undefined') {
	      queue = properties.queue;
	      delete properties.queue;
	    }

	    if (typeof properties.delay !== 'undefined') {
	      delay = properties.delay;
	      delete properties.delay;
	    }

	    // Set defaults. (`400` duration, `ease` easing)
	    if (typeof duration === 'undefined') { duration = $.fx.speeds._default; }
	    if (typeof easing === 'undefined')   { easing = $.cssEase._default; }

	    duration = toMS(duration);

	    // Build the `transition` property.
	    var transitionValue = getTransition(properties, duration, easing, delay);

	    // Compute delay until callback.
	    // If this becomes 0, don't bother setting the transition property.
	    var work = $.transit.enabled && support.transition;
	    var i = work ? (parseInt(duration, 10) + parseInt(delay, 10)) : 0;

	    // If there's nothing to do...
	    if (i === 0) {
	      var fn = function(next) {
	        self.css(properties);
	        if (callback) { callback.apply(self); }
	        if (next) { next(); }
	      };

	      callOrQueue(self, queue, fn);
	      return self;
	    }

	    // Save the old transitions of each element so we can restore it later.
	    var oldTransitions = {};

	    var run = function(nextCall) {
	      var bound = false;

	      // Prepare the callback.
	      var cb = function() {
	        if (bound) { self.unbind(transitionEnd, cb); }

	        if (i > 0) {
	          self.each(function() {
	            this.style[support.transition] = (oldTransitions[this] || null);
	          });
	        }

	        if (typeof callback === 'function') { callback.apply(self); }
	        if (typeof nextCall === 'function') { nextCall(); }
	      };

	      if ((i > 0) && (transitionEnd) && ($.transit.useTransitionEnd)) {
	        // Use the 'transitionend' event if it's available.
	        bound = true;
	        self.bind(transitionEnd, cb);
	      } else {
	        // Fallback to timers if the 'transitionend' event isn't supported.
	        window.setTimeout(cb, i);
	      }

	      // Apply transitions.
	      self.each(function() {
	        if (i > 0) {
	          this.style[support.transition] = transitionValue;
	        }
	        $(this).css(properties);
	      });
	    };

	    // Defer running. This allows the browser to paint any pending CSS it hasn't
	    // painted yet before doing the transitions.
	    var deferredRun = function(next) {
	      var i = 0;

	      // Durations that are too slow will get transitions mixed up.
	      // (Tested on Mac/FF 7.0.1)
	      if ((support.transition === 'MozTransition') && (i < 25)) { i = 25; }

	      window.setTimeout(function() { run(next); }, i);
	    };

	    // Use jQuery's fx queue.
	    callOrQueue(self, queue, deferredRun);

	    // Chainability.
	    return this;
	  };

	  function registerCssHook(prop, isPixels) {
	    // For certain properties, the 'px' should not be implied.
	    if (!isPixels) { $.cssNumber[prop] = true; }

	    $.transit.propertyMap[prop] = support.transform;

	    $.cssHooks[prop] = {
	      get: function(elem) {
	        var t = $(elem).css('transit:transform');
	        return t.get(prop);
	      },

	      set: function(elem, value) {
	        var t = $(elem).css('transit:transform');
	        t.setFromString(prop, value);

	        $(elem).css({ 'transit:transform': t });
	      }
	    };

	  }

	  // ### uncamel(str)
	  // Converts a camelcase string to a dasherized string.
	  // (`marginLeft` => `margin-left`)
	  function uncamel(str) {
	    return str.replace(/([A-Z])/g, function(letter) { return '-' + letter.toLowerCase(); });
	  }

	  // ### unit(number, unit)
	  // Ensures that number `number` has a unit. If no unit is found, assume the
	  // default is `unit`.
	  //
	  //     unit(2, 'px')          //=> "2px"
	  //     unit("30deg", 'rad')   //=> "30deg"
	  //
	  function unit(i, units) {
	    if ((typeof i === "string") && (!i.match(/^[\-0-9\.]+$/))) {
	      return i;
	    } else {
	      return "" + i + units;
	    }
	  }

	  // ### toMS(duration)
	  // Converts given `duration` to a millisecond string.
	  //
	  //     toMS('fast')   //=> '400ms'
	  //     toMS(10)       //=> '10ms'
	  //
	  function toMS(duration) {
	    var i = duration;

	    // Allow for string durations like 'fast'.
	    if ($.fx.speeds[i]) { i = $.fx.speeds[i]; }

	    return unit(i, 'ms');
	  }
	   
	  // Export some functions for testable-ness.
	  $.transit.getTransitionValue = getTransition;
	})(jQuery);
	Brahma.applet('transit', {
		backup: {
			style: {
				left: 0,
				top: 0
			}
		},
		defaults: {
			duration: 450
		},
		operands: [],
		execute: function() {
			
				var that = this;
				$(this.elements).each(function() {
					var pos = that._getAbsolutePosition(this);

					var parentCss = $(this).parent().css(['min-width','min-height','position']);
					parentCss.width = $(this).parent().width();
					parentCss.height = $(this).parent().height();
					var css = $(this).css(['width','height','min-width','min-height','position']);
					css.outerWidth = $(this).outerWidth(),
					css.outerHeight = $(this).outerHeight();

					// calc x
					var x = $(this)[0].offsetLeft;
					
					if (x==0) {
						/* the value can be lie! Check for FF */
						/* ... */
						if (Brahma.browser.firefox) {
							/* Firefox hates position absolute inside table-cell parent node. So we calc position of parent */
							
							if ($(this).parent().css('display')=='table-cell') {
								x+=$(this).parent().position().left;
							}
						};
					};

					var y = $(this).position().top;
					
					if (y==0) {
						/* test for problem with TD container */
						if (parentCss.height>css.outerHeight) {
							/* something isn't right. test for padding */
							var pparentTop = $(this).parent().css("parentTop");

							if (typeof pparentTop != "undefined" && parseInt(pparentTop)!=0) {
								
								y+=parseInt(pparentTop);
							};

							/* test for parent element */

							switch($(this).parent().css("display")) {
								case 'table-cell':

									/* test for vertical align */
									switch($(this).parent().css("vertical-align")) {
										case 'middle':

											y+=(parentCss.height/2)-(css.outerHeight/2);
										break;
										case 'bottom':
											y+=parentCss.height-css.outerHeight;
										break;
									};
								break;
							};
						};
					};

					that.operands.push({
						lnk: this,
						defaults: {
							'left': pos.x,
							'top': pos.y,
							'x': x,
							'y': y,
							'position': css.position,
							'min-width': css['min-width'],
							'width': css['width'],
							'height': css['height'],
							'outerWidth': css['outerWidth'],
							'outerHeight': css['outerHeight'],
							'parentPosition': parentCss['position'],
							'parentMinWidth': parentCss['min-width'],
							'parentMinHeigth': parentCss['min-height'],
							'parentWidth': parentCss['width'],
							'parentHeight': parentCss['height']
						}
					});
				});
			
		},
		_css: function(options) {
			
			if (typeof jQuery.transit == "undefined") {
					
					if (typeof options.x != "undefined" || typeof options.y != undefined) {
							
							this._transitSimulatorMode(options);
					};
					
					var that = this;
					var options = options;
					$.each(this.operands, function() {

							options = that._adaptToClassic(options, this);
							
							$(this.lnk).css(options);
							
					});

			} else {
					console.log(options);
					$(this.elements).transit(options, 0);
			}
		},
		jump: function(options) {
			
			this._css(options);			
			return this;
		},
		_transitSimulatorMode: function(options, operand, emancipationOnly) {
			var options = options;
			var emancipationOnly = emancipationOnly || false; // < if reset true - break;
			var that = this;
			var x = 0;
			var y = 0;
			var reset = false;
			var operand = operand || false;
			var position = 'static';
			if (typeof options.x != "undefined") x = options.x;
			if (typeof options.y != "undefined") y = options.y;
			if (x == 0 && y == 0) {
				reset = true;
			};

			if (reset && emancipationOnly) return !reset;

			var fixOperand = function(reset) {
				/*
				if using transit emulation we have to fixate parent sizes so we create dummy node with element sizes
				*/
				if (!reset) {
					
					this.dummy = $('<div />');
					$(this.dummy).insertAfter($(this.lnk));
					$(this.dummy).css({
						//'visibility': 'hidden',
						'width': this.defaults.outerWidth,
						'height': this.defaults.outerHeight,
						'position': this.defaults.position
					});
				} else {
					if (this.dummy) {
						$(this.dummy).remove();
						this.dummy = false;
					};
				};

				// > repair parent position
				$(this.lnk).parent().css({
					'position': (reset  ? this.defaults.parentPosition : 'relative')
				});

				// > repair min-width
				if (!reset) {
					$(this.lnk).css('min-width', this.defaults.width);
				} else {
					$(this.lnk).css('min-width', this.defaults['min-width']);
				};
				
				// > repair element position
				$(this.lnk).css('position', (reset  ? this.defaults.position : 'absolute'));

				// > repair element left, Top
				$(this.lnk).css({
					left: this.defaults.left,
					top: this.defaults.top
				});
				
			};

			if (!operand) {
				$.each(this.operands, function() {
					fixOperand.call(this, reset);
				});
			} else {
				fixOperand.call(operand, reset);
			};

			return !reset;
		},
		_checkIsSimulated : function(element) {
			if ($(element.lnk).css('position')!='absolute') return false;
			return true;
		},
		_getAbsolutePosition : function(element) {
			
			var y = $(element).css('top');
			if (typeof y != 'number') {
				if (y.substr(-1)=='%') y = (parseInt($(this).parent().height())/100) * parseInt(y);
				else y = 0;
			};

			var x = $(element).css('left');
			if (typeof x != 'number') {
				if (x.substr(-1)=='%') x = (parseInt($(this).parent().height())/100) * parseInt(x);
				else x = 0;
			};

			return {
				x: x,
				y: y
			};
		},
		_adaptToClassic : function(options, element) {
			
			if (typeof options.x != 'undefined') {

				options.left = element.defaults.left+options.x+element.defaults.x;
			};
			if (typeof options.y != 'undefined') {

				options.top = element.defaults.top+options.y+element.defaults.y;
			};

			return options;
		},
		animate: function() {


			var that = this;
			var options = arguments[0];
			var duration = this.defaults.duration;
			var callback = function() {};
			var ease = 'swing';
			var callback_master = callback;

			if (typeof arguments[1] == "number" || typeof arguments[1] == "string") {
				duration = arguments[1];
			} else if (typeof arguments[1] == "function") {
				callback = arguments[1];
			};

			if (typeof arguments[2] == 'string') {
				ease = arguments[2];
			} else if (typeof arguments[2] == "function") {
				callback = arguments[2];
			};

			if (arguments.length>3) {
				if (typeof arguments[3] == "function") {
					callback = arguments[3];
				};
			};


			if (typeof jQuery.transit != "undefined") {
				setTimeout(function() {
					
					jQuery(that.elements).transit(options, duration, callback);
				}, 10);
				
			} else {
				
				setTimeout(callback, duration+1);
				var that = this;
				var options = options;
				
				$.each(this.operands, function() {
					
					var operand = this;
					
					if (!that._checkIsSimulated(operand) && that._transitSimulatorMode(options, operand, true)) {
						/* We must check is element in not simulation mode & if transit is not zero position, we need to just element by simulation mode */
						
						
							/* So, if it's not simulated we believe that x & y equal zero. So jump to cimulated zero. */
							
							$(this.lnk).css(that._adaptToClassic({x:0,y:0}, this));
						
					};


					options = that._adaptToClassic(options, this);
					

					$(this.lnk).animate(options, duration, ease, function() {
						if (typeof options.x != "undefined" || typeof options.y != "undefined") {
								that._transitSimulatorMode(options, operand);
						};
					});
			
				});
				
			};
		}
	});
});



	// > Eval on load queues
	if (onFillQueues.length>0) {

		for (var q = 0;q<onFillQueues.length;q++) {		

			window.Brahma.includeQueue(onFillQueues[q]);
		}
	}
	onFillQueues = false;

	define(function() {
		return window.Brahma;
	});
	
})(typeof define === 'function' && define.amd ? define : function(Brahma) {
   
    //var _Brahma = window.Brahma,
    //    Brahma = factory();
   // window.Brahma = Brahma();
    //Brahma.noConflict = function() {
      //  window.Brahma = _Brahma;
//return Brahma;
    //}
});