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

!(function(window) { 
	
	var currentQuerySelector = ("function"===typeof Sizzle) ? Sizzle : document.querySelectorAll;
	window.Brahma = window.brahma = function(subject) { 
		if (this === window) {
	// OnAir   
	var air = new window.Brahma();
	
	var callback = false;
	var extensionName = false;
	var option3 = false;
	switch (arguments.length) {
		case 1:
			var selector = arguments[0];
			var options = {};
			switch(typeof selector) {
				case "function":
					/*
						Если передана функция, то мы должны выполнить её после готовности документа
					*/
					if (Brahma.document.ready) {
						selector.call(this);
					} else {
						Brahma.bind('domReady', selector, true);
					}
					
					return Brahma(window);
				break;
				default:
					var elements = Brahma.nodeQuery.call(this, selector);
				break;
			}
		break;
		case 0:
			var selector = '';
			var options = {};
			var elements = Brahma.nodeQuery.call(this, selector);
		break;
	}
	
	/*
		Safari ведет себя очень странно, querySelectorAll возвращает функцию со свойствами, вместо массива, поэтому нам необходимо тестировать и
		на тип "function".
	*/
	if ( ("object"===typeof elements || "function"===typeof elements) && elements.length) {
		
		for (var index=0;index<elements.length;index++) {
			air[index] = elements[index];
		}
	};
	
	if (index>1) air.context = document;
	else if (index>0) air.context = elements[0].parentNode;
	else air.context = null;
	air.length = index;
	air.selector = selector;
	
	return air;
}
	};

	Brahma.core = window.Brahma.prototype = {
		constructor: window.Brahma
	};

	Brahma.core.version = '2.0';
	Brahma.core.brahma = true;
	/* Информация о документе */
	Brahma.document = {
		ready: false
	};

	// Brahma queries
	/*
Приводит любую переменную к массиву.
Отлично понимает массив Brahma объекты и jQuery объекты.
Для объектов неопределнного типа идет простой перебор свойств (не включая прототипные свойства)
Если же subject не объект, то он будет включен как элемент массива.
*/
window.Brahma.bench = function(subject, args, tieback) {
	
	var  elements = [];
	if ("object" === typeof subject) {
		if (subject instanceof Array || subject instanceof Brahma || (jQuery && subject instanceof jQuery)) {
			for(var i=0;i<subject.length;i++) {
				elements.push(subject[i]);
			}
		} else {
			for (var i in subject) {
				if (subject.hasOwnProperty(i)) {
					elements[i] = subject[i]; 
				}
			}
		};
	} else {
		elements = [subject];
	}
	
	return tieback.call(subject, elements, args);
};
	
window.Brahma.nodeQuery = window.Brahma.core.nodeQuery = function(query, root) {
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

				try {
					if (patch) console.log('QUERY', prefix+query);
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
};

	// Brahma api
	/** 
@method clone
Создает копию объекта, возвращая её.
*/
Brahma.clone = function(prototype) {
	var clone = {};
	for (var prop in prototype) {
		if (!prototype.hasOwnProperty(prop)) continue;
		if (prototype[prop]==null || "object"!=typeof prototype[prop]) {
			clone[prop] = prototype[prop];
		} else {
			clone[prop] = Brahma.clone(prototype[prop]);
		}
	}
	return clone;
}
/**
@method extend
Объеденяет два объекта
*/
Brahma.extend = function() {
	
	var target = arguments[0], proto = arguments[1];
	var recrusive = (arguments.length>2) ? arguments[2] : false;

	
	for (var i in proto) {
		switch ( typeof proto[i] ) {
			case 'undefined':
			case 'null':
				target[i] = null;
			break;
			case 'object': 
				if (!proto.hasOwnProperty(i)) break;
				if (proto[i] instanceof Array) {
					target[i] = [];
					
					Brahma.extend(target[i],proto[i]);
				} else {
					
					if (recrusive) {
						if ("object"!==typeof target[i]) target[i] = {};
						Brahma.exetnd(target[i], proto[i]);
					}
					else {
						target[i] = {};
						for (var ii in proto[i]) {
							target[i][ii] = proto[i][ii];
						};
					}
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
/*
Перехват ошибки
*/

Brahma.die= function(a) {
	throw "Dharma error: "+(a||'unknown error');
};


	/* Классы и прототипы */
	(Brahma.classes = {}) && (Brahma.classes.module = {
		proto: (function() {
	var proto = {};
	proto.prototype = {
		modules : {},
		createModule : function() {
			var name, internals;
			("string"===typeof arguments[0]) ? (name=arguments[0],internals=arguments[1]||[]) : (name=false,internals=arguments[0]||[]);
			console.log('create module', name, internals);
			var constructor = function() {};
			if (!Object.create) {
				
				constructor.prototype = Brahma.clone(Brahma.classes.module.proto);
			} else {
				
				constructor.prototype = Object.create(Brahma.classes.module.proto.prototype);
				constructor.prototype.constructor = constructor;
			}
			var module = new constructor();
			module.master = this;
			if (name) this.modules[name] = module;
			/* Каждый модуль может быть снабжден расширениями */
			if (internals instanceof Array) {
				for (var i = 0;i<internals.length;i++) {
					if ("object"!==typeof Brahma.classes.module.internals[internals[i]]) return Brahma.error('There in no internal `'+internals[i]+'`');

					Brahma.extend(module, Brahma.classes.module.internals[internals[i]].proto);

					if ("function"==typeof Brahma.classes.module.internals[internals[i]].initial) Brahma.classes.module.internals[internals[i]].initial.call(this.modules[name]);
				}
			}
			return module;
		},
		/* Расширет модуль */
		assing : function(dist) {
			Brahma.extend(this, dist);
			return this;
		}
	};
	return proto;
})()
,
		internals: {
	'tie': {
		proto: {
			tie: function(cb) {
				cb.apply(this, arguments);
				return this;
			}
		}
	},
	// Расширение позволяющее встраивать в модуль фабрики
	'fabrics': {
		proto: {
			fabrics: {},
			/**
			@method addFabric
			Модули способны содержать фабрики. Фабрики модулей вызываются с помощью функции create(fabricName, internals, proto) 
			Т.е. фабрику, вместе со всеми настройками расширений можно задать заранее, но создать объект по этой схеме можно будет позже.
			*/
			addFabric : function(name, internals, constructor) {
				this.fabrics[name] = {
					constructor: constructor,
					internals: internals
				};
				return this;
			},
			/**
			@method create
			Процес создание модуля фабрикой идентичен с процессом создания модуля модулем
			*/
			create: function(fabricName, options) {

				var constructor = this.fabrics[fabricName].constructor;
				constructor.prototype = Brahma.classes.module.proto;


				/* Каждый модуль может быть снабжден расширениями */
				var internals = this.fabrics[fabricName].internals;
				
				//if (internals.indexOf('modular')) internals.push('modular');
				if (internals instanceof Array) {
					for (var i = 0;i<internals.length;i++) {
						if ("object"!==typeof Brahma.classes.module.internals[internals[i]]) return Brahma.die('There in no internal `'+internals[i]+'`');

						Brahma.extend(constructor.prototype, Brahma.classes.module.internals[internals[i]].proto);

						if ("function"==typeof Brahma.classes.module.internals[internals[i]].initial) Brahma.classes.module.internals[internals[i]].initial.call(module);
					}
				}
				Brahma.extend(constructor.prototype, options);
				constructor.prototype.master = this;
				constructor.prototype.constructor = constructor;

				var module = new constructor();
				module.master = this;

				return module;
			}
		}
	},
	// Позволяет создавать для модуля интерфейс. Интерйфейсые функции вызываются через свойство interface (Module.interface.go())
	// Такой подход позволяет отличать пользовательские функции и внутренние
	// Предлагаю убрать это расширение
	'interface': {
		proto: {
			interface: {},
			setInterface : function(data) {
				this.interface = {};
				var that = this;
				for (var i in data) {
					(function(name, f) {
						if ("function"===typeof f)
						that.interface[name] = function() { return f.apply(that, arguments); }
					})(i, data[i]['function']);					
				}
				return this;
			}
		}
	},
	// VISUAL. Открывает функцию и свойство visual, и метод initVisualApi 
	'visual': {
		proto: {
			createVisual: function(constructor) {
				var proto = {
					dom: {},
					objects: {}
				}
				if ("function"===typeof constructor) {
					var construct = constructor;
					construct.prototype = proto;
					construct.prototype.module = this;
					construct.prototype.constructor = constructor;

					this.visual = new construct(this);
				} else {
					this.visual = Brahma.extend(proto, constructor);
				}
				this.visual.module = this;
			}
		}
	},
	/* Добавляет поддержку событий */
	'events': {
		proto: {
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

				if (typeof this.eventListners[e] == 'object' && this.eventListners[e].length>0) {
					var todelete = [];
					for (var i = 0; i<this.eventListners[e].length; i++) {
						if (typeof this.eventListners[e][i] == 'object') {
							if (typeof this.eventListners[e][i].callback == "function") response = this.eventListners[e][i].callback.apply(this, args);
							if (this.eventListners[e][i].once) {
								todelete.push(i);
							};
						};
					};
					
					if (todelete.length>0) for (var i in todelete) {
						this.eventListners[e].splice(todelete[i], 1);
					};
				};
				return response;
			}
		}
	},
	/* 
	Определнные методы можно вынести в контроллер, что делает их глабальными и доступными из объейта window
	*/
	'controller': {
		proto: {
			controller : {},
			// Create controller
			createController : function(a, b, c) {
				var globalName, initial, data;
				(arguments.length>2) && (globalName=a,initial=b,data=c);
				(arguments.length==2) && (globalName=false,initial=a,data=b);
				(arguments.length==1) && (globalName=false,initial=false,data=a);

				if ("object"==typeof initial||typeof data=="function") {
					var x=initial;initial=data,data=x; // Switch data and initial
				};

				this.controller = Brahma.module(data||{}); 
				this.controller.master = this;
				
				if (typeof initial === "function") initial.call(this.controller);

				if (globalName) {
					if ("object"!=typeof window.controllers) window.controllers = {};
					window.controllers[globalName] = this.controller;
				}
				return this.controller;
			}
		}
	}
}
	});

	/*
	Расширяем internals.events сами на себя, т.к. сам объект Brahma должен поддерживать события
	*/
	Brahma.extend(Brahma, Brahma.classes.module.internals.events.proto);

	/*
	Индустрия Brahma позволяет создавать анонимные модули.
	*/
	Brahma.industry = (function() {
		var constructor = function() {};
		if (!Object.create) {
			
			constructor.prototype = Brahma.clone(Brahma.classes.module.proto);
		} else {
			
			constructor.prototype = Object.create(Brahma.classes.module.proto.prototype);
			constructor.prototype.constructor = constructor;
		}
		var module = new constructor();
		return module;
	})(Brahma);

	/* Инициализируем приложения */
	Brahma.apps = Brahma.industry.createModule(['fabrics']);
	
	/**
	@method application
	Возвращает приложение, создает приложение или дополняет приложение.
	Если приложения не существует, функция однозначно создает приложение. Если селектор не передан и функция существует, то функция дополняет приложение объектом из второго аргумента.
	Если передан селектор, то приложение запускается через метод execute().
	*/
	/* Создаем фабрику приложений */
Brahma.apps.addFabric('default', ['events','tie'], function() {
	
});
Brahma.app = Brahma.application = Brahma.core.app = Brahma.core.application = function(widgetName) {
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
					if (typeof Brahma.apps.modules[copy] != 'undefined') {
						$data = Brahma.extend({}, Brahma.apps.modules[copy]);
					} else {
						$data = {};
					};
					if (arguments.length>2 && typeof arguments[2] == 'object') {
						$data = Brahma.extend($data, arguments[2]);
					};						
				break;
			}
			
		} else {
			$data = {};
		};

		// > return component protptype if exists
		if (name && typeof Brahma.apps.modules[name] != 'undefined') return Brahma.extend(Brahma.apps.modules[name], $data);

		// merge with $data and make it Brahma module
		var component = Brahma.apps.create('default', $data);
		/*
		Этот момент нужно ещё протестировать, но нам нужно дополнительно дописать конфигурацию, потому что это протестировано.
		*/
		if (typeof $data.config === 'object') component.config = Brahma.extend(component.config, $data.config);

		Brahma.apps.modules[name] = component;
		
		if (!name) return this;
		else return Brahma.apps.modules[name];
	} else {

		// > Test for plugin exists
		if (typeof Brahma.apps.modules[arguments[0]] != 'object') {
			throw('Brahma: require `'+arguments[0]+'` application. Visit '+Brahma.info.homesite+' to download it.');
		}

		// > We can give options to life elemnt
		var options = arguments.length>1 && typeof arguments[1] == 'object' ? arguments[1] : {}; 

		var constructor = function() {
		};
		
		constructor.prototype = Brahma.apps.modules[arguments[0]];
		constructor.prototype.constructor = constructor;
		var plug = new constructor();
		plug.config = Brahma.extend(plug.config, options, true);

		plug.scope = plug.selector = this;
		
		plug.classname = arguments[0];
		
		// > ! Append life variable to element
		Brahma(this)[0].component = plug;		
		
		// > inside tie function
		if (typeof arguments[2] == "function") {
			arguments[2].apply(plug);
		};

		if ("function"===typeof plug.run) var result = plug.run();
		if (typeof result === 'undefined') return plug;
		else return result;
	}
}
/* Выполняет приложение без передачи каких либо данных в качестве scope. Аналогично конструкции Brahma(window).app(appName) */
Brahma.run = function(appName) {
	return Brahma(window).app(appName);
}

	
Brahma.core.html = function(html) {
	if ("undefined"===typeof html) {
		if (this.length<=0) return null;
		return this[0].innerHTML;
	}
	else
	return Brahma.bench(this, arguments, function(elem, arguments) {
		for (var q = 0;q<elem.length;q++) {
			elem[q].innerHTML = html;
		}
		return this;
	});
};

Brahma.core.empty = function() {
	return Brahma.bench(this, arguments, function(elem) {
		for (var q = 0;q<elem.length;q++) {
			elem[q].innerHTML = '';
		}
		return this;
	});
};

Brahma.core.parent = function() {

	return Brahma.bench(this, arguments, function(elem) {

		if (elem.length>0) return Brahma(elem[0].parentNode);
		else return null;
	});
};

Brahma.core.createNode = function(nodeName, attrs) {
	var attrs = attrs||{};
	try {
		var newElement = document.createElement(nodeName);
	} catch(e) {
		Brahma.die('Not a valid name tag name `'+nodeName+'`('+nodeName.length+')');
	}
	this[0].appendChild(newElement);
	for (var name in attrs) {
		if (attrs.hasOwnProperty(name)) {
			newElement.setAttribute(name, attrs[name]);
		}
	}
	return Brahma([newElement]);
}

Brahma.core.each = Brahma.each = function() {
	var subject, callback;
	(this instanceof Brahma) ? (subject = this, callback = arguments[0]||false) : (subject=arguments[0],callback=arguments[1]);
	
	Brahma.bench(subject, [callback], function(elements, args) {
		
		var callback = ("function"===typeof args[0]) ? args[0] : false;
		for (var index = 0;index<elements.length;index++) {
			
			if (callback) callback.call(elements[index], elements[index], index);
		}
	});
}

Brahma.core.put = function() {
	var kit = [];

	Brahma.bench(this, arguments, function(elem, args) {
		Brahma(elem).each(function(element) {
			switch(typeof args[0]) {
				case "object":
					var newElement = args[0];
					element.appendChild(newElement);
					kit.push(newElement);
				break;
				case "string":
					var nodeName = args[0].trim().toUpperCase();
					var attrs = args[1]||{};
					var newElement = Brahma(element).createNode(nodeName, attrs)[0];
					kit.push(newElement);
				break;
			};
		});
	});
	return Brahma(kit);
};

Brahma.core.and = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		if (elem.length>0) {
			var parent = Brahma(elem[0].parentNode);
			return parent.put.apply(parent, args);
		} else {
			return null;
		}
	});
};

