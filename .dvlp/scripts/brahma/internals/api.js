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
