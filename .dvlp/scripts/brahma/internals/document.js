var brahmaHTMLDoc = function(cb) {
	if (Brahma.document.ready) {
		cb.call(Brahma.document);
	} else {
		Brahma.bind('DOMReady', cb);
	}
};

/* Расширяем модуль событиями */
Brahma.extend(brahmaHTMLDoc, Brahma.classes.module.internals.events.proto);

brahmaHTMLDoc.eventCatchers = { // objects that catch events

};

brahmaHTMLDoc.ready = false;

/*
	start event listners
*/
brahmaHTMLDoc._startEventListing = function(e) {
	var d = this;
	var e = e;

	// Create list for eventCatchers
	("object" != typeof this.eventCatchers[e]) && (this.eventCatchers[e] = []);

	// Add event listners
	switch(e) {
		case 'window.resize': // window resize

			window.onresize = function() {

				d.catchEvent(e, this, arguments);
			};
		break;
		case 'document.keydown':
			document.onkeydown = function() {

				d.catchEvent(e, this, arguments);
			};
		break;
		case 'document.keyup':
			document.onkeyup = function() {

				d.catchEvent(e, this, arguments);
			};
		break;
		default:
			/* Split event string when first part is selector, second is origin event name */
			var parts = e.split('.');
			
			Brahma(parts[0]).bind(parts[1], function() {
				d.catchEvent(e, this, arguments);
			});
		break;
	}
};

/*
	Catch event
*/
brahmaHTMLDoc.catchEvent = function(event, element, args) {
	// Classic event trigger
	this.trigger(event, args);

	// Give event to ctachers
	if ("object" == typeof this.eventCatchers[event])
		var etd=[];
		for (var c = 0; c<this.eventCatchers[event].length; c++) {
			if ("object" == typeof this.eventCatchers[event][c] && "function" == typeof this.eventCatchers[event][c].trigger)
			this.eventCatchers[event][c].trigger(event, args);
			else etd.push(c);
		}
		// Delete corrupt objects
		(etd.length>0) && (function(c, etd) {
			var nc = [];
			for (var e=0;e<c.length;e++) {
				if (etd.indexOf(e)<0) nc.push(c[e]);
			};
			c = nc;
		})(this.eventCatchers[event], etd);
}

/*
	add object to event relistners
*/
brahmaHTMLDoc.translateEvents = function(handler, events) {
	/* test for event exists */
	if ("string"==typeof events) events = [events];
	for (var e = 0; e<events.length;e++) {
		/* create event listner if not exists */
		("object" != typeof this.eventListners[e]) && 
		(function(e) {
			var e = e;
			this._startEventListing(e);				
		}).call(this, events[e]);
		/* append object to listners */
		
		this.eventCatchers[events[e]].push(handler);
	};
}

/*
Document zindex
*/
brahmaHTMLDoc.zindex = {
	max: 0,
	all	: [],
	recalc	: function() {
		while (!this.all[this.max] && this.max!=0) {
			this.max--;
		};
	},
	get : function(count) {
		for(var i = 1; i<=count; i++) {
			this.all[this.max+i] = true;
		};
		
		this.max += count;
		
		return this.max-(count-1);
	},
	free : function(index, count) {
		if (typeof(index) != 'object') {
			indexes = [index];
			if (typeof(count) == 'number') {
				for (var i=1;i<count;i++) {
					
					indexes.push(index+i);
				};
			};
		} else {
			var indexes = [index];
		};
		
		for (var i=0;i<indexes.length;i++) {
			
			brahmaHTMLDoc.zindex.all[indexes[i]] = false;
		};
		brahmaHTMLDoc.zindex.recalc();
	}
};

Brahma.document = brahmaHTMLDoc;