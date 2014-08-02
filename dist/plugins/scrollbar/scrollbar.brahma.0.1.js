Brahma('brahma.scrollbar', function() {
	Brahma.applet('scrollbar', {
		config : {
			'runnerType': 'fixed',
			'runnerStyle': {
				'background': '#626262'
			},
			'railStyle': {
				'background': 'rgba(242,242,242,0.2)'
			},
			'runnerHeight': 8,
			'wheelStep': 40,
			'runnerDefaultPosition': 0
		},
		execute : function(obj) {
			this.obj = this.elements;
			this.wrappers = {};
			
			this.options = {};
			this.options.draggerActivate = false; 		this.options.dreggerDownPos = 0; 		this.options.currenPositionPx = 0; 		
			this.options.runner = {
				height: 6
			};
			this.options.rail = {
				runnerarea: 0
			};
			this.options.disabled = false; 		this.options.needtodisable = false;
			this.options.needtoenabled = false;
			this.options.areaHeight = 0;
			
					if(!document.addEventListener) {
				
				if ("string" == typeof this.config.railStyle.background && this.config.railStyle.background.indexOf('rgba')==0) this.config.railStyle.background = this.config.railStyle.background.replace(/^rgba\(([0-9]{1,3},[0-9]{1,3},[0-9]{1,3}),[0-9\.]*\)/g, 'rgb($1)');
				if ("string" == typeof this.config.railStyle['background-color'] && this.config.railStyle['background-color'].indexOf('rgba')==0) this.config.railStyle['background-color'] = this.config.railStyle['background-color'].replace(/^rgba\(([0-9]{1,3},[0-9]{1,3},[0-9]{1,3}),[0-9\.]*\)/g, 'rgb($1)');
				
				if ("string" == typeof this.config.runnerStyle.background && this.config.runnerStyle.background.indexOf('rgba')==0) this.config.runnerStyle.background = this.config.runnerStyle.background.replace(/^rgba\(([0-9]{1,3},[0-9]{1,3},[0-9]{1,3}),[0-9\.]*\)/g, 'rgb($1)');
				if ("string" == typeof this.config.runnerStyle['background-color'] && this.config.runnerStyle['background-color'].indexOf('rgba')==0) this.config.runnerStyle['background-color'] = this.config.runnerStyle['background-color'].replace(/^rgba\(([0-9]{1,3},[0-9]{1,3},[0-9]{1,3}),[0-9\.]*\)/g, 'rgb($1)');
			};
			
			this.content = this.obj;
			this.build();
			this.calculates();
			this.addeventes();
		},
		build : function() {
			this.wrappers.main = $(this.obj).wrap($("<div />", {
				'class': 'jair-ui-scroll-root'
			}).css({
				//'width': '100%', // disabled (need test in different situations)
				'display': 'table',
				'position': 'relative'
			})).parent();
			
						this.wrappers.marginableElement = $(this.obj).css({
				'float': 'left',
				'width': this.options.areaWidth
			});
						
			this.options.areaHeight = $(this.obj).height();		
			
			this.options.areaWidth = $(this.obj).width();	

			
			this.wrappers.clipWrapper = $(this.obj).wrap($("<div />", {
				'class': 'jair-ui-scroll-clip'
			}).css({
				'overflow': 'hidden',
				'height': this.options.areaHeight+'px'
			}));
			
			$(this.obj).css({
				'height': 'auto'
			});
			
			
			Brahma.api.disableselection($(this.wrappers.main).css({
				'padding-right': '+10px',
				'overflow': 'visible',
				'background': 'transparent',
				'border': '0px',
				'margin': '0px',
				'position': ( ($(this.obj).css('position')=='absolute' || $(this.obj).css('position')=='fixed' ) ? $(this.obj).css('position') : 'relative')
			}));
			
			
			this.wrappers.s_wrappar = $("<div />", {
				"class": "y"
			}).appendTo($(this.wrappers.main))
			.css({
				'position': 'absolute',
				'top': '0px',
				'right': '0px',
				'width': '11px',
				'height': this.options.areaHeight+'px',
				'background': 'transparent'
			});
				
			this.options.s_height = $(this.wrappers.s_wrappar).height()-2;
			
			/* ! build runner */
			this.wrappers.s_rail = $("<div />").appendTo(this.wrappers.s_wrappar)
			.css(Brahma.api.extend({
				'height'	: '100%',
				'width'		: '8px',
				'margin'	: '0 auto',
				'border-radius'		: '0px 3px 3px 0px',
				'position': 'relative'
			}, this.config.railStyle));
			
			this.wrappers.s_runner = $("<div />").appendTo(this.wrappers.s_rail)
			.css(Brahma.api.extend({
				'width': '8px',
				'height': '8px',
				'border-radius'		: '4px',
				'position': 'absolute'
			}, this.config.runnerStyle));
			
			$(this.wrappers.marginableElement).css({
				'top': '0px'
			});
			
			/* add focus for main object after builds */
			$(this.obj).focus();

		},		
		calculates : function() {
			var that = this;
			
						this.options.fullheight = 0;
			
			
			var areaheight = this.options.areaHeight;
			
			var railHeight = $(this.wrappers.s_rail).height();
			
			$(this.wrappers.clipWrapper).find('>*:visible').each(function() {
				that.options.fullheight += $(this).outerHeight();
			});
			
						
			if (that.options.fullheight<=areaheight) {		
								
				if (!this.options.disabled) this.options.needtodisable = true; 			} else {
					
				if (this.options.disabled) this.options.needtoenabled = true; 			}
			
						this.options.overflow = this.options.fullheight-areaheight;
			
			
						
			switch(this.config.runnerType) {
				case 'classic':
					
					this.options.runner.height = railHeight*(areaheight/this.options.fullheight);
					if (this.options.runner.height>=railHeight) {
						this.options.runner.height = railHeight;
					} else {
						
					}
				break;
				case 'fixed':
					this.options.runner.height = this.config.runnerHeight;
				break;
			}
			
						this.options.rail.runnerarea = (this.options.s_height-this.options.runner.height);
			
			this.rebuild();
		},
		rebuild : function() {
				
			$(this.wrappers.s_runner).css({
				'height': this.options.runner.height+'px',
				'background-color'	: this.config.runnerColor
			});
			
			if (this.options.needtodisable) {
				this.disable();
				
			} else if(this.options.needtoenabled) {
				this.enable();
				
			} else {
				this.setPosition();
			};
			
		},
		disable : function() {
			
			this.setPosition(0);
			this.options.needtodisable = false;
			this.options.disabled = true;
			
			$(this.wrappers.s_runner).hide();
		},
		enable : function() {
			this.options.needtoenabled = false;
			this.options.disabled = false;
			this.setPosition(this.config.runnerDefaultPosition);
			$(this.wrappers.s_runner).show();
		},
		refresh : function() {
			
			this.calculates();
		},	
		down : function() {
			this.setPosition(1);
		},
		scrollUp : function() {
			if (this.disabled) return;
			this.move(this.config.wheelStep*-1);
		},	
		scrollDown : function(absolute) {
			var absolute = absolute || false;
			if (absolute) {
				this.setPosition(1, false);
			} else {
				if (this.disabled) return;
				this.move(this.config.wheelStep);
			};
		},	
		move : function(dif) {
			if ((dif>0) && ((this.options.currenPositionPx+dif)>(this.options.overflow-(dif)))) {
				var p = 1;
				
			} else if ((dif<0) && ((this.options.currenPositionPx+dif)<=(dif))) {
				var p = 0;
				
			} else {
				var p = (this.options.currenPositionPx+dif)/this.options.overflow;
			};	
			this.setPosition(p, false);
		},	
		addeventes : function() {
			var that = this;
			
			// Listen for wheel
			Brahma(this.wrappers.clipWrapper).applet('wheel', {
				wheelUp: function() {
					that.scrollUp();
				},
				wheelDown: function() {
					that.scrollDown();
				}
			});
			
			// Listen for mouse
			$('body').bind('mousemove', function(eventObject) {
			
				if (this.disabled) return;
				if (that.options.draggerActivate) {
					
					that.changePosition(that.options.draggerPagePos-eventObject.clientY);
				}
				return false;
			});

			$('body').bind('mouseup', function(eventObject) {
				if (this.disabled) return;
				if (that.options.draggerActivate) {
					that.options.dreggerDownPos = that.options.dreggerDownPos-(that.options.draggerPagePos-eventObject.clientY);
					that.options.draggerActivate = false;
				}
				return false;
			});
			
			$(this.wrappers.s_wrappar)
			.bind('mousedown', function(eventObject) {
				
				if (this.disabled) return;
				
				var y = eventObject.offsetY==undefined?eventObject.originalEvent.layerY:eventObject.offsetY;
				
				that.setPosition(y/that.options.s_height);
				
				
				
				that.options.dreggerDownPos = y;
				that.options.draggerPagePos = eventObject.clientY;
				that.options.draggerActivate = true;
				
				eventObject.preventDefault();
				eventObject.stopPropagation();
				
				return false;
				
			});
			
			$(this.wrappers.s_runner).bind('mousedown', function(eventObject) {
				if (this.disabled) return;
				that.options.draggerPagePos = eventObject.clientY;
				that.options.draggerActivate = true;
				
				eventObject.preventDefault();
				eventObject.stopPropagation();
				
				return false;
				
			});

			// Listen for window
			Brahma.document.translateEvents(this, ["window.resize"]);

			// Listen for window resize
			this.bind('window.resize', function() {
				that.refresh();
			});
		},	
		setPosition : function(perc, animate) {
			
			if (typeof(animate) == 'undefined') animate = true;
			if (this.options.disabled) perc = 0;
			if (typeof(perc)=='undefined') perc = false;
			if (perc===false) {
				
								if ( (this.options.currenPositionPx>=this.options.overflow) && !this.options.disabled) {
					
					perc = 1;
				} else {
					return;
				}
			}
			
			this.options.currentPosition = perc;
			
			
			
			if (this.options.currentPosition>1) this.options.currentPosition = 1;
			if (this.options.currentPosition<0) this.options.currentPosition = 0;
			
			
						if (animate) {
				
				$(this.wrappers.s_runner).animate({
					'top': (this.options.rail.runnerarea*this.options.currentPosition)+'px'
				}, 100);
			} else {
				
				$(this.wrappers.s_runner).css({
					'top': (this.options.rail.runnerarea*this.options.currentPosition)+'px'
				});
			};	
			this.setAreaScroll(this.options.currentPosition, animate);
		},
		changePosition : function(dif) {
			this.options.currentPosition = (this.options.dreggerDownPos-dif)/(this.options.rail.runnerarea);
			if (this.options.currentPosition>1) this.options.currentPosition = 1;
			if (this.options.currentPosition<0) this.options.currentPosition = 0;
			
			
			$(this.wrappers.s_runner).css("top", (this.options.rail.runnerarea*this.options.currentPosition)+'px');
			
			this.setAreaScroll(this.options.currentPosition);
		},
		setAreaScroll : function(perc, animate) {
			
			var animate = animate || false;
			this.options.currenPositionPx = this.options.currentPosition*this.options.overflow;
			
			
			if (animate) 
			$(this.wrappers.marginableElement).animate({
				"margin-top": (this.options.currenPositionPx*-1)+'px'
			}, '100');
			else  {
				$(this.wrappers.marginableElement).css({"margin-top": (this.options.currenPositionPx*-1)+'px'});
				
			};
		}
	});
},['brahma-jquerybridge','brahma-disableselection','brahma.wheel']);