<%=$.snippet('hacks/refPrototype.js')%>
<%=$.snippet('hacks/queryselector.js')%>
;(function() {
	var BrahmaFactory; // Инициализируем факторию для использования внутри её же конструктора

	var BrahmaFactory = function(userConfig) {
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
			<%=$.snippet('internals/initial.js')%>
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
		Brahma.vector.version = '1.3.7';
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

		/*
			Функционал обработки селекторов
		*/
		<%=$.snippet('methods/nodequery.js')%>

		/*
			Базовый API
		*/
		<%=$.snippet('internals/api.js')%>

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
			constructor: <%=$.snippet('classes/module/constructor.js')%>,
			proto: <%=$.snippet('classes/module/prototype.js')%>,
			internals: <%=$.snippet('classes/module/internals.js')%>,
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
		<%=$.snippet('methods/application.js')%>
		/*
			API в стиле jQuery, работа с элементами, создание элементов и пр.
		*/
		<%=$.snippet('methods/domapi.js')%>

		/**
			## Brahma.cultivate
			Обеспечение фукнции воспроизводства самого себя. Используя функцию cultivate можно создать библиотеку, основанную на Brahma.
			Стоит учитывать, что вновь созданная библиотека не будет включать в себя расширенный функционал, если таковой был подключен
			дополнительно.
		*/
		Brahma.cultivate = function() {
			return BrahmaFactory(false);
		}

		/**
			## Brahma.caniuse
			Это локальная процедура проверки допустимых для данного браузера или устройства, тех или иных возможностей.
			Конечно, это очень ограниченная база знаний, тем не менее, необходимая.
		*/
		<%=$.snippet('methods/caniuse.js')%> 

		/*
			Перехватываем глобальные события, такие как готовность документа
		*/
		<%=$.snippet('internals/domready.js')%>
		return Brahma;
	};

	window.Brahma = BrahmaFactory();
})();
