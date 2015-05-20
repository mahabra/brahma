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