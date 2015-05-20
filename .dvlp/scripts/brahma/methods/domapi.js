
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
		var parent; 
		for (var q = 0;q<elem.length;q++) {
			parent = elem[q].parentNode;
			parent.removeChild(elem[q]);
		}
		return parent;
	});
};

Brahma.vector.hide = function() {
	return Brahma.bench(this, arguments, function(elem) {
		for (var q = 0;q<elem.length;q++) {
			// Save current station
			var currentDisplay = Brahma(elem[q]).css("display");
			if (currentDisplay!=="none") {
				if ("undefined"===typeof elem[q].backupStyle) elem[q].backupStyle = {};
				elem[q].backupStyle.display=currentDisplay;
			};
			Brahma(elem[q]).css("display", "none");
		}
		return Brahma(elem);
	});
};

Brahma.vector.show = function() {
	return Brahma.bench(this, arguments, function(elem) {
		for (var q = 0;q<elem.length;q++) {
			if ("undefined"!==typeof elem[q].backupStyle && elem[q].backupStyle.display) {
				Brahma(elem[q]).css("display", elem[q].backupStyle.display);
			}
			else {
				Brahma(elem[q]).css("display", "");
			};
		}
		return Brahma(elem);
	});
};


Brahma.vector.width = function() { 
	if (this[0]===window) {
		var w = window,
	    d = document,
	    e = d.documentElement,
	    g = d.getElementsByTagName('body')[0];
	    return w.innerWidth || e.clientWidth || g.clientWidth;
	} else {
		return Brahma.bench(this, arguments, function(elem) {
			return elem[0].offsetWidth;
		});
	}
};

Brahma.vector.height = function() { 
	
	if (this[0]===window) {
		var w = window,
	    d = document,
	    e = d.documentElement,
	    g = d.getElementsByTagName('body')[0];
	    return w.innerHeight|| e.clientHeight|| g.clientHeight;
	} else {
		return Brahma.bench(this, arguments, function(elem) {
			return elem[0].offsetHeight;
		});
	}
};

Brahma.vector.outerWidth = function() {
	return Brahma(this[0]).width()+Brahma.macros.dom.pixelizeMargin(this[0],'left')+Brahma.macros.dom.pixelizeMargin(this[0],'right');
};

Brahma.vector.outerHeight = function() {
	return Brahma(this[0]).height()+Brahma.macros.dom.pixelizeMargin(this[0],'top')+Brahma.macros.dom.pixelizeMargin(this[0],'bottom');
};

Brahma.vector.is = function(origq) {
	var subject,test,pqs,qs;
	var nativetest = function(subject) {
		test = subject && ( subject.matches || subject[ 'webkitMatchesSelector' ] || subject[ 'mozMatchesSelector' ] || subject[ 'msMatchesSelector' ] );
		if (!(!!test && test.call( subject, origq ))) return false;
		return true;
	};
	(function(p) { qs=p[0].trim(); pqs=p[1]?p[1].trim():false; })(origq.split(':'));
	return Brahma.bench(this, arguments, function(elem) {
		if (elem.length===0) return false;
		for (var q = 0;q<elem.length;q++) {
			try {
				if (!nativetest(elem[ q ])) return false;
			} catch(e) {
				// Test for pseudo selector
				if (pqs&&!Brahma.macros.dom.pseusoQueryMatch(elem[ q ], pqs)) return false;
			}
		};
		return true;
	});
}

Brahma.vector.not = function(qs) {
	var subject,test,eq,kit=[];
	("array"!==typeof qs)&&(qs=[qs]);
	return Brahma.bench(this, arguments, function(elem) {
		
		for (var q = 0;q<elem.length;q++) {
			subject = elem[ q ];
			test = subject && ( subject.matches || subject[ 'webkitMatchesSelector' ] || subject[ 'mozMatchesSelector' ] || subject[ 'msMatchesSelector' ] );
			eq=false;
			for (var s = 0;s<qs.length;s++) {
				if (qs[s]==="") continue;
				if ((!!test && test.call( subject, qs[s] ))) { eq=!0; break; }
			};
			if (!eq) kit.push(elem[ q ]);
		};
		return Brahma(kit);
	});
}

