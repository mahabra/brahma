(function() {
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
