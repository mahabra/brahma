/**
@method camelCase
change dashed string to camel case style string

*/
Brahma.camelCase = function(text) {
	return text.replace(/-([\da-z])/gi, function( all, letter ) {
		return letter.toUpperCase();
	});
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
}

/**
@method inherit
Копирует объект по максимальной глубине (функции и plane объекты остаются в прототипы, объекты клонируются)
*/
Brahma.inherit = function(proto) {
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
}
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
