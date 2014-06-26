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
	
	/*[[ext]]*/
	/*[[plugins]]*/



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