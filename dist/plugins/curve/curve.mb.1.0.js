/*!
 * miraclebush Curve Plugin
 *
 * Version 1.0.
 *
 * Released under the MIT license:

Copyright (C) 2014 Vladimir Kalmykov
*/
	
	$bush.plugin('curve', {
		options: {
				'strokeStyle': 'rgba(0,0,0,0)',
				'lineWidth': 3,
				'fillStyle': '#000000',
				'debug-fillStyle': 'rgba(255, 144, 0, 0.5)',
				'drawframe': 0.01
		},
		current: {
			debug: false,
			test: 123
		},
		init : function() {
			// Проверяем является ли объект типом Canvas
			
			if ($bush(this.elements)[0].tagName.toUpperCase() != 'CANVAS') {
				
				this.canvas = $bush(this.elements).put('<canvas />');
				
				this.canvas.css({
					'width': $bush(this.elements).width(),
					'height': $bush(this.elements).height()
				}).attr({
					'width': $bush(this.elements).width(),
					'height': $bush(this.elements).height()
				})
				
				this.canvas = this.canvas[0];
				
			} else {
				this.canvas = $bush(this.elements)[0];
			};				
			
			// Проверяем понимает ли браузер canvas
			if (this.canvas.getContext) {
				this.ctx = this.canvas.getContext('2d'); // Получаем 2D контекст
			} else {
				alert('error');
			};
			
			this.ctx.strokeStyle = this.options.strokeStyle; // Цвет обводки
			this.ctx.lineWidth = this.options.lineWidth; // Ширина линии
			this.ctx.fillStyle = this.options.fillStyle; // Цвет заливки
		},
		debug : function() {
			this.current.debug = true;
			return this;
		},
		setStyle : function(fillStyle, strokeStyle, lineweight) {
			var fillStyle = fillStyle || this.options.fillStyle;
			var strokeStyle = strokeStyle || this.options.strokeStyle;
			var lineweight = lineweight || this.options.lineWidth;
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
				
				t+=this.options.drawframe;
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
				
				t+=this.options.drawframe;
			};
			
			this.ctx.stroke();
			this.ctx.closePath();
			
			if (this.current.debug) {
				// ! рисуем точки
				this.drawCheckpoints.apply(this, arguments);
				// ! рисуем направляющие
				this.setStyle(this.options['debug-fillStyle'], this.options['debug-fillStyle'], 2);
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
				
				t+=this.options.drawframe;
			};
			
			this.ctx.lineTo(P3x, P3y);
			
			this.ctx.stroke();
			this.ctx.closePath();
			
			
			if (this.current.debug) {
				// ! рисуем точки
				this.drawCheckpoints.apply(this, arguments);
				// ! рисуем направляющие
				this.setStyle(this.options['debug-fillStyle'], this.options['debug-fillStyle'], 2);
				this.linear(P0x, P0y, P1x, P1y);
				this.linear(P3x, P3y, P2x, P2y);
				this.setStyle();
			};
			
			return this;
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