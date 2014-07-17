Brahma('brahma.mouse', function() {
	
	Brahma.applet('mouse', {
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
						offsetY: 0,
						x:0,
						y:0
					};
					this.binds = function() {
						
						var that = this;

						// Начинаем следить на мышью
						$(this.element).bind('mouseenter', function(e) {
							//if (e.target!=e.currentTarget) return;
							if (that.status.entered) return;
							e.stopPropagation();

							that.status.entered = true;
							that.masterclass.trigger('enter', [that.element, that.status, e]);
						});
						
						$(this.element).bind('mouseleave', function(e) {
							if (e.target!=e.currentTarget) return;
							e.stopPropagation();
							
							that.status.entered = false;
							that.masterclass.trigger('leave', [that.element, that.status, e]);
						});
						
						$(this.element).bind('mousemove', function(e) {
							that.capture(e, this);
							if (!that.status.entered) {
								that.masterclass.trigger('enter', [that.element, that.status, e]);
								that.status.entered = true;
							};
							if (that.status.hold) that.masterclass.trigger('drag', [that.element, that.status, e]);
							that.masterclass.trigger('move', [that.element, that.status, e]);		
						});

						$(this.element).bind('mousedown', function(e) {
							that.status.hold = true;
							
							that.masterclass.trigger('down', [that.element, that.status, e]);		
						});

						$(this.element).bind('mouseup', function(e) {
							that.status.hold = false;
							
							that.masterclass.trigger('up', [that.element, that.status, e]);		
						});
					};
					this.capture = function(e, el) {
						/* In case that offsetX target can be child element we ignore e.offset* and calc e.clien* - offset.left */
						/* Another reason is FF, that hates offsetX,offsetY by the nature */
						
						if ((e.offsetX==undefined || e.offsetY==undefined) || e.currentTarget!=e.target) {
							
							var offset = $(this.element).offset();
							var offsetX = e.pageX-offset.left;
							var offsetY = e.pageY-offset.top;
							
						} else {
							
							var offsetX = e.offsetX;
							var offsetY = e.offsetY;
						};
						
						this.status.x = offsetX;
  						 this.status.y = offsetY;
					};
					this.binds();
				})(this, that);
			});
			
		}
	})
}, 'brahma-jquerybridge');