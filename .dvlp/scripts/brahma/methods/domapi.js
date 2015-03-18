
Brahma.vector.html = function(html) {
	if ("undefined"===typeof html) {
		if (this.length<=0) return null;
		return this[0].innerHTML;
	}
	else
	return Brahma.bench(this, arguments, function(elem, arguments) {
		for (var q = 0;q<elem.length;q++) {
			elem[q].innerHTML = html;
		}
		return this;
	});
};

Brahma.vector.empty = function() {
	return Brahma.bench(this, arguments, function(elem) {
		for (var q = 0;q<elem.length;q++) {
			elem[q].innerHTML = '';
		}
		return this;
	});
};

Brahma.vector.remove = function() {
	return Brahma.bench(this, arguments, function(elem) {
		for (var q = 0;q<elem.length;q++) {
			elem[q].parentNode.removeChild(elem[q]);
		}
		return elem[q].parentNode;
	});
};

/**
@method replace
Заменяет данный элемент другим элементом и опционально сохраняет data-аргументы и классы
*/
Brahma.vector.replace = function(newElement, preserveData) {
	return Brahma.bench(this, arguments, function(elem, args) {
		var queue = [];
		for (var i=0;i<elem.length;i++) {
			(function(e) {
				if (preserveData) {
					var className = e.className;
					var data = {};
					if (Brahma.caniuse('dataset')) {
						for (var d in e.dataset) {
							if (e.dataset.hasOwnProperty(d)) data[d] = e.dataset[d];
						};
					} else {
						for (var d in e.attributes) {
							if (!e.attributes.hasOwnProperty(d)) continue;
							if (e.attributes[d].name.substring(0,5)==='data-') {
								
								data[e.attributes[d].name.substring(5)] = e.attributes[d].value;
							}
						};
					}
					
				};
				queue.push(newElement.cloneNode());
				e.parentNode.replaceChild(queue[queue.length-1], e);
				
				if (preserveData) {
					if (Brahma.caniuse('dataset')) {
						for (var d in data) {
							queue[queue.length-1].dataset[d] = data[d];
						};
					} else {
						for (var d in data) {
							queue[queue.length-1].setAttribute('data-'+d, data[d]);
						};
					};
					queue[queue.length-1].className = className;
				};
			})(elem[i]);
		}
		return Brahma(queue);
	});
}

Brahma.vector.parent = function() {

	return Brahma.bench(this, arguments, function(elem) {

		if (elem.length>0) return Brahma(elem[0].parentNode);
		else return null;
	});
};

Brahma.vector.createNode = function(nodeName, attrs) {
	var attrs = attrs||{};
	try {
		var newElement = document.createElement(nodeName);
	} catch(e) {
		Brahma.die('Not a valid name tag name `'+nodeName+'`('+nodeName.length+')');
	}
	this[0].appendChild(newElement);
	for (var name in attrs) {
		if (attrs.hasOwnProperty(name)) {
			newElement.setAttribute(name, attrs[name]);
		}
	}
	return Brahma([newElement]);
}

Brahma.vector.each = Brahma.each = function() {
	var subject, callback;
	(this instanceof Brahma) ? (subject = this, callback = arguments[0]||false) : (subject=arguments[0],callback=arguments[1]);
	
	Brahma.bench(subject, [callback], function(elements, args) {
		
		var callback = ("function"===typeof args[0]) ? args[0] : false;
		for (var index = 0;index<elements.length;index++) {
			
			if (callback) callback.call(elements[index], elements[index], index);
		}
	});
}

Brahma.vector.put = function() {
	var kit = [];

	Brahma.bench(this, arguments, function(elem, args) {
		Brahma(elem).each(function(element) {
			switch(typeof args[0]) {
				case "object":
					var newElement = args[0];
					element.appendChild(newElement);
					kit.push(newElement);
				break;
				case "string":
					var nodeName = args[0].trim().toUpperCase();
					var attrs = args[1]||{};
					var newElement = Brahma(element).createNode(nodeName, attrs)[0];
					kit.push(newElement);
				break;
			};
		});
	});
	return Brahma(kit);
};

Brahma.vector.and = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		if (elem.length>0) {
			var parent = Brahma(elem[0].parentNode);
			return parent.put.apply(parent, args);
		} else {
			return null;
		}
	});
};

Brahma.vector.condition = function(condit, onTrue, onFalse) {
	if (condit) {
		if (typeof onTrue == 'function') return onTrue.call(this, condit);
		return this;
	} else {
		if (typeof onFalse == 'function') return onFalse.call(this);
		return this;
	};
}

