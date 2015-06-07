var extend = (function () {
	var hasOwn = Object.prototype.hasOwnProperty;
	var toStr = Object.prototype.toString;

	var isArray = function isArray(arr) {
		if (typeof Array.isArray === 'function') {
			return Array.isArray(arr);
		}

		return toStr.call(arr) === '[object Array]';
	};

	var isPlainObject = function isPlainObject(obj) {
		'use strict';

		if (!obj || toStr.call(obj) !== '[object Object]') {
			return false;
		}

		var has_own_constructor = hasOwn.call(obj, 'constructor');
		var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
		// Not own constructor property must be Object
		if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		var key;
		for (key in obj) {/**/}

		return typeof key === 'undefined' || hasOwn.call(obj, key);
	};

	return function extend() {
		'use strict';

		var options, name, src, copy, copyIsArray, clone,
			target = arguments[0],
			i = 1,
			length = arguments.length,
			deep = false;

		// Handle a deep copy situation
		if (typeof target === 'boolean') {
			deep = target;
			target = arguments[1] || {};
			// skip the boolean and the target
			i = 2;
		} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
			target = {};
		}

		for (; i < length; ++i) {
			options = arguments[i];
			// Only deal with non-null/undefined values
			if (options != null) {
				// Extend the base object
				for (name in options) {
					src = target[name];
					copy = options[name];

					// Prevent never-ending loop
					if (target !== copy) {
						// Recurse if we're merging plain objects or arrays
						if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
							if (copyIsArray) {
								copyIsArray = false;
								clone = src && isArray(src) ? src : [];
							} else {
								clone = src && isPlainObject(src) ? src : {};
							}

							// Never move original objects, clone them
							target[name] = extend(deep, clone, copy);

						// Don't bring in undefined values
						} else if (typeof copy !== 'undefined') {
							target[name] = copy;
						}
					}
				}
			}
		}

		// Return the modified object
		return target;
	};
})();

var advancedQuerySelector = (function () {
	/*
	IE не поддерживает scope: в querySelector, поэтому требуется альтернативное решение.
	Решение найдено здесь: https://github.com/lazd/scopedQuerySelectorShim
	*/

	(function() {
	  if (!HTMLElement.prototype.querySelectorAll) {
	    throw new Error('rootedQuerySelectorAll: This polyfill can only be used with browsers that support querySelectorAll');
	  }

	  // A temporary element to query against for elements not currently in the DOM
	  // We'll also use this element to test for :scope support
	  var container = document.createElement('div');

	  // Check if the browser supports :scope
	  try {
	    // Browser supports :scope, do nothing
	    container.querySelectorAll(':scope *');
	  }
	  catch (e) {
	    // Match usage of scope
	    var scopeRE = /^\s*:scope/gi;

	    // Overrides
	    function overrideNodeMethod(prototype, methodName) {
	      // Store the old method for use later
	      var oldMethod = prototype[methodName];

	      // Override the method
	      prototype[methodName] = function(query) {
	        var nodeList,
	            gaveId = false,
	            gaveContainer = false;

	        if (query.match(scopeRE)) {
	          // Remove :scope
	          query = query.replace(scopeRE, '');

	          if (!this.parentNode) {
	            // Add to temporary container
	            container.appendChild(this);
	            gaveContainer = true;
	          }

	          parentNode = this.parentNode;

	          if (!this.id) {
	            // Give temporary ID
	            this.id = 'rootedQuerySelector_id_'+(new Date()).getTime();
	            gaveId = true;
	          }

	          // Find elements against parent node
	          nodeList = oldMethod.call(parentNode, '#'+this.id+' '+query);

	          // Reset the ID
	          if (gaveId) {
	            this.id = '';
	          }

	          // Remove from temporary container
	          if (gaveContainer) {
	            container.removeChild(this);
	          }

	          return nodeList;
	        }
	        else {
	          // No immediate child selector used
	          return oldMethod.call(this, query);
	        }
	      };
	    }

	    // Browser doesn't support :scope, add polyfill
	    overrideNodeMethod(HTMLElement.prototype, 'querySelector');
	    overrideNodeMethod(HTMLElement.prototype, 'querySelectorAll');
	  }
	}());

	return function(query, root) {
		var prefix;
		(root) ? (prefix=':scope ') : (prefix=''); 
		var root = root||document;

		switch(typeof query) {
			case 'string':
				var queryExpr = /<([a-zA-Z0-9_]+) \/>/i,
				argsExpr = /\[([a-zA-Z0-9_\-]*)[ ]?=([ ]?[^\]]*)\]/i;

				if (query.indexOf('[')>-1 && argsExpr.exec(query)) {
					/*
					Значения в запросах по поиск аттрибутов необходимо возводить в ковычки
					*/
					var patch = true;
					query = query.replace(argsExpr, "[$1=\"$2\"]");
				} 

				if (queryExpr.exec(query) === null) {
					if (query.length===0) return new Array();
					
					// Нативный селектор
					try {
						return root.querySelectorAll(prefix+query);
					} catch(e) {
						console.log('Brahma: querySelectorAll not support query: '+query)
					}
								
				} else {
					return [document.createElement(result[1].toUpperCase())];
				};
			break;
			case 'function':
				return [];
			break;
			case 'object':
				
				if (query instanceof Array) {
					
					return query;
				} if (query===null) {
					return [];
				} else {
					// test for window
					if (query==window) {
						return [query];
					}
					// test for jquery
					else if (query.jquery) {
						var elements = [];
						for (var j=0;j<query.length;j++) elements.push(query[j]);
						return elements;
					// test for self
					} else if (query.brahma) {
						var elements = [];
						for (var j=0;j<query.length;j++) elements.push(query[j]);
						return elements;				
					} else {
						
						return [query];
					};
				}
			break;
			case "undefined":
			default:
				return [query];
			break;
		};
	}
})();

