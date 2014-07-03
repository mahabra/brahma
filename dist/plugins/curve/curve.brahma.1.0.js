/*!
 * brahma Curve Plugin
 *
 * Version 1.0.
 *
 * Released under the MIT license:

Copyright (C) 2014 Vladimir Kalmykov
*/
	
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
			debug: true,
			test: 123
		},
		init : function() {
			// Проверяем является ли объект типом Canvas
			
			if (Brahma(this.elements)[0].tagName.toUpperCase() != 'CANVAS') {
				
				this.canvas = Brahma(this.elements).put('<canvas />');
				
				this.canvas.css({
					'width': Brahma(this.elements).width(),
					'height': Brahma(this.elements).height()
				}).attr({
					'width': Brahma(this.elements).width(),
					'height': Brahma(this.elements).height()
				})
				
				this.canvas = this.canvas[0];
				
			} else {
				this.canvas = Brahma(this.elements)[0];
			};				
			
			// Проверяем понимает ли браузер canvas
			if (this.canvas.getContext) {
				this.ctx = this.canvas.getContext('2d'); // Получаем 2D контекст
			} else {
				alert('error');
			};
			
			this.ctx.strokeStyle = this.config.strokeStyle; // Цвет обводки
			this.ctx.lineWidth = this.config.lineWidth; // Ширина линии
			this.ctx.fillStyle = this.config.fillStyle; // Цвет заливки
		},
		debug : function() {
			this.current.debug = true;
			return this;
		},
		setStyle : function(fillStyle, strokeStyle, lineweight) {
			var fillStyle = fillStyle || this.config.fillStyle;
			var strokeStyle = strokeStyle || this.config.strokeStyle;
			var lineweight = lineweight || this.config.lineWidth;
			this.ctx.fillStyle = fillStyle;
			this.ctx.strokeStyle = strokeStyle;
			this.ctx.lineWidth = lineweight;
			return this;
		},
		linear : function(P0x, P0y, P1x, P1y) {
			
			
			this.ctx.beginPath();
			this.ctx.moveTo(P0x, P0y); // Начало линии 
			
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
				// ! рисуем точки
				this.drawCheckpoints.apply(this, arguments);
				
			};
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
			this.ctx.moveTo(P0x, P0y); // Начало линии 
			
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
				// ! рисуем точки
				this.drawCheckpoints.apply(this, arguments);
				// ! рисуем направляющие
				this.setStyle(this.config['debug-fillStyle'], this.config['debug-fillStyle'], 2);
				this.linear(P0x, P0y, arguments[2], arguments[3]);
				this.linear(arguments[2], arguments[3], P1x, P1y);
				this.setStyle();
			};
			
			return this;
		},
		cubicBezier : function(P0x, P0y, P1x, P1y, P2x, P2y, P3x, P3y) {
			
			
			var t = 0;	
			
			this.ctx.beginPath();
			this.ctx.moveTo(P0x, P0y); // Начало линии 
			
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
				// ! рисуем точки
				this.drawCheckpoints.apply(this, arguments);
				// ! рисуем направляющие
				this.setStyle(this.config['debug-fillStyle'], this.config['debug-fillStyle'], 2);
				this.linear(P0x, P0y, P1x, P1y);
				this.linear(P3x, P3y, P2x, P2y);
				this.setStyle();
			};
			
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
			this.ctx.font = this.config.font;
			this.ctx.fillText(text, x, y);
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
		execute: function() {
			this.init();
			return this;
		}
		
	});