Brahma.core.wrapAll = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		var wrap = Brahma(elem[0].parentNode);
		var node = wrap.createNode.apply(wrap, args);
		for (var i=0;i<elem.length;i++) {
			Brahma(node).put(elem[i]);
		}

		return node;
	});
}

Brahma.core.find = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		var kit = [];
		Brahma.each(elem, function() {
			
			var founds = window.Brahma.nodeQuery(args[0], this);

			if (founds.length) for (var i=0;i<founds.length;i++) {
				kit.push(founds[i]);
			};
		});
		
		return Brahma(kit);
	});
}


Brahma.core.tie = function(cb) {
	cb.call(this);
	return this;
}

Brahma.addEvent = function(elem, type, eventHandle) {
    if (elem == null || typeof(elem) == 'undefined') return;
    if ( elem.addEventListener ) {

        elem.addEventListener( type, eventHandle, false );
    } else if ( elem.attachEvent ) {
        elem.attachEvent( "on" + type, eventHandle );
    } else {
        elem["on"+type]=eventHandle;
    }
};

Brahma.core.bind = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		for (var i=0;i<elem.length;i++) {
		   	Brahma.addEvent(elem[0], args[0], args[1]);
		}
		return this;
	});
}

Brahma.core.addClass = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		var stylename = args[0];
		for (var i=0;i<elem.length;i++) {
			var st = elem[i].className.split(' ');
			(st.indexOf(stylename)<0) && (st.push(stylename), elem[i].className = st.join(' '));
		}
		return this;
	});
}