Brahma.vector.wrapAll = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		var wrap = Brahma(elem[0].parentNode);
		var node = wrap.createNode.apply(wrap, args);
		for (var i=0;i<elem.length;i++) {
			Brahma(node).put(elem[i]);
		}

		return node;
	});
}

Brahma.vector.find = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		var kit = [];
		Brahma.each(elem, function() {
			
			var founds = Brahma.nodeQuery(args[0], this);

			if (founds.length) for (var i=0;i<founds.length;i++) {
				kit.push(founds[i]);
			};
		});
		
		return Brahma(kit);
	});
}


Brahma.vector.tie = function(cb) {
	cb.call(this);
	return this;
}

Brahma.addEvent = function(elem, type, userEventHandle, once) {
	var eventHandle;
	eventHandle = once ? function() { 
		userEventHandle.apply(this, arguments); 
		if ( elem.addEventListener ) {
			elem.removeEventListener(type, eventHandle, false);
		}  else if ( elem.attachEvent ) {
			 element.detachEvent("on" + type, eventHandle);
		} else {
			elem["on"+type] = null;
		};
	} : userEventHandle;
    if (elem == null || typeof(elem) == 'undefined') return;
    if ( elem.addEventListener ) {

        elem.addEventListener( type, eventHandle, false );
    } else if ( elem.attachEvent ) {
        elem.attachEvent( "on" + type, eventHandle );
    } else {
        elem["on"+type]=eventHandle;
    }
};

Brahma.vector.bind = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		for (var i=0;i<elem.length;i++) {
		   	Brahma.addEvent(elem[0], args[0], args[1], args[2]||false);
		}
		return this;
	});
}

Brahma.vector.addClass = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		var stylename = args[0];
		for (var i=0;i<elem.length;i++) {
			var st = elem[i].className.split(' ');
			(st.indexOf(stylename)<0) && (st.push(stylename), elem[i].className = st.join(' '));
		}
		return this;
	});
}

Brahma.vector.removeClass = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		var stylename = args[0];
		for (var i=0;i<elem.length;i++) {
			var st = elem[i].className.split(' ');
			var index = st.indexOf(stylename);
			if (index>-1) {
				st.splice(index, 1);
				elem[i].className = st.join(' ');
			};
		}
		return this;
	});
}

Brahma.vector.hasClass = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		var stylename = args[0];
		for (var i=0;i<elem.length;i++) {
			var st = elem[i].className.split(' ');
			var index = st.indexOf(stylename);
			if (index>-1) return true;
		}
		return false;
	});
}


Brahma.vector.css = function() {
	var data, polymorph=[];
	("object"===typeof arguments[0]) ? ((arguments[0] instanceof Array) ? (polymorph=arguments[0],data=arguments[1]) : (data=arguments[0])) : ( (arguments.length>1) ? (data={},data[arguments[0]]=arguments[1]) : (data=arguments[0]) );
	return Brahma.bench(this, [polymorph,data], function(elem, args) {
		if ("object"===typeof args[1]) {
			Brahma(elem).each(function() {
				for (var i in data) {
					if (polymorph.length!==0) for (var p = 0;p<polymorph.length;p++)
					this.style[polymorph[p]+i] = data[i];
					this.style[i] = data[i];
				};	
			});
			return Brahma(elem);
		} else {
			return elem[0].style[data];
		};
	});
};

Brahma.vector.data = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		var key = Brahma.camelCase(args[0]);
		for (var i = 0;i<elem.length;i++) {
			if (args.length>1) {
				if (Brahma.caniuse('dataset'))
				elem[i].dataset[key] = args[1];
				else elem[i].setAttribute("data-"+args[0], args[1]);
			} else {
				if (Brahma.caniuse('dataset'))
				return ("undefined"!==typeof elem[i].dataset[key]) ? elem[i].dataset[key] : null;
				else
				return elem[i].getAttribute("data-"+args[0]);
			}
		};
		return this;
	});
}

Brahma.vector.attr = function() {
	var elem;
	return Brahma.bench(this, arguments, function(elem, args) {
		
		if (args.length>0) {
			switch(typeof args[0]) {
				case 'object':
					Brahma(elem).each(function() {
						for (var i in args[0]) {
							this.setAttribute(i, args[0][i]);
						};	
					});
				break;
				case "string":
					if (args.length>1) {
						Brahma(elem).each(function() {							
							this.setAttribute(args[0], args[1]);
						});
						return this;
					} else {
						return elem[0].getAttribute(args[0]);
					}
				break;
				default:
					return elem[0].attributes;
				break;
			};
			return Brahma(elem);
		} else {
			return elem[0].attributes;
		};
		return Brahma(elem);
	});
};

Brahma.vector.scroll = function() {
	var doc = document.documentElement;
	var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
	var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
	return {left: left, top: top};
};