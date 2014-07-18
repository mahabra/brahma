Brahma('brahma.curve', function() {
	Brahma.applet('curve', {
		config: {
				'strokeStyle': 'rgba(255,0,0,0)',
				'lineWidth': 3,
				'fillStyle': '#ffffff',
				'debug-fillStyle': 'rgba(255, 144, 0, 0.5)',
				'drawframe': 0.01,
				'font': "bold 10px Arial"
		},
		current: {
			debug: false,
			wrapperWidth: 0,
			wrapperHeight: 0
		},
		saves: {

		},
		records: [],
		execute: function() {
			// initial html
			this.initHtml();

			// initial variables
			this.refresh();

			// > Listen to global events
			Brahma.document.translateEvents(this, ['window.resize']);

			// Refresh HTML on window resize
			this.bind('window.resize', function(e) {

				this.watchHtml();
				this.refresh();
				this.replay();
			});
			
			return this;
		},
		initHtml: function() {
			var that = this;
			if (Brahma(this.elements)[0].tagName.toUpperCase() != 'CANVAS') {
		
				this.canvas = Brahma(this.elements).put('<canvas />');
				
				this.canvas = this.canvas[0];
				
			} else {
				this.canvas = Brahma(this.elements)[0];
			};	

			this.watchHtml();

			if (this.canvas.getContext) {

				this.ctx = this.canvas.getContext('2d'); // Ïîëó÷àåì 2D êîíòåêñò
			};		
		},
		watchHtml : function() {
			var that = this;
			this.current.width = Brahma(this.elements).width();
			this.current.height = Brahma(this.elements).height();
			
			Brahma(this.canvas).css({
				'width': this.current.width,
				'height': this.current.height
			}).attr({
				'width': this.current.width,
				'height': this.current.height
			}).with(function() {
				this[0].width = that.current.width;
				this[0].height = that.current.height;
			});
		},
		/* initial programm by configuration */
		refresh: function(keys) {

			this.setStyle();
		},
		debug : function() {
			this.current.debug = true;
			return this;
		},
		saveConfig : function(name) {
			this.saves[name] = this.config;
			return this;
		},
		loadConfig : function(name) {
			if ("object" == typeof this.saves[name]) this.config = this.saves[name];
			this.refresh();
			return this;
		},
		setStyle : function(fillStyle, strokeStyle, lineweight, font) {
			var fillStyle = fillStyle || this.config.fillStyle;
			var strokeStyle = strokeStyle || this.config.strokeStyle;
			var lineweight = lineweight || this.config.lineWidth;

			this.ctx.fillStyle = fillStyle;
			this.ctx.strokeStyle = strokeStyle;
			this.ctx.lineWidth = lineweight;
			return this;
		},
		record : function(callback) {
			this.records.push(callback);
			callback.apply(this);
		},
		replay : function() {
			for (var r =0;r<this.records.length;r++)
			this.records[r].apply(this);
		},
		magicCoords : function(coords, callback) {
			var means = 0; // 0 - x; 1 - y;
			for (var i = 0;i<coords.length;i++) {
				coords[i] = (means==0) ? Brahma.api.percentEq(coords[i], this.current.width) : Brahma.api.percentEq(coords[i], this.current.height);
				means++; if (means>1) means = 0;
			};
			if ("function" == typeof callback)
			callback.apply(this, coords);
			return coords;
		},
		linear : function(P0x, P0y, P1x, P1y) {
			
			this.magicCoords([P0x, P0y, P1x, P1y], function(P0x, P0y, P1x, P1y) {
				this.ctx.beginPath();
				this.ctx.moveTo(P0x, P0y); // Íà÷àëî ëèíèè 
				
				var t = 0;		
				while ( t<=1 ) {
					
					var x = (1 - t) * P0x + (t * P1x);
					var y = (1 - t) * P0y + (t * P1y);
					
					this.ctx.lineTo(x, y);
					
					t+=this.config.drawframe;
				};
				this.ctx.stroke();
				this.ctx.closePath();
				
				if (this.current.debug) {
					// ! ðèñóåì òî÷êè
					this.drawCheckpoints.apply(this, arguments);
					
				};
			});
			
			return this;
		},
		quadratic : function() {
			
			
			var t = 0;	
			var args = arguments;
			var P0x = arguments[0];
			var P0y = arguments[1];
			
			
			var P1x = arguments[arguments.length-2];
			var P1y = arguments[arguments.length-1];
			
			this.ctx.beginPath();
			this.ctx.moveTo(P0x, P0y); // Íà÷àëî ëèíèè 
			
			while ( t<=1 ) {
				
				var x = (Math.pow((1 - t), 2) * P0x);
				
				for (var i = 2;i < arguments.length-3; i+=2) {
					x += (2 * (1 - t) * t * arguments[i])
				};
				
				x += Math.pow(t, 2) * P1y;
				
				var y = (Math.pow((1 - t), 2) * P0y);
				
				for (var i = 3;i < arguments.length-2; i+=2) {
					y += (2 * (1 - t) * t * arguments[i]);
				};
				
				y += Math.pow(t, 2) * P1x;
				
				this.ctx.lineTo(x, y);
				
				t+=this.config.drawframe;
			};
			
			this.ctx.stroke();
			this.ctx.closePath();
			
			if (this.current.debug) {
				// ! ðèñóåì òî÷êè
				this.drawCheckpoints.apply(this, arguments);
				// ! ðèñóåì íàïðàâëÿþùèå
				this.setStyle(this.config['debug-fillStyle'], this.config['debug-fillStyle'], 2);
				this.linear(P0x, P0y, arguments[2], arguments[3]);
				this.linear(arguments[2], arguments[3], P1x, P1y);
				this.setStyle();
			};
			
			return this;
		},
		cubicBezier : function(P0x, P0y, P1x, P1y, P2x, P2y, P3x, P3y) {
			
			this.magicCoords([P0x, P0y, P1x, P1y, P2x, P2y, P3x, P3y], function(P0x, P0y, P1x, P1y, P2x, P2y, P3x, P3y) {
				
				var t = 0;	
			
				this.ctx.beginPath();
				this.ctx.moveTo(P0x, P0y); // Íà÷àëî ëèíèè 
				
				while ( t<=1 ) {
					
					var x = (Math.pow((1 - t), 3) * P0x) + (3 * Math.pow((1 - t), 2) * t * P1x) + (3* (1 - t) * Math.pow(t, 2) * P2x) + (Math.pow(t, 3) * P3x);
					var y = (Math.pow((1 - t), 3) * P0y) + (3 * Math.pow((1 - t), 2) * t * P1y) + (3* (1 - t) * Math.pow(t, 2) * P2y) + (Math.pow(t, 3) * P3y);
					
					this.ctx.lineTo(x, y);
					
					t+=this.config.drawframe;
				};
				
				this.ctx.lineTo(P3x, P3y);
				
				this.ctx.stroke();
				this.ctx.closePath();
				
				
				if (this.current.debug) {
					this.saveConfig('active');
					// ! ðèñóåì òî÷êè
					this.drawCheckpoints.apply(this, arguments);
					// ! ðèñóåì íàïðàâëÿþùèå
					this.setStyle(this.config['debug-fillStyle'], this.config['debug-fillStyle'], 2);
					this.linear(P0x, P0y, P1x, P1y);
					this.linear(P3x, P3y, P2x, P2y);
					
					this.set({
						'font': '9px bold Arial'
					});
					this.text('['+P0x+','+P0y+']', P0x, P0y);
					this.text('['+P1x+','+P1y+']', P1x, P1y);
					this.text('['+P2x+','+P2y+']', P2x, P2y);
					this.text('['+P3x+','+P3y+']', P3x, P3y);
					this.loadConfig('active');
				};
			});
			return this;
		},
		arc : function () {
			  var options = {
			  	x: 0,
			  	y: 0,
			  	radius: 100,
			  	sAngle: 0,
			  	eAngle: 2 * Math.PI,
			  	counterclockwise: false
			  };
			  if (typeof arguments[0] == 'object') {
			  	options = Brahma.api.extend(options, arguments[0]);
			  } else {
			  	var ui = 0;
			  	for (var i in options) {
			  		if (typeof arguments[ui] != "undefined") options[i] = arguments[ui];
			  		else break;
			  		ui++;
			  	};
			  };

			  // Convert percent to pixels
			  var xy = this.magicCoords([options.x, options.y]);

			  options.x = xy[0];
			  options.y = xy[1];

			  this.ctx.beginPath();
			  
		      this.ctx.arc(options.x, options.y, options.radius, options.sAngle, options.eAngle, options.counterclockwise);
		     
		      this.ctx.fill();
		      
		     
		      this.ctx.stroke();

		      return this;
		},
		// Doesnt work. Need fork!
		ellipse : function(options) {
			  var options = Brahma.api.extend({
			  	x: 0, 
			  	y: 0,
			  	width: 1,
			  	height: 1,
			  	center: false
			  }, options || {});
			  if (options.center) {
			  	options.x -= options.width/2; options.y -= options.width/2;
			  };

			  var kappa = .5522848,
			      ox = (options.width / 2) * kappa, // control point offset horizontal
			      oy = (options.height / 2) * kappa, // control point offset vertical
			      xe = options.x + options.width,           // x-end
			      ye = options.y + options.height,           // y-end
			      xm = options.x + options.width / 2,       // x-middle
			      ym = options.y + options.height / 2;       // y-middle



			  this.ctx.beginPath();
			  this.ctx.moveTo(options.x, ym);
			  this.ctx.bezierCurveTo(options.x, ym - oy, xm - ox, options.y, xm, options.y);
			  this.ctx.bezierCurveTo(xm + ox, options.y, xe, ym - oy, xe, ym);
			  this.ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
			  this.ctx.bezierCurveTo(xm - ox, ye, options.x, ym + oy, options.x, ym);
			  this.ctx.closePath(); // not used correctly, see comments (use to close off open path)
			  this.ctx.stroke();
		},
		bezier2D : function() {
			if (arguments.length<8) return this;
			for (var i = 0; i < arguments.length; i+=8) {
				if (arguments.length<(i+1)) return this;
				this.cubicBezier(arguments[i], arguments[i+1], arguments[i+2], arguments[i+3], arguments[i+4], arguments[i+5], arguments[i+6], arguments[i+7], arguments[i+8]);
			};
			
			return this;
		},
		drawCheckpoints : function() {
			this.ctx.fillStyle = '#000000';
			for (var i = 0; i<arguments.length; i+=2) {
				
				this.ctx.beginPath();  
				this.ctx.arc(arguments[i], arguments[i+1], 3, 0, Math.PI * 2, false); 
				this.ctx.fill();					
				this.ctx.closePath();
			};
		},
		text : function(text,x,y) {
			var text = text;
			this.magicCoords([x,y], function(x,y) {
				this.ctx.font = this.config.font;
				this.ctx.fillText(text, x, y);
			});
			
			return this;
		},
		clear : function() {
			
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			return this;
		},
		tie : function(callback) {
			
			callback.call(this);
			return this;
		},
		blur : function(deep) {
			this.canvas.style.webkitFilter = "blur("+(deep||0)+"px)";
			return this;
		}
	});
});