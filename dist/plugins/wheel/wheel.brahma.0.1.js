Brahma('brahma.wheel', function() {
	
	Brahma.applet('wheel', {
		config: {
			wheelUp: function() { },
			wheelDown: function() { }
		},
		current: {
			disable: false,
			overed: false
		},
		execute: function() {
			var that = this;
					
			(function(el) {
				
				$(el).bind('mouseenter', function() {
					that.current.overed = true;
				});
				
				$(el).bind('mouseleave', function() {
					that.current.overed = false;
				});
				
				if (window.addEventListener)
				/** DOMMouseScroll is for mozilla. */
				window.addEventListener('DOMMouseScroll', function(e) {
					
					that.wheel(el, e);
				}, false);
				
				// Fix for Chrome. Õðîì ìîæåò òîëüêî îäèí ðàç äîáàâëÿòü handler. Ïîýòîìó ìû äåëàåì òðþê è öåïëÿåì ê íîâîé ôóíêöèè-îáðàáîò÷èêó ñòàðóþ.
				if (window.onmousewheel!=null) 
				{
					var oldhandler = window.onmousewheel;
				} else {
					var oldhandler = function() {};
				}
				
				/** IE/Opera. */
				var newhandler = function(e) {
					oldhandler();
					that.wheel(el, e);
				};
				window.onmousewheel = document.onmousewheel = newhandler;
			})(this.elements);
		},
		stop : function() {
			this.current.disable = false;
		},
		go : function() {
			this.current.disable = true;
		},
		handle : function(element, delta) {
			
				if (delta>0) this.config.wheelUp(element);
				if (delta<0) this.config.wheelDown(element);
			
		},
		wheel : function(element, event) {
			
			if (this.current.overed) {
				if (this.current.disable) return false;
				 var delta = 0;
				if (!event) /* For IE. */
					event = window.event;
				if (event.wheelDelta) { /* IE/Opera. */
					delta = event.wheelDelta/120;
				} else if (event.detail) { /** Mozilla case. */
					/** In Mozilla, sign of delta is different than in IE.
					 * Also, delta is multiple of 3.
					 */
					delta = -event.detail/3;
				}
				
				/** If delta is nonzero, handle it.
				 * Basically, delta is now positive if wheel was scrolled up,
				 * and negative, if wheel was scrolled down.
				 */
				if (delta)
					this.handle(element, delta);
				/** Prevent default actions caused by mouse wheel.
				 * That might be ugly, but we handle scrolls somehow
				 * anyway, so don't bother here..
				 */
				if (event.preventDefault)
					event.preventDefault();
				event.returnValue = false;
			};
		}
	});
});