Brahma.core.removeClass = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		var stylename = args[0];
		for (var i=0;i<elem.length;i++) {
			var st = elem[i].className.split(' ');
			var index = st.indexOf(stylename);
			if (index>-1) {
				st.splice(index, 1);
				elem[i].className = st.join(' ');
			};
		}
		return this;
	});
}

Brahma.core.hasClass = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		var stylename = args[0];
		for (var i=0;i<elem.length;i++) {
			var st = elem[i].className.split(' ');
			var index = st.indexOf(stylename);
			if (index>-1) return true;
		}
		return false;
	});
}


Brahma.core.css = function() {
	var elem;
	return Brahma.bench(this, arguments, function(elem, args) {
		var data, polymorph=[];
		("object"===typeof args[0]&&args[0] instanceof Array) ? (polymorph=args[0],data=args[1]):(data=args[0]);
		
		if (args.length>0) {
			switch(typeof data) {
				case 'object':
					Brahma(elem).each(function() {
						for (var i in data) {
							if (polymorph.length!==0) for (var p = 0;p<polymorph.length;p++)
							this.style[polymorph[p]+i] = data[i];
							this.style[i] = data[i];
						};	
					});
				break;
				case "string":
					if (args.length>1) {
						Brahma(elem).each(function() {	
							if (polymorph.length!==0) for (var p = 0;p<polymorph.length;p++)						
							this.style[polymorph[p]+data] = args[1];
						});
						return this;
					} else {
						return elem[0].style[data];
					}
				break;
				default:
					return elem[0].style;
				break;
			};
			return Brahma(elem);
		} else {
			return elem[0].style;
		};
		return Brahma(elem);
	});
};

