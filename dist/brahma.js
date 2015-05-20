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
;(function() {
	var BrahmaStudioFactory; // Инициализируем факторию для использования внутри её же конструктора

	var BrahmaStudioFactory = function(userConfig) {
		/* Конфигурируем производство бибилиотеки */
		var factoryConfig = {
		};
		if ("object"===typeof  userConfig) for (var i in userConfig) {
			if (userConfig.hasOwnProperty(i)) {
				factoryConfig[i] = userConfig[i];
			}
		};
		/*
			Инициализируем новую переменную
		*/
		var Brahma = null;
		/*
			Мы можем поддерживать Sizzle, если он присутсвует в глобальном контексте. Его можно подключить отдельно или вместе с Jquery.
			Глобальная в scope переменная носит числовое значение, как маркер, где:
			0 : использовать querySelectorAll
			1 : использовать Sizzle

			Данная переменная проверяется в функции Brahma.nodeQuery
		*/
		var currentQuerySelector = ("function"===typeof Sizzle) ? 1 : 0;

		/*
			Создаем конструктор
		*/
		Brahma = function(subject) { 
			if (this === window) {
	// OnAir   
	var air = new Brahma();
	
	var callback = false;
	var extensionName = false;
	var option3 = false;
	switch (arguments.length) {
		
		case 1:
			var selector = arguments[0];
			var options = {};
			switch(typeof selector) {
				case "function":
					selector.call(this,Brahma);
					
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
	} else {
		index = 0;
	}
	
	if (index>1) air.context = document;
	else if (index>0) air.context = elements[0].parentNode;
	else air.context = null;
	air.length = index;
	air.selector = selector;
	
	return air;
}
		};

		/*
			Инструмент для создания ссылок на объекты
		*/
		/*
В идеале это должно быть в прототипе, но подобная модификация вызывает проблемы совместимости с библиотеками, не проверяющими hasOwnProperty
Object.prototype.ref = function() {
	function Ref() {};
	Ref.prototype = this;
	Ref.prototype.constructor = Ref;
	return new Ref;
};

Функция создает объект, ссылающийся на другой. Соль в том, что ссылка будет происходить через прототип, а сам конструктор объекта будет типа Ref.
	Это позволит его отличать от обычной ссылки на объект при клонировании.
*/

Brahma.ref = function(proto) {
	function Ref() {};
	Ref.prototype = proto||this;
	Ref.prototype.constructor = Ref;
	return new Ref;
};

		/*
			И прототип
		*/
		Brahma.vector = Brahma.prototype = {
			constructor: Brahma
		};

		/*
			Указываем версию
		*/
		Brahma.vector.version = '1.4.2';
		/*
			Над необходимо иметь данное свойство, что бы уметь отличать объекты Brahma от прочих
		*/
		Brahma.vector.brahma = true;
		/*
			Свойство document содержит информацию о текущем html-документе
			@ready : полностью ли загружен документ
		*/
		Brahma.document = {
			ready: false
		};

		/* Macros */
		Brahma.macros = {};
		Brahma.macros.dom = {};

/* 
Проверяет subject HTMLElement на соответствие псевдоuqery 
:visible проверка на видимости элемента (не проверяет фактор видимости в зависимости от расположения элемента )
:seeable временно не поддержвается!!!
*/
Brahma.macros.dom.pseusoQueryMatch = function(subject,pqs) {
	switch(pqs) {
		case 'visible':
			return  (function(cstyle) {
				return !(cstyle.display==="none" || cstyle.visibility==="hidden" || parseInt(cstyle.opacity)===0);
			})(window.getComputedStyle(subject));
		break;

	}
};

/*
Возвращает margin элемента в пикселях, даже если оно указано в процентах.
*/
Brahma.macros.dom.pixelizeMargin = function(subject, direction) {
	direction=direction.toLowerCase();

	var ml = window.getComputedStyle(subject)['margin'+String(direction.charAt(0)).toUpperCase()+direction.substr(1)];
	return Brahma.pixelize(ml, (direction==='left'||direction==='right')?subject.parentNode.clientWidth:subject.parentNode.clientHeight);
};

		/*
			Функционал обработки селекторов
		*/
		/*
Приводит любую переменную к массиву.
Отлично понимает массив Brahma объекты и jQuery объекты.
Для объектов неопределнного типа идет простой перебор свойств (не включая прототипные свойства)
Если же subject не объект, то он будет включен как элемент массива.
*/
Brahma.bench = function(subject, args, tieback) {
	
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
	
Brahma.nodeQuery = Brahma.vector.nodeQuery = function(query, root) {
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
				
				if (currentQuerySelector===0) {
					// Нативный селектор
					try {
						return root.querySelectorAll(prefix+query);
					} catch(e) {
						console.log('Brahma: querySelectorAll not support query: '+query)
					}
				} else if (currentQuerySelector===1) {
					// Sizzle
					return Sizzle(query, root);
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

		/*
			Базовый API
		*/
		/**
@method camelCase
convert dashed string to camel case style string

*/
Brahma.camelize = function(text) {
	return text.replace(/-([\da-z])/gi, function( all, letter ) {
		return letter.toUpperCase();
	});
};
/**
@method hyphens
convert camel case to dashed string

*/
Brahma.dasherize = function(text) {
	return text.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

/**
@method millisify
convert s of ms to integer (ms)
millisify("0.5s") = 500
millisify("1ms") = 1
*/
Brahma.millisify = function(sms) {
	(sms.charAt(0)==='.')?(d=10,sms=sms.substr(1)):(d=1);
    if (sms.substr(-2)==='ms') return parseFloat(sms)/d;
    if (sms.substr(-1)==='s') return parseFloat(sms)*1000/d;
    if (sms.substr(-1)==='h') return parseFloat(sms)*60000/d;
    return parseFloat(sms)/d;
};

/* 
Возвращает величину в пикселях, получая число % или px 
@param value число
@param quantity контекстная величина в пикселях
*/
Brahma.pixelize = function(value, quantity) {
	if ("string" == typeof value) {
		if (value.substr(-1)==='%') {
			return ((quantity/100)* (value.substring(0, value.length-1)));
		} else {
			return parseInt(value.split('px').join(''));
		}
	} else {
		return value;
	}
	
	return parseInt(value);
};

/**
	Функция создает объект, ссылающийся на другой. Соль в том, что ссылка будет происходить через прототип, а сам конструктор объекта будет типа Ref.
	Это позволит его отличать от обычной ссылки на объект при клонировании.
*/
Brahma.ref = function(proto) {
	function Ref() {};
	Ref.prototype = proto;
	var test = new Ref;
	return test;
};

/**
@method copyProps
Копирует все свойства объекта
*/
Brahma.copyProps = function(target, source) {
	for (var prop in source) {
		if (source.hasOwnProperty(prop)) target[prop] = source[prop];
	}
	return target;
};

/**
@method inherit
Копирует объект по максимальной глубине (функции и plane объекты остаются в прототипы, объекты клонируются)
Поверх размещает extend, который, как правило, должен содержат только свойства
*/
Brahma.inherit = function(proto, extend) {
	var o = Object.create(proto);
	for (var prop in proto) {
		if (proto.hasOwnProperty(prop)&&null!==proto[prop]&&"object"===typeof proto[prop]) {
			/* Отслеживаем псевдо-ссылку */
			if (proto[prop].constructor.name!=='Ref') {
				o[prop] = Brahma.clone(proto[prop]);
			}
			else {
				o[prop] = proto[prop];
			}
		}
	}
	if (extend) o = Brahma.copyProps(o, extend);
	return o;
}

/** 
@method clone
Создает копию объекта, возвращая её.
*/
Brahma.clone = function(prototype) {
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
			clone[prop] = Brahma.clone(prototype[prop]);
		}
	};

	return clone;
};
/**
@method extend
Объеденяет два объекта
*/
Brahma.extend = function() {
	
	var target = arguments[0], proto = arguments[1];
	var recrusive = (arguments.length>2) ? arguments[2] : false;

	
	for (var i in proto) {
		if (!proto.hasOwnProperty(i)) break;
		switch ( typeof proto[i] ) {
			case 'undefined':
			case 'null':
				target[i] = null;
			break;
			case 'object': 
				
				if (proto[i] instanceof Array) {
					target[i] = [];
					
					Brahma.extend(target[i],proto[i]);
				} else {
					
					if (recrusive) {
						if ("object"!==typeof target[i]) target[i] = {};
						Brahma.extend(target[i], proto[i]);
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


/* Полифил для requestAnimationFrame */
(function() {
	var vendors = ['ms', 'moz', 'webkit', 'o'],customRequestAnimationFrame=window.requestAnimationFrame,customCancelAnimationFrame=window.cancelAnimationFrame;
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	   customRequestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
	   customCancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
	                               || window[vendors[x]+'CancelRequestAnimationFrame'];
	};
	Brahma.frame = function() {
		customRequestAnimationFrame.apply(window, arguments);
	};
})();


/*
Парсит строку деклараций в ситаксисе разметки CSS
Brahma.parseCssDeclarations("background-color:red"); // {"background-color": "red"}
*/
Brahma.parseCssDeclarations = function(cssDeclarations) {
	if (typeof cssDeclarations != "string") return {};
	var cssDeclarations = cssDeclarations.split("\n").join('').split("\t").join('');
	if (cssDeclarations.length<1) return {};
	var cssDeclarations = cssDeclarations.split(';')
	var options = {};
	for (var o in cssDeclarations) {
		if (!cssDeclarations.hasOwnProperty(o)) continue;
		
		var op = (function(s){return "string"===typeof s ? s.trim() : s;})(cssDeclarations[o]).split(':');
		
		if (op[0].length===0) continue;
		options[op[0]] = (op[1]==='true'||op[1]==='false') ? (op[1]==="true"?true:false) : op[1];
	};

	return options;
};

/*
Brahma.fao([a,[b,[c]]])
Принимает произвольное количестве аргументов, но возвращает массив, где первый аргумент - функция, второй - массив, третий - объект;
*/
Brahma.fao = function() {
	initial=null,internals=null,proto=null;
	for (var i=0;i<arguments.length;i++)
	{
		if ("function"===typeof arguments[i]) initial=arguments[i];
		if ("object"===typeof arguments[i])
		{
			if (arguments[i] instanceof Array) internals=arguments[i];
			else proto=arguments[i];
		}
	};
	return [initial,internals,proto];
};

/*
Перехват ошибки
*/
Brahma.die = function(a) {
	throw "Dharma error: "+(a||'unknown error');
};

		

		/**
			## Классы
			Brahma поддерживает возможность работы с большим количеством встроенных классов.

			На данный момент поддерживается только module. Module - это универстальный прототип компонента, он может модифицироваться расширениями. Сам класс модуля содержится в ключе Brahma.classes.module.proto. Расширения располагаются в Brahma.classes.module.internals.

			Конструктор модуля Brahma.classes.module.constructor должен быть вызван в контекте какого либо объекта. Он принимает два аргумента имя модуля и расширения. 
			```
			Brahma.classes.module.constructor(name, internals)
			```
			Имя модуля может быть не указано. Конструктор возвращает новый объект.
			Новый объект имеет свойство master, которое ссылается на контекст, а так же добавляет в контекст в свойство modules ссылку на вновь созданный объект, если было указано имя.
		*/
		(Brahma.classes = {}) && (Brahma.classes.module = {
			constructor: function() {
	var name, internals;
	("string"===typeof arguments[0]) ? (name=arguments[0],internals=arguments[1]||[]) : (name=false,internals=arguments[0]||[]);
	
	var module = Brahma.inherit(Brahma.classes.module.proto);
	module.master = Brahma.ref(this);
	
	//if (name) this.modules[name] = module;
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
			proto: (function() {
	var proto = {};
	proto.prototype = {
		modules : {},
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
			modules: {},
			/**
			@method fabric
			Модули способны содержать фабрики. Фабрики модулей вызываются с помощью функции create(fabricName, internals, proto) 
			Т.е. фабрику, вместе со всеми настройками расширений можно задать заранее, но создать объект по этой схеме можно будет позже.
			*/
			fabric : function(name, internals, constructor, proto) {
				
				this.fabrics[name] = {
					constructor: constructor||function(){},
					internals: internals,
					proto: proto||{}
				};

				return this;
			},
			/**
			@method create
			Процес создание модуля фабрикой идентичен с процессом создания модуля модулем
			*/
			create: function(fabricName, extend, args) {
				
				if (typeof extend === "function")  {
					extend = Object(extend);
					var prototype = Brahma.industry.make('module', this.fabrics[fabricName].internals, this.fabrics[fabricName].proto);
					if ("object"!==typeof extend.prototype) extend.prototype = prototype;
					else Brahma.extend(extend.prototype, prototype);
					var proto = function() {

					};
					proto.prototype = extend.prototype;
					
					var module = new proto;
					extend.apply(module, args);
				} else {
					var module = Brahma.industry.make('module', this.fabrics[fabricName].internals, this.fabrics[fabricName].proto);
					Brahma.copyProps(module, extend);
				}
				
				module.master = Brahma.ref(this);
				
				this.fabrics[fabricName].constructor.apply(module, args||[]);
				return module;
			},
			/* Модуль устроен так, что его инициализация происходит только при его первом вызове, это исключает случай инициализации модуля в прототипе */
			module: function(globalName) {
				var 
				initial=("function"===typeof arguments[2]) ? arguments[2] : ("function"===typeof arguments[1] ? arguments[1] : false),
				data=("object"===typeof arguments[1]) ? arguments[1] : ("object"===typeof arguments[2] ? arguments[2] : false);

				if (data||initial) {
					// Создаем фабрику
					this.fabric(globalName, ['events','fabrics'], initial, data||{});
					return this;
				} else {
					if ("undefined"===typeof this.modules[globalName]) {
						this.modules[globalName] = this.create(globalName);
					}
				}
				return this.modules[globalName];
			},
			/*
			Функция make позволяет произвести сложный объект.
			В качестве первого аргумента передаются расширения будущего объекта.
			Второй и третий аргумент может быть функция и объект (их можно менять местами).
			Объект расширит будущий объект своими свойствами и методами в прототипе.
			Функция станет конструктором, а так её прототип будет наследован.
			*/
			make : function(internals) {
				'use strict';
				var 
				initial=("function"===typeof arguments[2]) ? arguments[2] : ("function"===typeof arguments[1] ? arguments[1] : function(){}),
				data=("object"===typeof arguments[1]) ? arguments[1] : ("object"===typeof arguments[2] ? arguments[2] : {}),
				i,prop,construct,radical;

				var construct = function() {};
				construct.prototype = {
					constructor: construct
				};
				/*
				Расширяем протоип функциями из internals
				*/
				for (i=0;i<internals.length;i++) {
					if (Brahma.classes.module.internals[internals[i]]) {
						for (prop in Brahma.classes.module.internals[internals[i]]) {
							if (Brahma.classes.module.internals[internals[i]].hasOwnProperty(prop)) {
								if ("function"===typeof Brahma.classes.module.internals[internals[i]][prop]) {
									construct.prototype[prop] = Object(Brahma.classes.module.internals[internals[i]][prop]);
								}
							}
						}
					}
				}

				/*
				Расширяем прототип функциями из data
				*/
				for (prop in data) {
					if (data.hasOwnProperty(prop)) {
						if ("function"===typeof data[prop]) {
							construct.prototype[prop] = Object(data[prop]);
						}
					}
				}

				/*
				Расширяем прототип прототипом initial
				*/
				if ("object"===typeof initial.prototype) {
					for (prop in initial.prototype) {
						if (initial.prototype.hasOwnProperty(prop)) {							
							construct.prototype[prop] = initial.prototype[prop];
						}
					}
				}

				/*
				Создаем объект
				*/
				radical=new construct();

				/*
				Расширяем радикал свойствами из internals
				*/
				for (i=0;i<internals.length;i++) {
					if (Brahma.classes.module.internals[internals[i]]) {
						for (prop in Brahma.classes.module.internals[internals[i]]) {
							if (Brahma.classes.module.internals[internals[i]].hasOwnProperty(prop)) {
								if ("function"!==typeof Brahma.classes.module.internals[internals[i]][prop]) {
									/* Отслеживаем псевдо-ссылку */
									if ("object"!==typeof Brahma.classes.module.internals[internals[i]][prop] || Brahma.classes.module.internals[internals[i]][prop].constructor.name!=='Ref') {
										radical[prop] = Brahma.clone(Brahma.classes.module.internals[internals[i]][prop]);
									} else {
										radical[prop] = Brahma.classes.module.internals[internals[i]][prop];
									}
								}
							}
						}
					}
				}

				/*
				Расширяем прототип свойствами из data
				*/
				for (prop in data) {
					if (data.hasOwnProperty(prop)) {
						if ("function"!==typeof data[prop]) {
							/* Отслеживаем псевдо-ссылку */
							if ("object"!==typeof data[prop] || data[prop].constructor.name!=='Ref') {
								radical[prop] = Brahma.clone(data[prop]);
							} else {
								radical[prop] = data[prop];
							}
						}
					}
				}

				/*
				Инициализируем
				*/
				initial.apply(radical);
				/*
				Отдаем
				*/
				return radical;
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
				if (typeof this.eventListners[e] != 'object') this.eventListners[e] = [];
				
				this.eventListners[e].push({
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

				if (typeof this.eventListners[e] == 'object' && this.eventListners[e].length>0) {
					var todelete = [];
					for (var i = 0; i<this.eventListners[e].length; i++) {
						if (typeof this.eventListners[e][i] === 'object') {
							if (typeof this.eventListners[e][i].callback === "function") response = this.eventListners[e][i].callback.apply(this, args);
							
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
	},
	/* Позволяет расширять объект */
	'assing': {
		assing: function(extra) {
			Brahma.extend(this, extra, true);
		}
	}
},
		});

		/*
			Расщирения класса Brahma.classes.module содержат весьма полезные функции, такие как поддержка событий.
			Поэтому мы пользуемся имеющимся функционалом для расширения функционала самой Brahma, для того, что бы Brahma
			поддерживал возможность работы с событями bind, trigger.
		*/
		Brahma.extend(Brahma, Brahma.classes.module.internals.events.proto);

		/**
			## Brahma.industry
			Индустрия Brahma позволяет создавать объекты из классов Brahma.
			```
			object Brahma.industry('module', ['events'], {
				foo: 'bar'
			});
			```
		*/
		Brahma.industry = {
			make: function(className, internals, extend) {
				var newObject = Brahma.classes[className].constructor.call(false, internals||[]);

				if ("object"===typeof extend) for (var i in extend){
					if (extend.hasOwnProperty(i)) {
						if ("object"===typeof extend[i]) newObject[i] = Brahma.inherit(extend[i]);
						else newObject[i] = extend[i];
					}
				}
				return newObject;
			}
		}

		/**
			## brahma.applications

			Виджеты в Brahma - это что-то вроде плагинов в jQuery. Они работают с элементами DOM. Вызов их происходит через контекст этого объекта, получаемого через селектор.
			```
			Brahma('body').application('screens');
			```
			В данном случае мы создали объект, содержищий ссылку на BODY. Далее мы вызываем обработчик screens, который будет выполнен, получив объект со ссылкой в переменной this.data.

			Brahma так же поддерживаем передачу в this.data прочих объектов, например массива
			Brahma([1,2,3]).application('screens');
			Однако в большенстве случаев обработики требуют именно объекта Brahma с селектором DOM элементов.

			!Надо обратить внимание, что Brahma.applications - это не массив и не одномерный объект, а фактически модуль, который содержит другие модули. Т.е. 
			*/
		Brahma.applications = Brahma.industry.make('module', ['fabrics']);
		/**
			## Brahma.application()
			Функция application позволяет как создавать, так и управлять и вызывать приложения. Всё зависит от того в каком контексте она вызвана.

			Когда мы вызывает функцию через объект Brahma, мы вызываем конструктор приложения:
			``` 
			Brahma.application('myapplication',{}) // Создаст приложение
			Brahma.application('myapplication', {}) // Модифицирует существующее приложение
			Brahma.application('myapplication') // Возвращает прототип приложения
			```
			Вызов приложения, когда оно нужно, происходит через объект vector, который создается при указаниии первого аргумента функции Brahma.
			```
			Brahma('div#go').application('myapplication'); // Создает экземпляр приложения и выполянет его

			Для удобтва можно указывать краткое имя функции
			Brahma('div#go').app('myapplication');

			При создании экземпляра приложения можно передавать в него конфигурацию
			Brahma('div#go').app('myapplication', {
				duration: 5000
			});
			```
		*/
		Brahma.applications.fabric('default',['events','fabrics','tie'], function() {});

Brahma.applications.execute = function() {
		// > Test for plugin exists
		if (typeof Brahma.applications.modules[arguments[0]] != 'object') {
			throw('Brahma: require `'+arguments[0]+'` application. Please, download it.');
		};

		// > We can give options to life elemnt
		var options = arguments.length>1 && typeof arguments[1] == 'object' ? arguments[1] : {}; 
		
		var plug = Brahma.inherit(Brahma.applications.modules[arguments[0]]);

		plug.config = Brahma.extend(plug.config, options, true);

		/* Import config from data-*appName* */
		;(function(cfg) {
			if (cfg!==null) {
				Brahma.copyProps(plug.config, Brahma.parseCssDeclarations(cfg))
			};
		}).call(this, Brahma(this).data(Brahma.dasherize(arguments[0])));

		/* Import config from data-attributes */
		if ("object"===typeof Brahma.applications.modules[arguments[0]].config) for (var prop in Brahma.applications.modules[arguments[0]].config) {
			if (Brahma.applications.modules[arguments[0]].config.hasOwnProperty(prop)) {
				var hyphenProp = arguments[0]+'-'+Brahma.dasherize(prop);
				if (Brahma(this).data(hyphenProp)!==null) plug.config[prop] = Brahma(this).data(hyphenProp);
			}
		};

		plug.scope = plug.selector = this;
		
		plug.classname = arguments[0];
		
		// > ! Append life variable to element
		if ("object"!==typeof Brahma(this)[0]._brahma) Brahma(this)[0]._brahma = {
			handlers: {}
		};
		Brahma(this)[0]._brahma.handlers[arguments[0]] = plug;		
		
		// > inside tie function
		if (typeof arguments[2] == "function") {
			arguments[2].apply(plug);
		};

		if ("function"===typeof plug.run) var result = plug.run();
		if (typeof result === 'undefined') return plug;
		else return result;
};

Brahma.app = Brahma.application = Brahma.vector.app = Brahma.vector.application = function(applicationName) {
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
					if (typeof Brahma.applications.modules[copy] != 'undefined') {
						$data = Brahma.extend({}, Brahma.applications.modules[copy]);
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
		if (name && typeof Brahma.applications.modules[name] != 'undefined') return Brahma.extend(Brahma.applications.modules[name], $data);

		// merge with $data and make it Brahma module
		var component = Brahma.applications.create('default', $data);
		
		Brahma.applications.modules[name] = component;
		
		if (!name) return this;
		else return Brahma.applications.modules[name];
	} else {
		return Brahma.applications.execute.apply(Brahma(this).first(),arguments);
	}
}
/* Выполняет приложение без передачи каких либо данных в качестве scope. Аналогично конструкции Brahma(window).app(appName) */
Brahma.application.run = function(appName) {
	return Brahma(window).app(appName);
}

/* В отличии от app, метод run вызывает конструктор приложения для каждого элемента в наборе селекторов и возвращает не ссылку на созданный экземпляр приложения, а ссылку на vector */
Brahma.vector.use = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		for (var i=0;i<elem.length;i++) {
			Brahma.applications.execute.apply(elem[i],args);
		};
		return this;
	});
}

/*
Получение приложения обрабатывающего этот элемент по его имени
Если имя не указано возвращает объект со всеми приложениями
*/
Brahma.vector.getApp = function(appName) {
	var ispatch = ("object"===typeof Brahma(this)[0]._brahma);
	if (appName) {
		return ispatch&&Brahma(this)[0]._brahma.handlers[appName] ? Brahma(this)[0]._brahma.handlers[appName] : false;
	} else {
		return ispatch ? Brahma(this)[0]._brahma.handlers : {};
	}
} 
		
		/*
			Возможность быстро создавать модули Brahma.module({});
		*/
		Brahma.applications.fabric('module',['events','tie'], function() {});
/* Функция создает простой модуль */
Brahma.module = function(extend,args) {
	return Brahma.applications.create('module',extend||{},args||[]);
}; 
		/*
			API в стиле jQuery, работа с элементами, создание элементов и пр.
		*/
		
Brahma.vector.html = function(html) {
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

Brahma.vector.empty = function() {
	return Brahma.bench(this, arguments, function(elem) {
		for (var q = 0;q<elem.length;q++) {
			elem[q].innerHTML = '';
		}
		return this;
	});
};

Brahma.vector.remove = function() {
	return Brahma.bench(this, arguments, function(elem) {
		var parent; 
		for (var q = 0;q<elem.length;q++) {
			parent = elem[q].parentNode;
			parent.removeChild(elem[q]);
		}
		return parent;
	});
};

Brahma.vector.hide = function() {
	return Brahma.bench(this, arguments, function(elem) {
		for (var q = 0;q<elem.length;q++) {
			// Save current station
			var currentDisplay = Brahma(elem[q]).css("display");
			if (currentDisplay!=="none") {
				if ("undefined"===typeof elem[q].backupStyle) elem[q].backupStyle = {};
				elem[q].backupStyle.display=currentDisplay;
			};
			Brahma(elem[q]).css("display", "none");
		}
		return Brahma(elem);
	});
};

Brahma.vector.show = function() {
	return Brahma.bench(this, arguments, function(elem) {
		for (var q = 0;q<elem.length;q++) {
			if ("undefined"!==typeof elem[q].backupStyle && elem[q].backupStyle.display) {
				Brahma(elem[q]).css("display", elem[q].backupStyle.display);
			}
			else {
				Brahma(elem[q]).css("display", "");
			};
		}
		return Brahma(elem);
	});
};


Brahma.vector.width = function() { 
	if (this[0]===window) {
		var w = window,
	    d = document,
	    e = d.documentElement,
	    g = d.getElementsByTagName('body')[0];
	    return w.innerWidth || e.clientWidth || g.clientWidth;
	} else {
		return Brahma.bench(this, arguments, function(elem) {
			return elem[0].offsetWidth;
		});
	}
};

Brahma.vector.height = function() { 
	
	if (this[0]===window) {
		var w = window,
	    d = document,
	    e = d.documentElement,
	    g = d.getElementsByTagName('body')[0];
	    return w.innerHeight|| e.clientHeight|| g.clientHeight;
	} else {
		return Brahma.bench(this, arguments, function(elem) {
			return elem[0].offsetHeight;
		});
	}
};

Brahma.vector.outerWidth = function() {
	return Brahma(this[0]).width()+Brahma.macros.dom.pixelizeMargin(this[0],'left')+Brahma.macros.dom.pixelizeMargin(this[0],'right');
};

Brahma.vector.outerHeight = function() {
	return Brahma(this[0]).height()+Brahma.macros.dom.pixelizeMargin(this[0],'top')+Brahma.macros.dom.pixelizeMargin(this[0],'bottom');
};

Brahma.vector.is = function(origq) {
	var subject,test,pqs,qs;
	var nativetest = function(subject) {
		test = subject && ( subject.matches || subject[ 'webkitMatchesSelector' ] || subject[ 'mozMatchesSelector' ] || subject[ 'msMatchesSelector' ] );
		if (!(!!test && test.call( subject, origq ))) return false;
		return true;
	};
	(function(p) { qs=p[0].trim(); pqs=p[1]?p[1].trim():false; })(origq.split(':'));
	return Brahma.bench(this, arguments, function(elem) {
		if (elem.length===0) return false;
		for (var q = 0;q<elem.length;q++) {
			try {
				if (!nativetest(elem[ q ])) return false;
			} catch(e) {
				// Test for pseudo selector
				if (pqs&&!Brahma.macros.dom.pseusoQueryMatch(elem[ q ], pqs)) return false;
			}
		};
		return true;
	});
}

Brahma.vector.not = function(qs) {
	var subject,test,eq,kit=[];
	("array"!==typeof qs)&&(qs=[qs]);
	return Brahma.bench(this, arguments, function(elem) {
		
		for (var q = 0;q<elem.length;q++) {
			subject = elem[ q ];
			test = subject && ( subject.matches || subject[ 'webkitMatchesSelector' ] || subject[ 'mozMatchesSelector' ] || subject[ 'msMatchesSelector' ] );
			eq=false;
			for (var s = 0;s<qs.length;s++) {
				if (qs[s]==="") continue;
				if ((!!test && test.call( subject, qs[s] ))) { eq=!0; break; }
			};
			if (!eq) kit.push(elem[ q ]);
		};
		return Brahma(kit);
	});
}

Brahma.vector.first = function() {
	return Brahma.bench(this, arguments, function(elem) {
		return Brahma(elem[0]);
	});
};

/**
@method replace
Заменяет данный элемент другим элементом и опционально сохраняет data-аргументы и классы
*/
Brahma.vector.replace = function(newElement, preserveData) {
	return Brahma.bench(this, arguments, function(elem, args) {
		var queue = [];
		for (var i=0;i<elem.length;i++) {
			(function(e) {
				if (preserveData) {
					var className = e.className;
					var data = {};
					if (Brahma.caniuse('dataset')) {
						for (var d in e.dataset) {
							if (e.dataset.hasOwnProperty(d)) data[d] = e.dataset[d];
						};
					} else {
						for (var d in e.attributes) {
							if (!e.attributes.hasOwnProperty(d)) continue;
							if (e.attributes[d].name.substring(0,5)==='data-') {
								
								data[e.attributes[d].name.substring(5)] = e.attributes[d].value;
							}
						};
					}
					
				};
				queue.push(newElement.cloneNode());
				e.parentNode.replaceChild(queue[queue.length-1], e);
				
				if (preserveData) {
					if (Brahma.caniuse('dataset')) {
						for (var d in data) {
							queue[queue.length-1].dataset[d] = data[d];
						};
					} else {
						for (var d in data) {
							queue[queue.length-1].setAttribute('data-'+d, data[d]);
						};
					};
					queue[queue.length-1].className = className;
				};
			})(elem[i]);
		}
		return Brahma(queue);
	});
}

Brahma.vector.parent = function(search) {
	var parent,ok;
	return Brahma.bench(this, arguments, function(elem) {
		if (elem.length>0) {
			if (search) {
				parent = elem[0],ok=false;
				do {
					parent = parent.parentNode;
					if (Brahma(parent).is(search)) return Brahma(parent);
					if (parent===null||parent.nodeName==='BODY') return false;
				} while(true);
			} else {
				return Brahma(elem[0].parentNode);
			}
		}
		else return null;
	});
};

Brahma.vector.createNode = function() {
	return Brahma.bench(this, arguments, function(elem,args) {
		var nodeName=args[0], attrs=args[1]||{}, prepend=args[2]||false,element=elem[0];
		try {
			var newElement = document.createElement(nodeName);
		} catch(e) {
			Brahma.die('Not a valid name tag name `'+nodeName+'`('+nodeName.length+')');
		}
		;(!(prepend||false))?this[0].appendChild(newElement):(function() {
			;
			if (element.firstChild!==null)
			element.insertBefore(newElement, element.firstChild);
			else element.appendChild(newElement);
		})();
		for (var name in attrs) {
			if (attrs.hasOwnProperty(name)) {
				newElement.setAttribute(name, attrs[name]);
			}
		}
		return Brahma([newElement]);
	});
}

Brahma.vector.each = Brahma.each = function() {
	var subject, callback;
	(this instanceof Brahma) ? (subject = this, callback = arguments[0]||false) : (subject=arguments[0],callback=arguments[1]);
	
	Brahma.bench(subject, [callback], function(elements, args) {
		
		var callback = ("function"===typeof args[0]) ? args[0] : false;
		for (var index = 0;index<elements.length;index++) {
			
			if (callback) callback.call(elements[index], elements[index], index);
		}
	});
}

Brahma.vector.put = function() {
	var kit = [];
	Brahma.bench(this, arguments, function(elem, args) {
		Brahma(elem).each(function(element) {
			switch(typeof args[0]) {
				case "object":

					Brahma(args[0]).each(function() {
						
						element.appendChild(this);
					});	
					
					kit.push(element);
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

Brahma.vector.unshift = function() {
	var kit = [];
	Brahma.bench(this, arguments, function(elem, args) {
		Brahma(elem).each(function(element) {
			switch(typeof args[0]) {
				case "object":
					var newElement = Brahma(args[0])[0];
					if (element.firstChild!==null)
					element.insertBefore(newElement, element.firstChild);
					else element.appendChild(newElement);
					kit.push(newElement);
				break;
				case "string":
					var nodeName = args[0].trim().toUpperCase();
					var attrs = args[1]||{};
					var newElement = Brahma(element).createNode(nodeName, attrs, true)[0];
					kit.push(newElement);
				break;
			};
		});
	});
	return Brahma(kit);
};

Brahma.vector.and = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		if (elem.length>0) {
			var parent = Brahma(elem[0].parentNode);

			return parent.put.apply(parent, args);
		} else {
			return null;
		}
	});
};

Brahma.vector.before = function() {
	var kit = [];
	Brahma.bench(this, arguments, function(elem, args) {
		Brahma(elem).each(function(element) {

			switch(typeof args[0]) {
				case "object":
					var newElement = args[0];
				break;
				case "string":
					var nodeName = args[0].trim().toUpperCase();
					var attrs = args[1]||{};
					var newElement = Brahma(element).createNode(nodeName, attrs, true)[0];
				break;
			};
			element.parentNode.insertBefore(newElement, element);
			kit.push(newElement);
		});
	});
	return Brahma(kit);
};


Brahma.vector.after = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		if (elem.length>0) {
			var newNode = Brahma(elem[0].parentNode).put.apply(Brahma(elem[0].parentNode), args);
			
			elem[0].parentNode.insertBefore(newNode[0], elem[0].nextSibling);
			return newNode;
		} else {
			return null;
		}
	});
};

Brahma.vector.condition = function(condit, onTrue, onFalse) {
	if (condit) {
		if (typeof onTrue == 'function') return onTrue.call(this, condit);
		return this;
	} else {
		if (typeof onFalse == 'function') return onFalse.call(this);
		return this;
	};
}

Brahma.vector.wrapAll = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		var wrap = Brahma(elem[0].parentNode);
		var node = wrap.createNode.apply(wrap, args);
		for (var i=0;i<elem.length;i++) {
			Brahma(node).put(elem[i]);
		}

		return node;
	});
}

Brahma.vector.find = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		var kit = [];
		Brahma.each(elem, function() {
			
			var founds = Brahma.nodeQuery(args[0], this);

			if (founds.length) for (var i=0;i<founds.length;i++) {
				kit.push(founds[i]);
			};
		});
		
		return Brahma(kit);
	});
}


Brahma.vector.tie = function(cb) {
	cb.call(this);
	return this;
}

Brahma.vector.condition = function(condition, ontrue, onfalse) {
	if (condition) {
		if ("function"===typeof ontrue) return ontrue.call(this);
	} else {
		if ("function"===typeof onfalse) return onfalse.call(this);
	}
	return this;
}

Brahma.addEvent = function(elem, type, userEventHandler, once) {
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
};

Brahma.removeEvent = function(elem, type, userEventHandler) {
	if ( elem.addEventListener ) {
		elem.removeEventListener(type, userEventHandler||false, false);
	}  else if ( elem.attachEvent ) {
		 element.detachEvent("on" + type, userEventHandler);
	} else {
		elem["on"+type] = null;
	};
};

Brahma.vector.bind = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		var events = args[0].split(' ')
		for (var e=0;e<events.length;e++) {
			if (events[e]==='') continue;
			for (var i=0;i<elem.length;i++) {
			   	Brahma.addEvent(elem[i], events[e], args[1], args[2]||false);
			}
		}
		return this;
	});
};

Brahma.vector.unbind = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		for (var i=0;i<elem.length;i++) {
		   	Brahma.removeEvent(elem[i], args[0], args[1]||false);
		}
		return this;
	});
}

Brahma.vector.addClass = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		var stylename = args[0];
		for (var i=0;i<elem.length;i++) {
			var st = elem[i].className.split(' ');
			(st.indexOf(stylename)<0) && (st.push(stylename), elem[i].className = st.join(' '));
		}
		return this;
	});
}

Brahma.vector.removeClass = function() {
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

Brahma.vector.hasClass = function() {
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


Brahma.vector.css = function() {
	var data, polymorph=[];
	("object"===typeof arguments[0]) ? ((arguments[0] instanceof Array) ? (polymorph=arguments[0],data=arguments[1]) : (data=arguments[0])) : ( (arguments.length>1) ? (data={},data[arguments[0]]=arguments[1]) : (data=arguments[0]) );
	return Brahma.bench(this, [polymorph,data], function(elem, args) {
		if ("object"===typeof args[1]) {
			Brahma(elem).each(function() {
				for (var i in data) {
					if (polymorph.length!==0) for (var p = 0;p<polymorph.length;p++)
					this.style[polymorph[p]+i] = data[i];
					this.style[i] = data[i];
				};	
			});
			return Brahma(elem);
		} else {
			return elem[0].style[data];
		};
	});
};

Brahma.vector.data = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		var key = Brahma.camelize(args[0]);
		for (var i = 0;i<elem.length;i++) {
			if (args.length>1) {
				if (args[1]===null) {
					if (Brahma.caniuse('dataset'))
					delete elem[i].dataset[key];
					else elem[i].removeAttribute("data-"+args[0]);
				} else {
					if (Brahma.caniuse('dataset'))
					elem[i].dataset[key] = args[1];
					else elem[i].setAttribute("data-"+args[0], args[1]);
				};
			} else {
				if (Brahma.caniuse('dataset'))
				return ("undefined"!==typeof elem[i].dataset[key]) ? elem[i].dataset[key] : null;
				else
				return elem[i].getAttribute("data-"+args[0]);
			}
		};
		return this;
	});
}

