function() {
	var name, internals;
	("string"===typeof arguments[0]) ? (name=arguments[0],internals=arguments[1]||[]) : (name=false,internals=arguments[0]||[]);
	
	var module = Brahma.inherit(Brahma.classes.module.proto);
	module.master = this.ref();
	
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
}