var core = (function (extend, querySelector) {
		
	var Brahma = function() {
		if (this === window) {
			var air=new Brahma, elements=[], index=0, callback, ptest;
			if (arguments.length>0) {
				/*
				Initial selector
				*/
				air.selector=arguments[0];
			}
			/*
			Perform query
			*/
			switch(typeof air.selector) {
				case "function":
					/*
					Simply callback function with Brahma in callback agruments
					*/
					selector.call(this, Brahma);
				break;
				default:
					var elements = querySelector.call(this, air.selector);
				break;
			}
			/*
			Safari ведет себя очень странно, querySelectorAll возвращает функцию со свойствами, вместо массива, поэтому нам необходимо тестировать и на тип "function".
			*/
			if ( ("object"===typeof elements || "function"===typeof elements) && elements.length) {
				for (index=0;index<elements.length;index++) {
					air[index] = elements[index];
				}
			}

			/*
			Контекст по умолчанию
			*/
			air.length = index;
			air.context = document;

			return air;

		} else {
			this.length=0;
			this.selector=null;
		}
		
	}

	Brahma.fn = Brahma.prototype = {
		constructor: Brahma,
		version: '0.0.0',
		brahma: true
	}

	return Brahma;

})(extend,advancedQuerySelector);

var warns = (function () {
	return {
		"b_selector_uncom_format": "Incompatible format of query selector",
		"not_valid_nodename": "Not valid node name"
	}
})();

