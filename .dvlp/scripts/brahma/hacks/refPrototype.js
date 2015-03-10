Object.prototype.ref = function() {
	function Ref() {};
	Ref.prototype = this;
	Ref.prototype.constructor = Ref;
	return new Ref;
};