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
			throw('Brahma: require `'+arguments[0]+'` application. Please, download it.');
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