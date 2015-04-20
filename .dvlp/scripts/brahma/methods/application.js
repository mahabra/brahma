Brahma.applications.addFabric('default',['events','fabrics','tie'], function() {});

Brahma.applications.execute = function() {
		// > Test for plugin exists
		if (typeof Brahma.applications.modules[arguments[0]] != 'object') {
			throw('Brahma: require `'+arguments[0]+'` application. Please, download it.');
		};

		// > We can give options to life elemnt
		var options = arguments.length>1 && typeof arguments[1] == 'object' ? arguments[1] : {}; 
		
		var plug = Brahma.inherit(Brahma.applications.modules[arguments[0]]);

		plug.config = Brahma.extend(plug.config, options, true);

		/* Import config from data-attributes */
		if ("object"===typeof Brahma.applications.modules[arguments[0]].config) for (var prop in Brahma.applications.modules[arguments[0]].config) {
			if (Brahma.applications.modules[arguments[0]].config.hasOwnProperty(prop)) {
				var hyphenProp = Brahma.hyphens(prop);
				if (Brahma(this).data(hyphenProp)!==null) plug.config[prop] = Brahma(this).data(hyphenProp);
			}
		};

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
		/*
		Этот момент нужно ещё протестировать, но нам нужно дополнительно дописать конфигурацию, потому что это протестировано.
		*/
		if (typeof $data.config === 'object') component.config = Brahma.extend(component.config, $data.config);

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