Brahma.vector.first = function() {
	return Brahma.bench(this, arguments, function(elem) {
		return Brahma(elem[0]);
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

Brahma.vector.parent = function(search) {
	var parent,ok;
	return Brahma.bench(this, arguments, function(elem) {
		if (elem.length>0) {
			if (search) {
				parent = elem[0],ok=false;
				do {
					parent = parent.parentNode;
					if (Brahma(parent).is(search)) return Brahma(parent);
					if (parent===null||parent.nodeName==='BODY') return false;
				} while(true);
			} else {
				return Brahma(elem[0].parentNode);
			}
		}
		else return null;
	});
};

Brahma.vector.createNode = function() {
	return Brahma.bench(this, arguments, function(elem,args) {
		var nodeName=args[0], attrs=args[1]||{}, prepend=args[2]||false,element=elem[0];
		try {
			var newElement = document.createElement(nodeName);
		} catch(e) {
			Brahma.die('Not a valid name tag name `'+nodeName+'`('+nodeName.length+')');
		}
		;(!(prepend||false))?this[0].appendChild(newElement):(function() {
			;
			if (element.firstChild!==null)
			element.insertBefore(newElement, element.firstChild);
			else element.appendChild(newElement);
		})();
		for (var name in attrs) {
			if (attrs.hasOwnProperty(name)) {
				newElement.setAttribute(name, attrs[name]);
			}
		}
		return Brahma([newElement]);
	});
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

					Brahma(args[0]).each(function() {
						
						element.appendChild(this);
					});	
					
					kit.push(element);
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

Brahma.vector.unshift = function() {
	var kit = [];
	Brahma.bench(this, arguments, function(elem, args) {
		Brahma(elem).each(function(element) {
			switch(typeof args[0]) {
				case "object":
					var newElement = Brahma(args[0])[0];
					if (element.firstChild!==null)
					element.insertBefore(newElement, element.firstChild);
					else element.appendChild(newElement);
					kit.push(newElement);
				break;
				case "string":
					var nodeName = args[0].trim().toUpperCase();
					var attrs = args[1]||{};
					var newElement = Brahma(element).createNode(nodeName, attrs, true)[0];
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

Brahma.vector.before = function() {
	var kit = [];
	Brahma.bench(this, arguments, function(elem, args) {
		Brahma(elem).each(function(element) {

			switch(typeof args[0]) {
				case "object":
					var newElement = args[0];
				break;
				case "string":
					var nodeName = args[0].trim().toUpperCase();
					var attrs = args[1]||{};
					var newElement = Brahma(element).createNode(nodeName, attrs, true)[0];
				break;
			};
			element.parentNode.insertBefore(newElement, element);
			kit.push(newElement);
		});
	});
	return Brahma(kit);
};


Brahma.vector.after = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		if (elem.length>0) {
			var newNode = Brahma(elem[0].parentNode).put.apply(Brahma(elem[0].parentNode), args);
			
			elem[0].parentNode.insertBefore(newNode[0], elem[0].nextSibling);
			return newNode;
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

Brahma.vector.condition = function(condition, ontrue, onfalse) {
	if (condition) {
		if ("function"===typeof ontrue) return ontrue.call(this);
	} else {
		if ("function"===typeof onfalse) return onfalse.call(this);
	}
	return this;
}

Brahma.addEvent = function(elem, type, userEventHandler, once) {
	var eventHandler;

	eventHandler = function(e) {
		if (once) {
			if ( elem.addEventListener ) {
				elem.removeEventListener(type, eventHandler, false);
			}  else if ( elem.attachEvent ) {
				 element.detachEvent("on" + type, eventHandler);
			} else {
				elem["on"+type] = null;
			};
		};

		// Prevent default event handler if user returns false
		if ((function(r) { return (typeof r==="boolean" && r===false) })(userEventHandler.apply(this, arguments))) {

			e.preventDefault();
		};
	};
    if (elem == null || typeof(elem) == 'undefined') return;
    if ( elem.addEventListener ) {

        elem.addEventListener( type, eventHandler, false );
    } else if ( elem.attachEvent ) {
        elem.attachEvent( "on" + type, eventHandler );
    } else {
        elem["on"+type]=eventHandler;
    }
};

Brahma.removeEvent = function(elem, type, userEventHandler) {
	if ( elem.addEventListener ) {
		elem.removeEventListener(type, userEventHandler||false, false);
	}  else if ( elem.attachEvent ) {
		 element.detachEvent("on" + type, userEventHandler);
	} else {
		elem["on"+type] = null;
	};
};

Brahma.vector.bind = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		var events = args[0].split(' ')
		for (var e=0;e<events.length;e++) {
			if (events[e]==='') continue;
			for (var i=0;i<elem.length;i++) {
			   	Brahma.addEvent(elem[i], events[e], args[1], args[2]||false);
			}
		}
		return this;
	});
};

Brahma.vector.unbind = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		for (var i=0;i<elem.length;i++) {
		   	Brahma.removeEvent(elem[i], args[0], args[1]||false);
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
		var key = Brahma.camelize(args[0]);
		for (var i = 0;i<elem.length;i++) {
			if (args.length>1) {
				if (args[1]===null) {
					if (Brahma.caniuse('dataset'))
					delete elem[i].dataset[key];
					else elem[i].removeAttribute("data-"+args[0]);
				} else {
					if (Brahma.caniuse('dataset'))
					elem[i].dataset[key] = args[1];
					else elem[i].setAttribute("data-"+args[0], args[1]);
				};
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

Brahma.vector.removeAttr = function() {
	return Brahma.bench(this, arguments, function(elem, args) {
		Brahma(elem).each(function() {							
			this.removeAttribute(args[0]);
		});
	});
};

Brahma.vector.scroll = function() {
	var doc = document.documentElement;
	var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
	var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
	return {left: left, top: top};
};

/* Возвращает из найденных элементов, элемент в индексом index */
Brahma.vector.eq = function(index) {
	return Brahma(this[index]);
}