{
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
}