Brahma.vector.attr = function() {
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

Brahma.vector.removeAttr = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		Brahma(elem).each(function() {							
			this.removeAttribute(args[0]);
		});
	});
};

Brahma.vector.scroll = function() {
	var doc = document.documentElement;
	var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
	var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
	return {left: left, top: top};
};

/* Возвращает из найденных элементов, элемент в индексом index */
Brahma.vector.eq = function(index) {
	return Brahma(this[index]);
}

		/**
			## Brahma.cultivate
			Обеспечение фукнции воспроизводства самого себя. Используя функцию cultivate можно создать библиотеку, основанную на Brahma.
			Стоит учитывать, что вновь созданная библиотека не будет включать в себя расширенный функционал, если таковой был подключен
			дополнительно.
		*/
		Brahma.cultivate = function() {
			return BrahmaStudioFactory(false);
		}

		/**
			## Brahma.caniuse
			Это локальная процедура проверки допустимых для данного браузера или устройства, тех или иных возможностей.
			Конечно, это очень ограниченная база знаний, тем не менее, необходимая.
		*/
		Brahma.caniuse = function(test) {
	if (Brahma.caniuse.info[test] && "function"===typeof Brahma.caniuse.info[test]) Brahma.caniuse.info[test] = Brahma.caniuse.info[test]();
	if (Brahma.caniuse.info[test]) return Brahma.caniuse.info[test]; else return false;
};
Brahma.caniuse.info = {
    /* dataset - определяет возможность использования dataset для получения аргументов data-* */
	"dataset": (typeof document.createElement('div').dataset !== "undefined"),
    /* translate3D - определяет возможность использования translate3D */
	"translate3D": function() {
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
	},
    "mobile": function() {
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
		/*
			Дополнение document
		*/
		var brahmaHTMLDoc = function(cb) {
	if (Brahma.document.ready) {
		cb.call(Brahma.document);
	} else {
		Brahma.bind('DOMReady', cb);
	}
};

/* Расширяем модуль событиями */
Brahma.extend(brahmaHTMLDoc, Brahma.classes.module.internals.events.proto);

brahmaHTMLDoc.eventCatchers = { // objects that catch events

};

brahmaHTMLDoc.ready = false;

/*
	start event listners
*/
brahmaHTMLDoc._startEventListing = function(e) {
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
			/* Split event string when first part is selector, second is origin event name */
			var parts = e.split('.');
			
			Brahma(parts[0]).bind(parts[1], function() {
				d.catchEvent(e, this, arguments);
			});
		break;
	}
};

/*
	Catch event
*/
brahmaHTMLDoc.catchEvent = function(event, element, args) {
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
brahmaHTMLDoc.translateEvents = function(handler, events) {
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
Document zindex
*/
brahmaHTMLDoc.zindex = {
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
			
			brahmaHTMLDoc.zindex.all[indexes[i]] = false;
		};
		brahmaHTMLDoc.zindex.recalc();
	}
};

Brahma.document = brahmaHTMLDoc;
		
		/* Функция позволяет создать аналог Brahma и далее развивать его отдельно */
		Brahma.mutate = function() {
			return BrahmaStudioFactory();
		}

		return Brahma;
	};



	window.Brahma = window.Studio = BrahmaStudioFactory();
})();
