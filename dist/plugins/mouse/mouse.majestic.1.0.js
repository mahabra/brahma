
Majestic('majestic.mouse', function() {

	Majestic.applet('mouse', {
		execute: function() {
			var that = this;
			
			$(this.elements).each(function() {
				new (function(el, masterclass) {
					this.element = el;
					this.masterclass = masterclass;
					this.status = {
						entered: false,
						hold: false,
						offsetX: 0,
						offsetY: 0
					};
					this.binds = function() {
						var that = this;

						// Начинаем следить на мышью
						$(this.element).bind('mouseenter', function(e) {
							
							that.status.entered = true;
							that.masterclass.trigger('mouseenter', [that.element, that.status, e]);
						});
						
						$(this.element).bind('mouseleave', function(e) {
							that.status.entered = false;
							that.masterclass.trigger('mouseleave', [that.element, that.status, e]);
						});
						
						$(this.element).bind('mousemove', function(e) {
							
							that.capture(e);
							if (that.status.hold) that.masterclass.trigger('drag', [that.element, that.status, e]);
							that.masterclass.trigger('mousemove', [that.element, e]);		
						});

						$(this.element).bind('mousedown', function(e) {
							that.status.hold = true;
							
							that.masterclass.trigger('mousedown', [that.element, that.status, e]);		
						});

						$(this.element).bind('mouseup', function(e) {
							that.status.hold = false;
							
							that.masterclass.trigger('mouseup', [that.element, that.status, e]);		
						});
					};
					this.capture = function(e) {
						 this.status.offsetX = e.offsetX==undefined?e.layerX:e.offsetX;
  						 this.status.offsetY = e.offsetY==undefined?e.layerY:e.offsetY;
					};
					this.binds();
				})(this, that);
			});
			
		}
	})
}, 'jquerybridge');