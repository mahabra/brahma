/* Starting brahma */
(function(define) {
	
	var binds = [];
	var onFillQueues = [];

	if (typeof window.Brahma == "function") {
		delete(window.Brahma);
	}
	window.Get = window.Brahma = function() {
		
		if (this === window) {
			
			var air = new window.Brahma();
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
						extensionName = selector;
						selector = tmpselector;
						// > looking for argument[2] (depends)
						if (arguments.length>2) {
							options = arguments[2];
						} else {
							options = {};
						}
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
						/* Now we must put extensionName to defined list. But if there is relates, we have to wait for loading all depends. 
						So, we create appendToDefinedOnReady function to use it later.
						And append it to `detained` list to prevent autorequire. */
						
						air.amd.addDetained(extensionName, options, callback);					
						
						var applyOnReady = function() {
							/*
							Прежде выполнение кода callback происходило здесь, но теперь перенесено в detainedReady. Там код выполняется по принципу define.
							*/

							this.amd.detainedReady(extensionName, callback, arguments);
						};
					} else {
						var applyOnReady = function() { 
							
							callback.apply(this, arguments); /* do nothing */ 
						};
					}
					
					if (Brahma.isArray(options) && options.length>0) {
						
						require_amd = options;
					} else {
						/* eval factory now */

						air.amd.ready(function() {
							applyOnReady.apply(this);
							//callback.apply(this);
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
			if (require_amd.length>0) {
				if (typeof callback == 'function') {
					if (onFillQueues) {

						onFillQueues.push({callback: applyOnReady, require_amd: require_amd});
					}
					else {
						
						air.includeQueue({callback: applyOnReady, require_amd: require_amd});
					}
				};
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
		homesite: '{*homepage*}',
		version: '{*appversion*}'
	};

	/*
		Throw exception and die
	*/
	window.Brahma.die = window.Brahma.ext.die = function(message) {
			throw('Brahma: '+message);
	};

	/*
	Brahma online
	*/
	window.Brahma.online = function(app, callback) {
		if (!Brahma.online.builder) this.die('Online mode disabled.');
		app!=null && (function(app, callback) {
			require(
				[Brahma.online.builder+'?appget='+(app instanceof Array ? app.join(',') : app )+'&dummy=a'], 
				(callback || function() {})
			);
		}).call(this, app, callback);
	};

	window.Brahma.online.builder = false;
	window.Brahma.online.enabled = false;

	/*
	AMD service
	*/
	window.Brahma.amd = window.Brahma.ext.amd = new (function(Brahma) {
		this.M = Brahma;
		this.loadings = 0;
		this.queue = [];
		this.defined = [];
		this.detained = {};
		this.fabrics = {};
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
		/* Компоненты ожидающие полной инициализации */
		this.addDetained = function(n, depends, fabric) {
			
			/* Добавляем модуль в список ожидающих инициализации */
			if ("object" != typeof this.detained[n]) 
			this.detained[n] = {name: n, depends: depends, fabric: fabric};
			/* И одновременно ожидающих инициализации в AMD */
			if (window.require._detained.indexOf(n)<0) {

				window.require._detained.push(n);
				
			};
		};
		this.detainedReady = function(extensionName, callback, depObjects) {
			
			/* depObjects - список обеъектов, от которых зависит данный компонент. Они должны быть переданы как аргументы функци */
			
			/* Определяем модуль как загруженный */
			if (this.defined.indexOf(extensionName) < 0) 
			this.defined.push(extensionName);

			/* добавляем в список определенных модулей */

			define.force(extensionName, callback.apply(Brahma, depObjects));

			/* Объясвляем релиз модуля в AMD */
			window.require.releaseDetained(extensionName);

			/* Удаляем из локального списка */
			
			delete this.detained[extensionName];
			

			this.loaded([extensionName]);
		};
		this.ready = this.onReady = function() {

			if (arguments.length==1) {
				var callback = arguments[0];
				var depends = false;
			} else {
				var callback = arguments[1];
				var depends = arguments[0];
			};


			if (this.isReady(depends)) {callback.apply(this.M, this.queueArgs(depends)); }
			else {


				this.queue.push({
					callback: callback,
					depends: depends
				});
				//this.queue.reverse();
			};
		};
		/*
		Test for existings require module in paths list or _modules list.
		And test for clean name of module ^[a-z0-9\.\-#\<\>]*$
		*/
		this.onlineTest = function(amd, callback) {
			
			var amd = amd;
			var callback = callback;
			var amdmodule = this;
			var appget = [];
			for (var a = 0;a<amd.length;a++) {
				if ( ("string" != typeof require._config.paths[amd[a]]) &&
				("object" != typeof define._modules[amd[a]]) &&
				/^[a-z0-9\.\-#\<\>]*$/.test(amd[a])
				) appget.push(amd[a]);
			}
			if (appget.length>0) {
				
				require([Brahma.online.builder+'?appget='+appget.join(',')+'&dummy='], function() {

					amdmodule.require(amd, callback, true);
				});
			} else {
				// Return to native
				this.require(amd, callback, true);
			};
		};
		this.require = function(amd, callback, force) {
			
			if (Brahma.online.enabled 
			&& require && require.brahmaInside && !(force||false)) { // Invoke online mode
				this.onlineTest(amd, callback); // < Start online test
			} else {
				var that = this;
				var amd = amd;
				if (typeof require == 'function') {
					var real = amd;
					if (real.length>0) {
						this.loadings++;


							require(real, function() {
								// Brahma AMD

								that.loaded(real, arguments);
							});
						
					};

					
					if (typeof callback == 'function') this.ready(amd, callback);
				} else {
					if (typeof callback == 'function') {
						
						callback.apply(this.M, that.queueArgs(amd));
					};
				};
			};
		};
		this.loaded = function(amd, fabrics) {
			
			fabrics!=null && (function(and, fabrics, g) {
				for (var a = 0;a<amd.length;a++) 
				g[amd[a]] = fabrics[a];
			})(amd, fabrics, this.fabrics);
			
			var that = this;
			this.loadings--;
			var amd = amd || [];

			/* set amd mark */
			for (var i = 0; i<amd.length;i++) {
				// check the name exists in detained
				
				 if ("object" != typeof this.detained[amd[i]]) {
				 	
				 	this.defined.push(amd[i]);
				 };
			};

			
			if ("undefined" != typeof this.queue && this.loadings<1) {
				
				this.loadings=0;
				if (this.queue.length>0) {
					var queue = [];
					for (var a = 0;a<this.queue.length;a++) {
						queue.push(this.queue[a]);
					};

					this.queue = [];
					
					queue = queue.reverse();

					/*
					Include only completed objects
					Form me on http://jsfiddle.net/Morulus/973XW/
					*/
					
					var uncompleted = (function(cloud, onStaffed, testReady) {
						
					    var i = 0, // Counter
					    onboard = cloud.length;  // count of objects on board
					    done = 0, // count of objects sended to ready
					    left = 0; // left on board
					    residue = [];
					   
					    var residue = [];
					    do {
					    	
					        (function(cloud) {
					            	
						            if (!testReady(cloud[i].depends)) {
						                    left++; // one more left
						                    
						                    cloud.push(cloud[i]); // put it to end of array
						                    residue.push(cloud[i]);
						                    return;
						            } else {
						            	
						            };
						      	
						      	
					            onStaffed(cloud[i], cloud[i].depends);

					            //ready.push(cloud[i].name); // put it to ready
					            done++; // remember that one more 
					        })(cloud);
					         
					        i++; // counter++
					        onboard--; // left from board
					        if (onboard==0) { // if there is no more left on the board
					            if (done==0) { break; }; // if no object goes to ready then we have to stop the process
					           	residue = [];
					            onboard = left; done = 0; left = 0; // or reset variables
					        };
					    } while(i < cloud.length);
					   	
					   	var result = [];
					    for (var z in cloud) {
					    	if (z>=i) result.push(cloud);
						};

					    return residue;
					})(queue, function(queue, depends) {
						
						var depends = that.queueArgs(depends);
						
						queue.callback.apply(that.M, depends); // in the context of Brahma.amd execute callback
					}, function(depends) {

						return that.isReady(depends);
					});
					
					
					for (var u = 0;u<uncompleted.length;u++) {
						
						this.queue.push(uncompleted[u]);
					};
					
				}
			}
		},
		this.queueArgs = function(d) {
			return (d&&d.length>0) ? (function(depends, t) {
				var fab = [];
				for(var i=0;i<depends.length;i++) {

					if ("undefined" != typeof t.fabrics[depends[i]]) fab.push(t.fabrics[depends[i]]);
				};

				return fab;
			})(d, this) : [];
		}

	})(window.Brahma);

	/* > Include queue that initialed by calling Brahma('extension_name', function() {

	}, ['depends', 'components']) */
	window.Brahma.includeQueue = window.Brahma.ext.includeQueue = function(queue) {
		// > Check for require compoentns


		if (Brahma.isArray(queue.require_amd)) {
			// Look for depends existings
			var require_amd = queue.require_amd;
			
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
		
		if ("undefined" == typeof this.selector) {
			args.length>0 && (elem = args.splice(0,1)[0]);
			"object" == typeof elem ? (elem = Brahma(elem)) : (elem = nodeQuery(elem));
		} else {
			elem = this.selector;
		};
		var arguments = [elem];
		for(var i=0;i<args.length;i++) {
			arguments.push(args[i]);
		};
		
		return tieback.apply(this, arguments);
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
		var elem;
		
		return Brahma.bench.call(this, arguments, function(elem, options) {

			var options = options;
			if (arguments.length==2) {
				switch(typeof arguments[1]) {
					case 'object':
						Brahma(elem).each(function() {
							for (var i in options) {
								this.style[i] = options[i];
							};	
						});
					break;
					default:
						return Brahma(elem)[0].style[options];
					break;
				};
				return Brahma(elem);
			} else if (arguments.length>2) {

				Brahma(elem)[0].style[arguments[1]] = arguments[2];
			};
			return Brahma(elem);
		});
	};
	
	window.Brahma.attr = window.Brahma.ext.attr = function() {
		var elem;
		return Brahma.bench.call(this, arguments, function(elem, options) {
			var options = options;
			if (arguments.length==2) {
				switch(typeof arguments[1]) {
					case 'object':
						Brahma(elem).each(function() {
							for (var i in options) {
								this.setAttribute(i, options[i]);
							};	
						});
					break;
					default:
						return Brahma(elem)[0].getAttribute(options);
					break;
				};
				return Brahma(elem);
			} else if (arguments.length>2) {
				Brahma(elem)[0].setAttribute(arguments[1], arguments[2]);
			};
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

	window.Brahma.ext.find = function() {
		return Brahma.bench.call(this, arguments, function(elem, options) {
			
			var nodelist = Sizzle(options, Brahma(elem)[0]);
			
			return nodelist;
		});		
	};

	window.Brahma.ext.val = function() {
		
		return Brahma.bench.call(this, arguments, function(elem, options) {
			if ("undefined" != typeof options && options.length>0) {
				elem.value = options[0];
			} else {
				return elem.value;
				
			};
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
	
	/* Brahma.utility */	
	window.Brahma.utility = {};
	
	window.Brahma.utility.max = function(values) {
		var values = ("object" == typeof values) ? values : arguments;
		var max = 0;
		for (var i in values) {
			if (values[i]>max) max = values[i];
		}
		return max;
	};
	
	
	window.Brahma.utility.isLocalStorageAvailable = function() {
	  try {
	    return 'localStorage' in window && window['localStorage'] !== null;
	  } catch (e) {
	    return false;
	  }
	}

	/* Convert number to pixels or percents */
	window.Brahma.utility.getWebUnits = function(value, quantity) {
		if ("number"==typeof value) return value+'px';
		if (value.substr(-2)=='px') return value;
		if (value.subste(-1)=="%") return (quantity || false) ? Brahma.utility.percentEq(value, quantity) : value;
		return parseInt(value)+'px';
	}

	/* Convert percent value to integer using quantity */
	window.Brahma.utility.percentEq = function(value, quantity) {
		if ("string" == typeof value && value.substr(-1)=='%') {
			var $p = value.substring(0, value.length-1);

			value = ((quantity/100)*$p);
		};
		return value;
	};

	window.Brahma.utility.parseCss = function(optionsup) {
		if (typeof optionsup != "string") return {};
		var optionsup = optionsup.split("\n").join('').split("\t").join('');
		if (optionsup.length<1) return {};
		var optionsup = optionsup.split(';')
		var options = {};
		for (var o in optionsup) {
			var op = optionsup[o].split(':');
			options[op[0]] = op[1];
		};

		return options;
	};

	window.Brahma.utility.rand = function(min, max) {
		var rand = min - 0.5 + Math.random()*(max-min+1)
		return  Math.round(rand);
	};
	
	/* return value if it present in array `variants` or `fault` */
	window.Brahma.utility.only = function(variants, fault, value, ignoreCase) {
		var ignoreCase = ignoreCase || false;
		if (ignoreCase) value = value.toLowerCase();
		for (var i=0;i<variants.length;i++) {
			if (ignoreCase) variants[i]=variants[i].toLowerCase();
			if (variants[i]==value) return value;
		};
		return fault;
	};
	
	/* foreach child elements that has attrName */

	window.Brahma.utility.eachByAttr = function(el, attrName, eachcallback) {
		if (typeof attrName instanceof Array) attrName = [attrName];
		
		var selector = [];
		for (var i=0;i<attrName.length;i++) {
			
			selector.push('['+attrName[i].split('[').join('\\[').split(']').join('\\]')+']');
		}
		selector = selector.join(',');
		
		if (el instanceof Array) {
			var nodelist = [];
			for (var na = 0; na<el.length; na++) {
				var rquery =  Sizzle(selector, el[na]);
				if (rquery) for (var irq = 0;irq<rquery.length;irq++) {
					nodelist.push(rquery[irq]);
				};
			};
		} else {

			var nodelist = Sizzle(selector, el);

		};
		
		if (typeof nodelist == 'object') {
			for (var i = 0; i<nodelist.length; i++) {
				eachcallback.call(nodelist[i]);
			};
		};
	};
	
	window.Brahma.utility.hasAttribute = function(el, attrName) {
		var attrName = attrName.split('[').join('\\[').split(']').join('\\]');
			
		if (el.getAttribute(attrName)!=null) return true;
		else return false;
	};
	
	/* brahma modules constrcutor */
	window.Brahma.module = function(module) {
		return Brahma.utility.extend(module, new (function() {
			this.config = {};
			this.setConfig = function() {
				
				if (typeof arguments[0] == 'string' && arguments.length>1) {
					
					this.config[arguments[0]] = arguments[1];
					
				} else if (typeof arguments[0] == 'object') {
					
					for (var i in arguments[0]) {
						
						this.setConfig(i, arguments[0][i]);
					};
				};
				return this;
			};
			// function deprecated
			this.tie = function(callback) {
				callback.call(this);
				return this;
			};
			this.with = function(callback) {
				callback.call(this);
				return this;
			};
			this.eventListners = {};
			this.bind = function(e, callback, once) {
				var once = once;
				if (typeof this.eventListners[e] != 'object') this.eventListners[e] = [];
				this.eventListners[e].push({
					callback: callback,
					once: once
				});
				return this;
			};
			this.trigger = function() {
				
				
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
							if (typeof this.eventListners[e][i].callback == "function") this.eventListners[e][i].callback.apply(this, args);
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
			};
			// > set config value and call trgiiger `reconfig`
			this.set = function(key, value) {

				switch(typeof key) {
					case 'string':
						
						this.config[key] = value;
						this.trigger('reconfig', [key]);
						if (typeof this.refresh  == "function") this.refresh([key]);
					break;
					case 'object':
						var c = this.config;
						var keys = [];
						for (var q in key) {
							keys.push(q);
							
							this.config[q] = key[q];
						};

						this.trigger('reconfig', [keys]);
						if (typeof this.refresh  == "function") this.refresh([keys]);
					break;
				}
				return this;
			};
			// get config value
			this.get = function(key) {
				return this.config[key];
			};
		})());
	};
	
	
	/* Clone obj.
	Task: create copy of object without references to sub objects
	Solution founded on: 
	http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object.
	Fork, please.
	*/
	window.Brahma.utility.clone = function(obj) {
	    // Handle the 3 simple types, and null or undefined
	    if (null == obj || "object" != typeof obj) return obj;

	    // Handle Date
	    if (obj instanceof Date) {
	        var copy = new Date();
	        copy.setTime(obj.getTime());
	        return copy;
	    }

	    // Handle Array
	    if (obj instanceof Array) {
	        var copy = [];
	        for (var i = 0, len = obj.length; i < len; i++) {
	            copy[i] = clone(obj[i]);
	        }
	        return copy;
	    }

	    // Handle Object
	    if (obj instanceof Object) {
	        var copy = {};
	        for (var attr in obj) {
	            if (obj.hasOwnProperty(attr)) copy[attr] = Brahma.utility.clone(obj[attr]);
	        }
	        return copy;
	    }

	    throw new Error("Unable to copy obj! Its type isn't supported.");
	};

	// extend
	window.Brahma.utility.extend = function() {
			
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
								
								Brahma.utility.extend(target[i],proto[i]);
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
	window.Brahma.utility.extendRecursive = function() {
			
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
								
								window.Brahma.utility.extendRecursive(target[i],proto[i]);
							} else if ( proto[i] != null && proto[i].constructor  &&
									!({}).hasOwnProperty.call( proto[i].constructor.prototype, "isPrototypeOf" )) {
                                
								target[i] = proto[i];
							} else {
                                if (typeof target[i] == "undefined") target[i] = {};
								 
							target[i] = window.Brahma.utility.extendRecursive(target[i],proto[i]);
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
	Brahma.component('mywidget', {
		exec : function() {
			return this.hello();
		}
	}); // < Creating new life element
	
	// > append new function to exists widget by method life
	Brahma.component('mywidget').hello = function() {
		
	};

	// > Make a copy of widget by method life
	Brahma.component('newWidget', 'mywidget', {
		exec : function() {
			return this.hi();
		}
	})

	// > Make life to node element by method life
	Brahma('#mywrap').component('mywidget');

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
				$data = arguments[0];
				name = false;
			};			
			

			// > return widget protptype if exists
			if (name && typeof Brahma.widgets[name] != 'undefined') {

				return Brahma.utility.extend(Brahma.widgets[name], $data);
			};

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
				/* after initialing widget must call this function to make widget visible */
				ready: function() {
					Brahma(this.selector).css("visibility", "visible");
				},
				tuning: {

				},
				manual: function(options) {
					var options = options;
					Brahma(options.panel).component('visualjson', {
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
				privatize : function() {
					if ("object" != typeof $(this.selector)[0].controllers)
					Brahma(this.selector)[0].controllers = {};
					Brahma(this.selector)[0].controllers[this.name] = this;
				},
				_stop : function() {
					// Clear intervals
					for (var i in this.privates.intervals) {
						if (this.privates.intervals[i]>0) clearInterval(this.privates.intervals[i]);
					};
					if ("function" == typeof this.stop) this.stop();

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
							var conditionUin = Brahma.utility.rand(1,99999);
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

			widget = Brahma.utility.extend(widget, $data);

			Brahma.utility.extend(widget, Brahma.module({
				
			}));

			widget.name = name;

			if (typeof $data.config == 'object') widget.config = Brahma.utility.extend(widget.config, $data.config);
			
			if (!name) {
				return widget;
			} else {
				Brahma.widgets[name] = widget;
				// Register global
				var name = name;
				(function(name) {
					var name = name;
					Brahma.ext[name] = function(options) {
						return Brahma.executeWidget.call(this, name, Brahma.widgets[name], options||{});
					};
				})(name);
				
				return Brahma.widgets[name];
			};
		} else {
			// > Test for plugin exists
			if (typeof Brahma.widgets[arguments[0]] != 'object') {
				throw('Brahma: require `'+arguments[0]+'` plugin. Visit '+Brahma.info.homesite+' to download it.');
			}

			// > We can give options to life elemnt
			var options = arguments.length>1 && typeof arguments[1] == 'object' ? arguments[1] : {};

			return Brahma.executeWidget.call(this, arguments[0], Brahma.widgets[arguments[0]], options);
		}
	}

	window.Brahma.executeWidget = function(name, widget, options) {
		
		var wid = function() {
		};
				
		var plug = new wid();

		Brahma.utility.extend(plug, widget);				
						
		plug.elements = plug.selector = this;

		plug.config = Brahma.utility.extend(plug.config, options || {});
		plug.classname = name;

		try {
			
		} catch(e) {
			
			throw('Brahma error: undefined plugin `'+name+'`');
			return {};
		}
		
		// Set proto
		plug.proto = widget;

		// Regist wisget at selector
		plug.privatize();

		var result = plug.execute();
		
		return plug;
	}

	window.Brahma.components = {};
	window.Brahma.component = window.Brahma.ext.component = function() {
		if (this === window || typeof this == 'function') {
			// > name of component
			var name = arguments[0];

			// > data
			if (arguments.length>1) {
				switch(typeof arguments[1]) {
					case 'object':
						var $data = arguments[1];
					break;
					case 'string': // copy
						var copy = arguments[1];
						if (typeof Brahma.components[copy] != 'undefined') {
							$data = this.api.extend({}, Brahma.components[copy]);
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

			// > return component protptype if exists
			if (name && typeof Brahma.components[name] != 'undefined') return Brahma.utility.extend(Brahma.components[name], $data);

			// > create new component
			var component = {
				elements: null,
				options: {},
				config: {},
				withSelector: function(callback) {

					if (typeof callback == 'function') callback.apply(this.elements);
					return this;
				}
			};

			// merge with $data and make it Brahma module
			component = Brahma.utility.extend(component, $data);

			if (typeof $data.config == 'object') component.config = Brahma.utility.extend(component.config, $data.config);

			Brahma.components[name] = component;

			
			if (!name) return this;
			else return Brahma.components[name];
		} else {
			// > Test for plugin exists
			if (typeof Brahma.components[arguments[0]] != 'object') {
				throw('Brahma: require `'+arguments[0]+'` component. Visit '+Brahma.info.homesite+' to download it.');
			}

			// > We can give options to life elemnt
			var options = arguments.length>1 && typeof arguments[1] == 'object' ? arguments[1] : {}; 

			var wid = function() {
			};
					
			var plug = new wid();
			plug = Brahma.module(plug);
			Brahma.utility.extend(plug, Brahma.utility.clone(Brahma.components[arguments[0]]));
			plug.config = Brahma.utility.extendRecursive(plug.config, options);

			plug.elements = this;
			
			plug.classname = arguments[0];
			
			// > ! Append life variable to element
			Brahma(this)[0].component = plug;

			try {
				
			} catch(e) {
				
				throw('Brahma error: undefined plugin `'+arguments[0]+'`');
				return {};
			}
			
			
			// > inside tie function
			if (typeof arguments[2] == "function") {
				arguments[2].apply(plug);
			};

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
			
			
			
			if (name && typeof Brahma.plugin[name] != 'undefined') return Brahma.utility.extend(Brahma.plugin[name], plugin);
			
			// -- init plugin
			var plugin = {
				elements: null,
				options: {}
			};
		
			plugin = Brahma.utility.extend(plugin, $data);
			Brahma.utility.extend(plugin, Brahma.module({
				
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
					Brahma.utility.extend(plug, Brahma.plugin[arguments[0]]);
					
					
					
					plug.elements = this;
					
					plug.config = Brahma.utility.extend(plug.config, options);
				
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
	
	window.Brahma.stop = window.Brahma.ext.stop = function() {
		// Seach controllers
		Brahma.bench.call(this, arguments, function(elem, options) {
			
			if ("object" == typeof elem[0].controllers) {
				for (var i in elem[0].controllers) {
					// Stop all processes
					elem[0].controllers[i]._stop();
				}
			};

			return elem[0];

		});

		return this;
	}

	/*
	Brahma storage
	*/
	window.Brahma.storages = {};
	window.Brahma.storage = function(name, data) {
		if (typeof Brahma.storages[name] != "object") {

			Brahma.storages[name] = Brahma.module({
				____initialed: false,
				initial: function(data) {

					if (this.____initialed) return this;
					
					for (var i in data) {
						this[i] = data[i];
					};
					this.____initialed = true;
				}
			});
		};
		return Brahma.storages[name];
	}

	/*
	brahma document
	*/
	window.Brahma.document = Brahma.module({
		eventCatchers: { // objects that catch events
		}
	});

	/*
		start event listners
	*/
	window.Brahma.document._startEventListing = function(e) {
		var d = this;
		var e = e;

		// Create list for eventCatchers
		("object" != typeof this.eventCatchers[e]) && (this.eventCatchers[e] = []);

		// Add event listners
		switch(e) {
			case 'window.resize': // window resize

				window.onresize = function() {

					d.catchEvent(e, this, arguments);
				};
			break;
			case 'document.keydown':
				document.onkeydown = function() {

					d.catchEvent(e, this, arguments);
				};
			break;
			case 'document.keyup':
				document.onkeyup = function() {

					d.catchEvent(e, this, arguments);
				};
			break;
			default:

			break;
		}
	};

	/*
		Catch event
	*/
	window.Brahma.document.catchEvent = function(event, element, args) {
		// Classic event trigger
		this.trigger(event, args);

		// Give event to ctachers
		if ("object" == typeof this.eventCatchers[event])
			var etd=[];
			for (var c = 0; c<this.eventCatchers[event].length; c++) {
				if ("object" == typeof this.eventCatchers[event][c] && "function" == typeof this.eventCatchers[event][c].trigger)
				this.eventCatchers[event][c].trigger(event, args);
				else etd.push(c);
			}
			// Delete corrupt objects
			(etd.length>0) && (function(c, etd) {
				var nc = [];
				for (var e=0;e<c.length;e++) {
					if (etd.indexOf(e)<0) nc.push(c[e]);
				};
				c = nc;
			})(this.eventCatchers[event], etd);
	}

	/*
		add object to event relistners
	*/
	window.Brahma.document.translateEvents = function(handler, events) {
		/* test for event exists */
		if ("string"==typeof events) events = [events];
		for (var e = 0; e<events.length;e++) {
			/* create event listner if not exists */
			("object" != typeof this.eventListners[e]) && 
			(function(e) {
				var e = e;
				this._startEventListing(e);				
			}).call(this, events[e]);
			/* append object to listners */
			
			this.eventCatchers[events[e]].push(handler);
		};
	}

	/*
	window.Brahma.document.uin
	*/
	
	window.Brahma.document.identifiers = {
		all: [],
		create: function(prefix) {
			
			
			var id = (prefix || '')+Brahma.utility.rand(111111111,9999999999);
			var protect = 0;
			while (this.all.indexOf(id)>-1) {
				var id = (prefix || '')+Brahma.utility.rand(111111111,9999999999);
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
	
	/* Extensions */
	Brahma.trigonometria = {
		trinatur : function(num) {
			return num;
		},
		angle : function(angle) {
			if (angle<0) angle = 360-angle;
			if (angle>360) angle -= 360;
			return angle;
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
		nature : function(num) {
			if (num<0) num = 0;
			return Math.abs(num);
		},
		distX: function(radius, radian) {
			return this.disrotation(radian, radius);
		},
		distY: function(radius, radian) {
			return radius*this.sin(90 - radian);
		},
		/* calc 3D perspective */
		perspective: function(focusd, matrixw, distantion) {
			
			var hangle = this.delta2sc(matrixw/2, focusd, 90)['$B'];
			
			var areaw = this.delta2c1s(distantion, hangle, (90-hangle)).c;
			
			return areaw;
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



	// > Eval on load queues
	if (onFillQueues.length>0) {

		for (var q = 0;q<onFillQueues.length;q++) {		

			window.Brahma.includeQueue(onFillQueues[q]);
		}
	}
	onFillQueues = false;

	define('brahma', [], function() {
		return window.Brahma;
	});
	
})(typeof define === 'function' && define.amd ? define : function(Brahma) {
   
 
});