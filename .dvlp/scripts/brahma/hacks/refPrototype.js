/*
В идеале это должно быть в прототипе, но подобная модификация вызывает проблемы совместимости с библиотеками, не проверяющими hasOwnProperty
Object.prototype.ref = function() {
	function Ref() {};
	Ref.prototype = this;
	Ref.prototype.constructor = Ref;
	return new Ref;
};

Функция создает объект, ссылающийся на другой. Соль в том, что ссылка будет происходить через прототип, а сам конструктор объекта будет типа Ref.
	Это позволит его отличать от обычной ссылки на объект при клонировании.
*/

Brahma.ref = function(proto) {
	function Ref() {};
	Ref.prototype = proto||this;
	Ref.prototype.constructor = Ref;
	return new Ref;
};