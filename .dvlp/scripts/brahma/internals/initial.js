if (this === window) {
	// OnAir   
	var air = new Brahma();
	
	var callback = false;
	var extensionName = false;
	var option3 = false;
	switch (arguments.length) {
		case 1:
			var selector = arguments[0];
			var options = {};
			switch(typeof selector) {
				case "function":
					/*
						Если передана функция, то мы должны выполнить её после готовности документа
					*/
					if (Brahma.document.ready) {
						selector.call(this);
					} else {
						Brahma.bind('domReady', selector, true);
					}
					
					return Brahma(window);
				break;
				default:
					var elements = Brahma.nodeQuery.call(this, selector);
				break;
			}
		break;
		case 0:
			var selector = '';
			var options = {};
			var elements = Brahma.nodeQuery.call(this, selector);
		break;
	}
	
	/*
		Safari ведет себя очень странно, querySelectorAll возвращает функцию со свойствами, вместо массива, поэтому нам необходимо тестировать и
		на тип "function".
	*/
	if ( ("object"===typeof elements || "function"===typeof elements) && elements.length) {
		
		for (var index=0;index<elements.length;index++) {
			air[index] = elements[index];
		}
	};
	
	if (index>1) air.context = document;
	else if (index>0) air.context = elements[0].parentNode;
	else air.context = null;
	air.length = index;
	air.selector = selector;
	
	return air;
}