Brahma.core.data = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		for (var i = 0;i<elem.length;i++) {
			if (args.length>1) {
				if (Brahma.caniuse('dataset'))
				elem[i].dataset[args[0]] = args[1];
				else elem[i].setAttribute("data-"+args[0], args[1]);
			} else {
				if (Brahma.caniuse('dataset'))
				return ("undefined"!==typeof elem[i].dataset[args[0]]) ? elem[i].dataset[args[0]] : null;
				else
				return elem[i].getAttribute("data-"+args[0]);
			}
		};
		return this;
	});
}

Brahma.core.attr = function() {
	var elem;
	return Brahma.bench(this, arguments, function(elem, args) {
		
		if (args.length>0) {
			switch(typeof args[0]) {
				case 'object':
					Brahma(elem).each(function() {
						for (var i in args[0]) {
							this.setAttribute(i, args[0][i]);
						};	
					});
				break;
				case "string":
					if (args.length>1) {
						Brahma(elem).each(function() {							
							this.setAttribute(args[0], args[1]);
						});
						return this;
					} else {
						return elem[0].getAttribute(args[0]);
					}
				break;
				default:
					return elem[0].attributes;
				break;
			};
			return Brahma(elem);
		} else {
			return elem[0].attributes;
		};
		return Brahma(elem);
	});
};

Brahma.core.scroll = function() {
	var doc = document.documentElement;
	var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
	var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
	return {left: left, top: top};
};

	Brahma.caniuse = function(test) {
	console.log('Brahma.caniuse.info[test]', Brahma.caniuse.info[test]);
	if ("function"===typeof Brahma.caniuse.info[test]) Brahma.caniuse.info[test] = Brahma.caniuse.info[test]();
	if (Brahma.caniuse.info[test]) return Brahma.caniuse.info[test]; else return false;
};
Brahma.caniuse.info = {
	"dataset": (typeof document.createElement('div').dataset !== "undefined"),
	"translate3D": function() {
		console.log('test 3D'); 
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
}; 

	/*
	Перехватываем глобальные события, такие как готовность документа
	*/
	/*!
 * contentloaded.js
 *
 * Author: Diego Perini (diego.perini at gmail.com)
 * Summary: cross-browser wrapper for DOMContentLoaded
 * Updated: 20101020
 * License: MIT
 * Version: 1.2
 *
 * URL:
 * http://javascript.nwbox.com/ContentLoaded/
 * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
 *
 */
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
	
	Brahma.document.ready = true;
	Brahma.trigger('domReady');
});

})(window);