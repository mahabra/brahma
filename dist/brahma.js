var extend = (function () {
	/* Extend function (modified with pseudo Reference) */
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

							if (copy.constructor.name!=='Ref')
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

var querySelector = (function () {
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

})(extend,querySelector);

var clone = (function () {
	var self;
	self = function(prototype) {

		if (prototype instanceof Array) {
			var clone = [];
			clone.length=prototype.length;
		} else if ("object"!==typeof prototype) {
			return prototype;
		} else {
			var clone = {};
		};
		
		for (var prop in prototype) {
			if (!prototype.hasOwnProperty(prop)) continue;
			if (prototype[prop]===null || "object"!==typeof prototype[prop] || prototype[prop].constructor.name==='Ref') {
				clone[prop] = prototype[prop];
			} else {
				clone[prop] = self(prototype[prop]);
			}
		};

		return clone;
	}
	return self;
})();

var mix = (function () {
	/*
	Перемешивает функции. В результате получая новую функцию, содеражщую тела обоих функций.
	Прототипы и личные свойства функций так же миксуются, если имеют место быть. Приоритет на второй функции.
	*/
	return function(func1, func2) {
		if ("function"===typeof func1 && "function"===typeof func2) {
			var func3 = function() {
				func2.apply(this, arguments);
				func1.apply(this, arguments);
			}

			if ("object"===typeof func1.prototype || "object"===typeof func2.prototype) {
				if (func1.prototype) {
					func3.prototype = func1.prototype;
					func1.prototype=null;
				}
				if (func2.prototype) {
					if ("undefined"!==typeof func3.prototype) 
					func3.prototype = inherit(func3.prototype, func2.prototype);
					else func3.prototype = func2.prototype;
					func2.prototype=null;
				}
			}

			for (var prop in func1) {
				if (func1.hasOwnProperty(prop)&&prop!=="prototype")
				func3[prop] = func1[prop];
			}

			for (var prop in func2) {
				if (func1.hasOwnProperty(prop)&&prop!=="prototype")
				func3[prop] = func2[prop];
			}

			return func3;
		} else if ("object"===typeof func1 && "object"===typeof func2) {
			for (var prop in func2) {
				if (func2.hasOwnProperty(prop)) {
					func1[prop] = clone(func2[prop]);
				}
			}
			return func1;
		}
	}
})();

var warns = (function () {
	return {
		"b_selector_uncom_format": "Incompatible format of query selector",
		"not_valid_nodename": "Not valid node name",
		"undefined_absclass": "Undefined class",
		"undefined_factory": "Undefined factory"
	}
})();

var inherit = (function (extend, clone, mix) {
	


	/*
	Функция находит пустой прототип и расширяет его. 
	Метод используют свойство __proto__, поэтому в IE он лишь имитирует данный подход, без каких либо 
	приемуществ.
	*/
	return function(level, proto) {
		var deeper=true;

		/*
		Создает новую обертку
		*/
		if (level.__proto__) {
			var newessence = Object.create(level.__proto__);
			for (var prop in proto) {
				if (proto.hasOwnProperty(prop)) {
					if ("function"===typeof proto[prop]) {
						newessence[prop] = proto[prop];
					} else {
						level[prop] = clone(proto[prop]);
					}
				}
			}
			
			/* ES6 supports */
			
			level.__proto__ = newessence;
			return level;
		} else {
			/* IE10 like */
			/* Раскладываем proto на методы и свойства */

			var dummy={},construct = function() {},methods={},properties={};
			for (var x in proto) {

				if((typeof dummy[x] == "undefined") || (dummy[x] != proto[x])) {
					if ("function"===typeof proto[x]) {
					
					methods[x] = proto[x];
					}
					else
					properties[x] = clone(proto[x]);
				}
			}
			console.log('HELLO?');
			for (var x in level) {
				if((typeof dummy[x] == "undefined") || (dummy[x] != level[x])) {

					if ("function"===typeof level[x]) {
						console.log('mixin func ', x);
					methods[x] = level[x];
					} else
					properties[x] = clone(level[x]);
				} else {
					console.log('unmixin ', console.log('mixin func ', x));
				}
			}


			
			/* Расширяем прототип методами */
			construct.prototype = methods;
			
			construct.prototype.constructor = level.constructor;


			var mixin = new construct();
			return mix(mixin, properties);
		}
	}
})(extend,clone,mix);

var charge = (function (inherit, clone) {
	/*
	Фабрика инициализации методов
	*/
	var definePropertiesFabric = function(props) {
		return function() {
			for (var prop in props) {
				if (props.hasOwnProperty(prop)) {
					this[prop] = clone(props[prop]);
				}
			}
		}
	}

	/*
	Функция расширяет subject через специальный абстрактный класс. Класс должен содержать свойства [object proto],[function construct]
	и [object properties].
	Суть функции заключается в том, что бы расширить прототип (через inherit) функциями из proto, создать новые свойства (которые будут 
	уникальны для данного объекта) из properties и применить конструктор из construct. По существу properties можно оставить пустым, т.к.
	все необходимые свойства можно создать через construct.

	В случае если subject - функция, происходит создание фабрики объекта, расширенного абстрактынм классом. Т.е. те же самые действия, которые
	происходит при расширении объекта как бы откладываются на потом, когда функция будет использована как конструктор нового объекта.

	Аргументы:
	subject : объект или функция
	absClass : класс abstrctClass
	patchFunctionObject : при значении true, методы и свойства класса, а так же конструктор будет применен к объекту функции, а не к её прототипу.
	*/
	return function(subject, absClass, patchFunctionObject) {

		if ("function"===typeof subject) {

			if (patchFunctionObject) {
				resubject = subject;
			} else {
				var initials = [],
				// Create new Function object
				resubject = function() { for (var i=0;i<initials.length;i++) { initials[i].apply(this, arguments); } },
				subjectPrototype={},
				subjectProperties={};

				// Dettach subject prototype
				if ("object"===typeof subject.prototype) {
					subjectPrototype=subject.prototype;
					subject.prototype={};
				}

				// Dettach subject properties
				for (prop in subject) {
					if (subject.hasOwnProperty(prop)) {
						subjectProperties[prop] = subject[prop];
						delete subject[prop];
					}
				}

				/*
				Re-prototype by self prototype
				*/
				resubject.prototype = subjectPrototype;
			}

			/*
			Append constructor from class
			*/
			if ("function"===typeof absClass.construct) {
				if (patchFunctionObject) absClass.construct.apply(resubject);
				else initials.push(new Object(absClass.construct));
			}

			/*
			Add class methods to prototype
			*/
			if ("object"===typeof absClass.proto) {
				if (patchFunctionObject) extend(resubject, absClass.proto);
				else inherit(resubject.prototype, absClass.proto);
			}

			/*
			Append constructor to initial unique properties
			*/
			if ("object"===typeof absClass.properties) {
				if (patchFunctionObject) extend(resubject, absClass.properties);
				else initials.push(definePropertiesFabric(absClass.properties));
			}

			if (!patchFunctionObject) {
				/*
				Append subject constructor
				*/
				initials.push(subject);

				/*
				Append Function properties
				*/
				for (var prop in subjectProperties) {
					if (subjectProperties.hasOwnProperty(prop)) {
						resubject[prop] = subjectProperties[prop];
					}
				}
			}

			return resubject;
		} else {
			/*
			Append constructor to initial unique properties
			*/

			if ("object"===typeof absClass.properties) {

				for (prop in absClass.properties) {
					if (absClass.properties.hasOwnProperty(prop)) {

						subject[prop] = clone(absClass.properties[prop]);

					}
				}
			}
			
			/*
			Add class methods to prototype
			*/
			if ("object"===typeof absClass.proto) {
				subject = inherit(subject, absClass.proto);
			}

			/*
			Append constructor from class
			*/
			if ("function"===typeof absClass.construct) {
				absClass.construct.apply(subject);
			}

			
			return subject;
		}
	}
})(inherit,clone);

;(function (core, charge, mix, warns) {
	core.classes = {};

	/*
	Creates new class
	*/
	core.classes.create = function(name, data, extensions) {
		this[name] = extend({
			construct: function() {},
			proto: {},
			properties: {}
		}, data||{});

		// Charge
		if (extensions instanceof Array)
		for (var i = 0;i<extensions.length;++i) {
			if ("function"===typeof this[extensions[i]].construct) {
				this[name].construct = mix(this[name].construct, this[extensions[i]].construct);
			}

			if ("object"===typeof this[extensions[i]].proto) {
				mix(this[name].proto, this[extensions[i]].proto);
			}

			if ("object"===typeof this[extensions[i]].properties) {
				mix(this[name].properties, this[extensions[i]].properties);
			}
		}
	};

	/*
	Charge objecy by class
	*/
	core.charge = function(subject, extension, patchFunctionObject) {
		return charge(subject, core.classes[extension], patchFunctionObject||false);
	}

	/*
	Create new object charged by classes
	*/
	core.create = function(extend, classes) {
		extend=extend||{};classes=classes||[];
		if (!(classes instanceof Array)) classes = [classes];
		classes.forEach(function(name) {
			if ("object"!==typeof core.classes[name]) return core.warn(warns["undefined_absclass"]+" "+name);
			extend = charge(extend, core.classes[name]);
		});

		return extend;
	}
})(core,charge,mix,warns);


	core.fn.extend = function(ext) {
		extend(this, ext);
	}



	core.classes['events'] = {
		properties: {
			__events: {
				eventListners : {}
			}
		},
		proto: {
			bind : function(e, callback, once) {

				if (typeof this.__events.eventListners[e] !== 'object') this.__events.eventListners[e] = [];
				
				this.__events.eventListners[e].push({
					callback: callback,
					once: once
				});

				return this;
			},
			on: function() {
				this.bind.apply(this, arguments);
				return this;
			},	
			once : function(e, callback) {
				this.bind(e, callback, true);
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
				
				var response = false;

				if (typeof this.__events.eventListners[e] == 'object' && this.__events.eventListners[e].length>0) {
					var todelete = [];
					for (var i = 0; i<this.__events.eventListners[e].length; i++) {
						if (typeof this.__events.eventListners[e][i] === 'object') {
							if (typeof this.__events.eventListners[e][i].callback === "function") response = this.__events.eventListners[e][i].callback.apply(this, args);
							
							if (this.__events.eventListners[e][i].once) {

								todelete.push(i);
							};
						};
					};
					
					if (todelete.length>0) for (var i in todelete) {
						this.__events.eventListners[e].splice(todelete[i], 1);
					};
				};
				return response;
			}
		}
	};


var support = (function (core, extend) {
	core.support = function(test) {
		if (Brahma.support[test] && "function"===typeof Brahma.support[test]) Brahma.support[test] = Brahma.support[test]();
		if (Brahma.support[test]) return Brahma.support[test]; else return false;
	};

	core.support.extend = function(data) {
		extend(this, data);
		return this;
	};

	return core.support;

})(core,extend);

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

var createChild = (function (warns) {

	return function(nodeName, data, prepend) {
		var context = (this===window) ? document.body : this;
		data = data||{};
		try {
			var newElement = document.createElement(nodeName);
		} catch(e) {
			Brahma.warn(warns['not_valid_nodename']+' '+nodeName);
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

var determineNodeObject = (function (warns, getAbstractClass, createChild, toArray) {
	return function(subject, data) {
		var objects = [],
		absClass=getAbstractClass(subject);
		switch(absClass) {
			case "HTMLELement":
				/* Force HTML Elements */
				objects = [subject];
			break;
			case "Selector":
			case "String":
				/* Create element */
				objects = createChild(subject, data||{});
			break;
			case "Brahma":
			case "jQuery":
			case "Array":
				objects = toArray(subject);
			break;
			default:
				Brahma.warn(warns['b_selector_uncom_format']+' '+absClass);
			break;
		};

		return objects;
	}
})(warns,getAbstractClass,createChild,toArray);

var utils = (function (core, extend) {
	core.utils = {
		extend: function(data, extra) {
			if ("undefined"!==typeof extra) {
				return extend(data, extra);
			} else {
				extend(this, data);
				return this;
			}			
		}
	};

	return core.utils;
})(core,extend);

var ref = (function () {
	/*
	Возвращает пустой объект, ссылающийся на другой объект. Ключевым является имя конструктора Ref. 
	Функция extend по этому имени будет определять требуется ли глобокое миксивание для этого свойства или нет.
	Это функция исправляет слабость языка Javascript в недостатке явного типа объект|ссылка и помогает избегать
	лишний операций с миксованием или дед-лупа.
	*/
	return function(proto) {
		function Ref() {};
		Ref.prototype = proto||this;
		Ref.prototype.constructor = Ref;
		return new Ref;
	}
})();

;(function () {
	core.charge(core, 'events', true);
})(core);


	core.document = core.create({
		ready: false
	}, ['events']);



	core.fn.extend({
		parent: function() {
			var parentList = [];
			this.each(function() {
				if (parentList.indexOf(this.parentNode)<0) parentList.push(this.parentNode);
			});
			return Brahma(parentList);
		}
	})



	utils.extend({
		camelize: function(text) {
			return text.replace(/-([\da-z])/gi, function( all, letter ) {
				return letter.toUpperCase();
			});
		}
	});



	support.extend({
		dataset: function() {
			return (typeof document.createElement('div').dataset !== "undefined");
		}
	});


;(function (core, extend, clone, mix, ref, warns) {
	/*
	Наделяет объект способности создавать фабрики, объекты и модули
	*/
	core.classes['industry'] = {
		properties: {
			__industry: {
				factories: {}
			}
		},
		proto: {
			/*
			Создает новую фабрику с имененм name, расширенную абстрактными классами classes, с конструктором construct и свойствами extra
			*/
			factory: function(name, construct, extra, classes) {
				classes=classes||[];
				construct=construct||null;
				extra=extra||null;
				var self = this;
				if (!(classes instanceof Array)) classes= [classes];
				/* Создает новую или расширяет существующую фабрику */
				if ("object"!==typeof this.__industry.factories[name]) {
					this.__industry.factories[name] = {
						properties: {},
						proto: {},
						construct: function(){},
						make: function() {
							return self.make.call(self, name, arguments);
						}
					};
				};

				var self = this;
				classes.forEach(function(classname) {
					/*
					Ошибка: не найден абстрактный класс
					*/
					if ("object"!==typeof core.classes[classname]) return core.warn(warns["undefined_absclass"]+" "+classname);

					var absClass=core.classes[classname];
					/*
					Расширяем конструктор классом
					*/

					if ("function"===typeof absClass.constructor) {
						self.__industry.factories[name].construct = mix(self.__industry.factories[name].construct, absClass.constructor);
					}

					/*
					Расширяем прототип
					*/
					if ("object"===typeof absClass.proto) {
						inherit(self.__industry.factories[name].proto, absClass.proto);
					}
					/*
					Расширяем свойства
					*/
					if ("object"===typeof absClass.properties) {
						self.__industry.factories[name].properties = extend(self.__industry.factories[name].properties, absClass.properties);
					}
				});

				/* Расширяем пользовательским конструктором */
				if ("function"===typeof construct) {
					this.__industry.factories[name].construct = mix(self.__industry.factories[name].construct, construct);
				}

				/* Расширяем пользовательским объектом */
				for (var prop in extra) {
					if (extra.hasOwnProperty(prop)) {
						if ("function"===typeof extra[prop]) {
							this.__industry.factories[name].proto[prop] = extra[prop];
						} else {
							this.__industry.factories[name].properties[prop] = extra[prop];
						}
					}
				}
				
				return this.__industry.factories[name];
				
			},
			/*
			Создает объект на основе фабрики. Если фабрика не указана явно, то принимает имя по-умолчанию default.
			Default позволяет создавать быстрые объекты. my.create();
			*/
			make: function(name, args) {
				
				("string"!==typeof name) && (extra=name,name="default");
				("object"!==typeof options) && (options={});

				if ("object"!==typeof this.__industry.factories[name]) return core.warn(warns['undefined_factory']+" "+name);
				var factory = this.__industry.factories[name];

				var moduleFactory = function(){
					for (prop in factory.properties) {
						if (factory.properties.hasOwnProperty(prop)) {
							this[prop] = clone(factory.properties[prop]);
							console.log('$module A', this.config);
						}
					}
					
				};
				
				moduleFactory.prototype = factory.proto;

				var module = new moduleFactory();
				
				factory.construct.apply(module, args||[]);

				/*
				Указываем ссылку на хозяина
				*/
				module.parent = ref(this);


				return module;
			}
		}
	}
})(core,extend,clone,mix,ref,warns);


	core.fn.extend({
		each: function(callback) {
			for (var i = 0; i<this.length;i++) {
				if (callback.call(this[i], this[i], i)===false) break;
			}
			return this;
		}
	});




	core.warn = function(message) {
		console.error("%c Brahma.warn", "color:red;font-weight:bold;", message);
	}


var addEvent = (function () {
	return function(elem, type, userEventHandler, once) {
		var eventHandler;

		eventHandler = function(e) {
			if (once) {
				if ( elem.addEventListener ) {
					elem.removeEventListener(type, eventHandler, false);
				}  else if ( elem.attachEvent ) {
					 element.detachEvent("on" + type, eventHandler);
				} else {
					elem["on"+type] = null;
				};
			};

			// Prevent default event handler if user returns false
			if ((function(r) { return (typeof r==="boolean" && r===false) })(userEventHandler.apply(this, arguments))) {

				e.preventDefault();
			};
		};
	    if (elem == null || typeof(elem) == 'undefined') return;
	    if ( elem.addEventListener ) {

	        elem.addEventListener( type, eventHandler, false );
	    } else if ( elem.attachEvent ) {
	        elem.attachEvent( "on" + type, eventHandler );
	    } else {
	        elem["on"+type]=eventHandler;
	    }
	}
})();

var removeEvent = (function () {
	return function(elem, type, userEventHandler) {
		if ( elem.addEventListener ) {
			elem.removeEventListener(type, userEventHandler||false, false);
		}  else if ( elem.attachEvent ) {
			 element.detachEvent("on" + type, userEventHandler);
		} else {
			elem["on"+type] = null;
		};
	};
})();


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



	core.fn.extend({
		empty: function() {
			this.each(function() {
				this.innerHTML = '';
			});
			return this;
		}
	});



	core.fn.extend({
		put: function(subject, data) {
			// This function return Array anyway
			var objects = determineNodeObject(subject, data);

			// Append child
			this.each(function() {
				for (i=0;i<objects.length;++i) {
					this.appendChild(objects[i]);
				}
			});

			return Brahma(objects);
		}
	});



	core.fn.extend({
		and: function(subject, data) {
			// This function return Array anyway
			var objects = determineNodeObject(subject, data);
			
			this.each(function() {
			    var parent = this.parentNode;
			   
			    if(parent.lastChild === this) {
			        for (i=0;i<objects.length;++i) {
			       		parent.appendChild(objects[i]);
			    	}
			    } else {
			    	for (i=0;i<objects.length;++i) {
				        parent.insertBefore(objects[i], this.nextSibling);
				    }
			    }
			});

			return Brahma(objects);
		}
	});



	core.fn.extend({
		attr: function() {
			if (arguments.length>0) {
				switch(typeof arguments[0]) {
					case 'object':
						this.each(function() {
							for (var i in arguments[0]) {
								this.setAttribute(i, arguments[0][i]);
							};	
						});
					break;
					case "string":
						if (arguments.length>1) {
							this.each(function() {							
								this.setAttribute(arguments[0], arguments[1]);
							});
							return this;
						} else {
							return this[0].getAttribute(arguments[0]);
						}
					break;
					default:
						return this[0].attributes;
					break;
				};
				return this;
			} else {
				return this[0].attributes;
			};
		}
	});



	core.fn.extend({
		addClass: function() {
			var className = arguments[0].split(' '),i;
			this.each(function() {
				for (i=0;i<className.length;++i) {
					var st = this.className.split(' ');
					(st.indexOf(className[i])<0) && (st.push(className[i]), this.className = st.join(' '));
				}
			});
			return this;
		},
		removeClass: function() {
			var className = arguments[0].split(' '),i;
			this.each(function() {
				for (i=0;i<className.length;++i) {
					var st = this.className.split(' ');
					var index = st.indexOf(className[i]);
					if (index>-1) {
						st.splice(index, 1);
						this.className = st.join(' ');
					};
				}
			});
			return this;
		}
	});



	core.fn.extend({
		wrapAll: function(subject, data) {
			var objects = determineNodeObject(subject, data),i=0;
			if (subject.length===0) return null;

			for (i = 0; i<objects.length; i++) {
				this.parent()[0].appendChild(objects[i]);
			}

			this.each(function() {
				objects[0].appendChild(this);
			});

			return Brahma(objects);
		}
	});



	core.fn.extend({
		data: function() {
			var args=arguments,
			key = Brahma.utils.camelize(args[0]),
			allowdataset=Brahma.support('dataset');
			if (args.length>1) {
				this.each(function() {
					if (args[1]===null) {
						if (allowdataset)
						delete this.dataset[key];
						else this.removeAttribute("data-"+args[0]);
					} else {
						if (allowdataset)
						this.dataset[key] = args[1];
						else this.setAttribute("data-"+args[0], args[1]);
					};
				});
			} else {
				if (allowdataset)
				return ("undefined"!==typeof this[0].dataset[key]) ? this[0].dataset[key] : null;
				else
				return this[0].getAttribute("data-"+args[0]);
			}
			
			return this;
		}
	});



	core.fn.extend({
		css: function() {
			
			var data, polymorph=[];
			("object"===typeof arguments[0]) 
			? 
			((arguments[0] instanceof Array) ? (polymorph=arguments[0],data=arguments[1]) : (data=arguments[0])) 
			: ( (arguments.length>1) ? (data={},data[arguments[0]]=arguments[1]) : (data=arguments[0]) );
			if ("object"===typeof data) {
				this.each(function() {
					for (var i in data) {
						if (polymorph.length!==0) for (var p = 0;p<polymorph.length;p++)
						this.style[polymorph[p]+i] = data[i];
						this.style[i] = data[i];
					};	
				});
				
				return this;
			} else {
				return this[0].style[data];
			}
		}
	});


;(function (core, addEvent, removeEvent) {
	core.fn.extend({
		bind : function() {
			var args = arguments;
			var events = args[0].split(' ');
			return this.each(function() {
				if (events[e]==='') return true;
				for (var e = 0;e<events.length;++e) {
					addEvent(this, events[e], args[1], args[2]||false);
				}
			});
		},
		on : function() {
			return this.bind.apply(this, arguments);
		},
		unbind : function() {
			var args = arguments;
			var events = args[0].split(' ')
			return this.each(function() {
				for (var e = 0;e<events.length;++e) {
			   		removeEvent(this, events[e], args[1]||false);
			   	}
			});
		}
	});
})(core,addEvent,removeEvent);

;(function () {
	
	(function (win, fn) {
	      var done = false, top = true,
	  
	      doc = win.document, root = doc.documentElement,
	  
	      add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
	      rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
	      pre = doc.addEventListener ? '' : 'on',
	  
	      init = function(e) {
	          if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
	          (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
	          if (!done && (done = true)) fn.call(win, e.type || e);
	      },
	  
	      poll = function() {
	          try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
	          init('poll');
	      };
	  
	      if (doc.readyState == 'complete') fn.call(win, 'lazy');
	      else {
	          if (doc.createEventObject && root.doScroll) {
	              try { top = !win.frameElement; } catch(e) { }
	              if (top) poll();
	          }
	          doc[add](pre + 'DOMContentLoaded', init, false);
	          doc[add](pre + 'readystatechange', init, false);
	          win[add](pre + 'load', init, false);
	      }
	  
	})(window, function() {
		
		core.document.ready = true;
		core.trigger('DOMReady');
	});

	core.fn.extend({
		ready: function(callback) {
			var self = this;
			if (this[0]===window||this[0]===document) {
				if (core.document.ready) callback.apply(this);
				else core.bind('DOMReady', function() {
					callback.apply(self);
				});
			}
		}
	});
})(core);


	support.extend({
		mobile: function() {
			 var check = false;
	        var i = 0,
	         iOS = false,
	         iDevice = ['iPad', 'iPhone', 'iPod'];


	        for (;i < iDevice.length ; i++ ) {
	            if( navigator.platform === iDevice[i] ){ return true; break; }
	        }
	        (function(a,b){if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(a))check = true})(navigator.userAgent||navigator.vendor||window.opera);
	        
	        return check;
		}
	});



	support.extend({
		translate3D: function() {
			// https://gist.github.com/dryan/738720
			// borrowed from modernizr
			var div = document.createElement('div'),
				ret = false,
				properties = ['perspectiveProperty', 'WebkitPerspective'];
			for (var i = properties.length - 1; i >= 0; i--){
				ret = ret ? ret : div.style[properties[i]] != undefined;
			};
	        
	        // webkit has 3d transforms disabled for chrome, though
	        //   it works fine in safari on leopard and snow leopard
	        // as a result, it 'recognizes' the syntax and throws a false positive
	        // thus we must do a more thorough check:
	        if (ret){
	            var st = document.createElement('style');
	            // webkit allows this media query to succeed only if the feature is enabled.    
	            // "@media (transform-3d),(-o-transform-3d),(-moz-transform-3d),(-ms-transform-3d),(-webkit-transform-3d),(modernizr){#modernizr{height:3px}}"
	            st.textContent = '@media (-webkit-transform-3d){#test3d{height:3px}}';
	            document.getElementsByTagName('head')[0].appendChild(st);
	            div.id = 'test3d';
	            document.body.appendChild(div);
	            
	            ret = div.offsetHeight === 3;
	            
	            st.parentNode.removeChild(st);
	            div.parentNode.removeChild(div);
	        }
	        return ret;
		}
	});



	core.classes['tie'] = {
		proto: {
			tie: function(cb) {
				cb.apply(this, arguments);
				return this;
			}
		}
	}



	/*
	Позволяеь создавать модули для фабрик
	*/
	core.classes.create('modules',{
		properties: {
			__modules: {
				modules: {}
			}
		},
		proto: {
			module: function(name) {
				var 
				name='module_'+name||'module_default',
				initial=("function"===typeof arguments[2]) ? arguments[2] : ("function"===typeof arguments[1] ? arguments[1] : false),
				data=("object"===typeof arguments[1]) ? arguments[1] : ("object"===typeof arguments[2] ? arguments[2] : false);

				if (data||initial) {
					// Создаем фабрику
					this.factory(name, initial, data||{}, ['events','modules']);
					return this;
				} else {
					if ("undefined"===typeof this.__modules.modules[name]) {
						this.__modules.modules[name] = this.make(name);
					}
				}
				return this.__modules.modules[name];
			}
		}
	},['industry']);



	core.classes['extendable'] = {
		proto: {
			extend: function(extra) {
				extend(this, extra);
			}
		}
	}


;(function (core, mix, clone) {
	core.applications = core.create({
		__applications: core.create({
			designers: {}
		},['industry'])
	},['extendable']);

	/* Создаем фабрику для разработки приложений */
	core.applications.__applications.factory('appdesigner', function() {
		this.factory = null;
		this.modules = {};
	}, {
		release: function(operand, config) {
			return this.factory.make(operand, config);
		},
		extend: function(data) {
			for (var prop in data) {
				if (data.hasOwnProperty(prop)) {
					if ("function"===typeof data[prop]) {
						this.factory.proto[prop] = data[prop];
					} else {
						this.factory.properties[prop] = clone(data[prop]);
					}
				}
			}
			return this;
		},
		/*
		Модуль инициализиурется только после запуска приложения, поэтому все его данные остаются уникальными
		*/
		module: function(name) {
			var 
			initial=("function"===typeof arguments[2]) ? arguments[2] : ("function"===typeof arguments[1] ? arguments[1] : false),
			data=("object"===typeof arguments[1]) ? arguments[1] : ("object"===typeof arguments[2] ? arguments[2] : false);

			this.factory.construct = mix(this.factory.construct, function() {
				this.module(name, initial, data);
			});

			return this;
		}
	},['tie']);

	
	core.applications.extend({
		/*
		Creates new application
		*/
		create: function(name, data, initial) {
			("function"===typeof data || "object"===typeof initial)&&(initial=[data,data=initial][0]);

			this.__applications.designers[name] = this.__applications.make('appdesigner');

			this.__applications.designers[name].factory = this.__applications.factory(name,function(operands,config) {
				this.operands = operands;
				this.config = extend(this.config||{}, config);
				if ("function"===typeof initial) initial.apply(this, arguments);
			},data||{},['tie','events','modules']);
			return this.__applications.designers[name];
		},
		/*
		Edit existing application
		*/
		edit: function(name, data) {
			return this.__applications.designers[name].extend(data);
		},
		/*
		Create copy of application and execute with selector
		*/
		run: function(name, operand, config) {
			return this.__applications.designers[name].release(operand, config);
		},
		exists: function(name) {
			return ("object"===typeof this.__applications.designers[name]);
		}
	});

	/* API for creating applications */
	core.app = function(name) {
		if (this.applications.exists(name))
		return this.applications.edit.apply(this.applications, arguments);
		else
		return this.applications.create.apply(this.applications, arguments);
	}

	/* API for executing applications */
	core.fn.app = function(name, config) {
		return core.applications.run(name, this, config);
	}
})(core,mix,clone);


	window.brahma = window.Brahma = core;
