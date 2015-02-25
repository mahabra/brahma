<%=$.snippet('hacks/queryselector.js')%>

!(function(window) { 
	
	var currentQuerySelector = ("function"===typeof Sizzle) ? Sizzle : document.querySelectorAll;
	window.Brahma = window.brahma = function(subject) { 
		<%=$.snippet('internals/initial.js')%>
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
	<%=$.snippet('methods/nodequery.js')%>

	// Brahma api
	<%=$.snippet('internals/api.js')%>

	/* Классы и прототипы */
	(Brahma.classes = {}) && (Brahma.classes.module = {
		proto: <%=$.snippet('internals/module.js')%>,
		internals: <%=$.snippet('internals/module.internals.js')%>
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
	<%=$.snippet('methods/application.js')%>

	<%=$.snippet('methods/domapi.js')%>

	<%=$.snippet('methods/caniuse.js')%> 

	/*
	Перехватываем глобальные события, такие как готовность документа
	*/
	<%=$.snippet('internals/domready.js')%>

})(window);