var getAbstractClass = (function () {
	var detectors = {
		"object": {
			"Null": function(res) {
				if (res===null)  return true; return false;
			},
			// Detect Array
			"Array": function(res) {
				if (res instanceof Array) return true; return false;
			},
			// Detect HTMLElement
			"HTMLElement": function(res) {
				if (res.toString().substr(0,12)==="[object HTML") return true; return false;
			},
			// Detect date object
			"Date": function(res) {
				if (res instanceof Date) return true; return false;
			},
			// Detecting absApplication
			"absApplication": function(res) {
				if (res.hasOwnProperty('app__')) return true; return false;
			},
			// Detect Rich object
			"RichArray": function(res) {
				if (!(res instanceof Array) && "integer"===typeof res.index) return true; return false;
			}
		},
		"string": {
			// Detect selector
			"Selector": function(res) {
				if (/^[>#\.]{0,2}[^'"]+[a-zA-Z0-9\[]+/.test(res)) return true; return false;
			},
			// Json
			"JSON": function(res) {
				if (/^[\{]{1}[\s\S]*[\}]{1}$/gi.test(res)) return true; return false;
			}
		}
	};
	return function(subject) {
		if (detectors[typeof subject]) {
			for (var s in detectors[typeof subject]) {
				if (detectors[typeof subject].hasOwnProperty(s)) {

					if (detectors[typeof subject][s](subject)) {
						return s;
					}
				}
			}
		}
	}
})();

var createChild = (function (w) {

	return function(nodeName, data, prepend) {
		var context = (this===window) ? document.body : this;
		data = data||{};
		try {
			var newElement = document.createElement(nodeName);
		} catch(e) {
			Brahma.warn(w['not_valid_nodename']+' '+nodeName);
			return null;
		}

		;(!(prepend||false))?context.appendChild(newElement):(function() {
			
			if (context.firstChild!==null)
			context.insertBefore(newElement, context.firstChild);
			else context.appendChild(context);
		})();

		for (var name in data) {
			if (data.hasOwnProperty(name)) {
				newElement.setAttribute(name, data[name]);
			}
		}

		return Brahma([newElement]);
	}

})(warns);

var toArray = (function () {
	return function(ob) {
		return Array.prototype.slice.call(ob);
	}
})();

;(function (core, extend) {
	core.fn.extend = function(ext) {
		extend(this, ext);
	}
})(core,extend);

;(function (core) {
	core.fn.extend({
		each: function(callback) {
			for (var i = 0; i<this.length;i++) {
				callback.call(this[i], this[i], i);
			}
			return this;
		}
	});
})(core);

;(function (core) {

	core.warn = function(message) {
		console.error("%c Brahma.warn", "color:red;font-weight:bold;", message);
	}
})(core);

;(function (core, querySelector) {
	core.fn.extend({
		find: function(selector) {
			var suit = [],elements;
			this.each(function() {
				elements = querySelector(selector, this);
				if (elements.length) for (var i=0;i<elements.length;i++) {
					suit.push(elements[i]);
				};
			});

			return Brahma(suit);
		}
	});
})(core,advancedQuerySelector);

;(function (core) {
	core.fn.extend({
		html: function(html) {
			if ("undefined"===typeof html) {
				if (this.length<=0) return null;
				return this[0].innerHTML;
			}
			else
			return Brahma(this).each(function() {
				this.innerHTML = html;
			});
		}
	});
})(core);

;(function (core) {
	core.fn.extend({
		empty: function() {
			this.each(function() {
				this.innerHTML = '';
			});
			return this;
		}
	});
})(core);

;(function (w, core, gac, cc, ta) {
	core.fn.extend({
		put: function(subject, data) {
			var object = [],suit=[],
			absClass=gac(subject);
			console.log('absClass', absClass);
			switch(absClass) {
				case "HTMLELement":
					/* Force HTML Elements */
					object = [];
				break;
				case "Selector":
				case "String":
					/* Create element */
					object = cc(subject, data||{});
				break;
				case "Brahma":
				case "jQuery":
				case "Array":
					object = ta(subject);
				break;
				default:
					Brahma.warn(w['b_selector_uncom_format']+' '+absClass);
				break;
			};

			// Append child
			this.each(function() {
				for (i=0;i<object.length;++i) {
					this.appendChild(object[i]);
				}
			});

			return Brahma(object);
		}
	});
})(warns,core,getAbstractClass,createChild,toArray);



;(function (core, internals, dom) {
	window.brahma = window.Brahma = core;
})(core,null,null);