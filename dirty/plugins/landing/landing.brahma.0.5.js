Brahma("brahma.landing", function() {
	Brahma.landing = Brahma.ext.landing = function(options) { 
		"object"!=typeof options && (options=={});
		return Brahma(this).applet("landing", options);
	};

	Brahma.applet("landing", {
		config: {
			baseUrl:  "",
			filetype: 'html',
			activeColor: "rgba(22, 128, 243, 0.8)",
			hotkeys: {
				control: 17,
				hints: 16
			}
		},
		current: {
			controlVisible: false
		},
		modal: false, // Modal window
		loading: {
			almost: 0,
			left: 0
		},
		loaded: function() {
			this.loading.left--;
			
			if (this.loading.left<=0) {
				this.trigger('completed');
				this.loading.left = 0;
				this.loading.almost = 0;
			};
		},
		_screens: {},
		execute : function() {
			var plugin = this;
			// Initial global event
			Brahma.document.translateEvents(this, ['document.keydown','document.keyup']);

			// Bind
			this.bind('document.keydown', function(e) {
				switch(e.which) {
					case plugin.config.hotkeys.control:
						plugin.showControl();
						e.preventDefault();
					break;
					case plugin.config.hotkeys.hints:
						plugin.showHints();
						e.preventDefault();
					break;
				}
			});

			this.bind('document.keyup', function(e) {
				switch(e.which) {
					case plugin.config.hotkeys.control:
						plugin.hideControl();
						e.preventDefault();
					break;
					case plugin.config.hotkeys.hints:
						plugin.hideHints();
						e.preventDefault();
					break;
				}
			});

			// generate uin
			//this.uin = Brahma.document.identifiers.create('landing');
		},
		toStorage : function() {
			if (Brahma.api.isLocalStorageAvailable()) {
				
				var settings = {
					screens: {}
				};
				$.each(this._screens, function(name, data) {
					settings.screens[name] = {
						enabled: data.enabled
					}
				});
				settings.hints = {
					current: this.hints.current
				};
				console.log('save', settings);
				localStorage.setItem('brahmaLandingSettings', JSON.stringify(settings));
			};
		},
		fromStorage : function() {
			if (Brahma.api.isLocalStorageAvailable()) {
				try {
					return JSON.parse(localStorage.getItem('brahmaLandingSettings')) || false;
				} catch(e) {
					return false;
				};
			};
			return false;
		},
		showControl : function() {
			
			if (this.modal!=false) return;

			this.modal = Brahma("body").applet("overlay", {
				autoshow: false,
				panel: {
					style: {
						backgroundColor: "rgba(0,0,0,0.75)",
						"padding": "12px",
						"color": "#fff"
					}
				}
			})
			.show();
			this.buildControlMenu();
		},
		buildControlMenu : function() {
			var landing = this;
			$(this.modal.html())
			.with(function() {
				if (landing.hints.rules.length>0) {
					$(this)
					.put($('<label />'))
					.html('Sample screen:')
					.and($('<select />'))
					.bind('change click', function() {

						if ($(this).val()=='auto') {
							landing.changeHintMode(0);
						} else {
							landing.changeHintMode(parseInt($(this).val()));
						};

						
					})
					.with(function() {
						
						for (var i=0;i<landing.hints.rules.length;i++) {
							$(this).put($('<option />', {
								'value': i
							}))
							.html(landing.hints.rules[i].title || landing.hints.rules[i].width+'px')
							.condition(landing.hints.current===i, function() {
								$(this).attr("selected", true);
							});
						}
					});
				};
			})
			.put($("<ul />"))
			.css({
				'list-style': 'none',
				'margin': '0px',
				'padding': '0px'
			})
			.with(function() {
				var ul = this;
				$.each(landing._screens, function(name, data) {
					var name = name;
					$(ul).put($("<li />"))
					.css({
						'padding': "4px 12px",
						'cursor': 'pointer',
						"border-radius": "3px",
						"margin-bottom": "4px"
					})
					.html(this.name)
					.condition(this.enabled, function() {
						$(this).css({
							"background-color": landing.config.activeColor
						});
						return this;
					}, function() {
						$(this).css({
							"background-color": "transparent"
						});
						return this;
					})
					.click(function() {
						if (landing.toggleEnable(name)) {
							$(this).css({
								"background-color": landing.config.activeColor
							});
							
						} else {
							$(this).css({
								"background-color": "transparent"
							});

						};
						return false;
					});
				});
			});
		},
		/* Устанавливает фиксированное значение ширины экранов */
		changeHintMode : function(hintIndex) {
			var applet = this;
			this.hints.current = hintIndex;
			var hint = this.hints.rules[this.hints.current] || (function() { applet.hints.current=0; return {}; });

			$.each(this._screens, function(key, value) {
				if (applet.hints.current===false) {
					$(value.element).css({
						'width': ''
					});
				} else {
					$(value.element)
					.css({
						'width': hint.width+'px'
					});
				}
			});

			// rememeber
			this.toStorage();			
		},
		toggleEnable : function(name) {
			this._screens[name].enabled=this._screens[name].enabled ? false : true;
			// Add to storage
			
			this.toStorage();
			this.refresh();
			return this._screens[name].enabled;
		},
		refresh : function() {
			$.each(this._screens, function(id, data) {
				if (data.enabled) $(data.element).show();
				else $(data.element).hide();
			});

			// Test & set up hints
			// Get data from storage
			var settings = this.fromStorage();
			("object" == typeof settings.hints)
			&&
			(function(h) {
				this.hints.current = (h.current && "undefined"!=typeof this.hints.rules[h.current]) ? h.current : 0;
			}).call(this, settings.hints);

			this.changeHintMode(this.hints.current);
		},
		hideControl : function() {
			if (this.modal!=false)
			this.modal.close();
			this.modal=false;
		},
		screens : function(scrs) {
			var ds = {};

			// Get data from storage
			var settings = this.fromStorage();
			
			var defaultEnabled = false;
			
			(!settings) && ((defaultEnabled=!settings) && (settings={
				screens: {},
				hints:{
					current: false
				}
			}));

			if (scrs instanceof Array) {
				for (var i=0;i<scrs.length;i++) {
					
					ds[scrs[i]] = {
						'name': scrs[i],
						'filetype': this.config.filetype,
						'enabled': ("object" == typeof settings.screens[scrs[i]] && settings.screens[scrs[i]].enabled) ? true : ("boolean"==typeof scrs[i].enabled ? scrs[i].enabled : defaultEnabled)
					};
				};
			} else {
				for (var i in scrs) {
					ds[i] = {
						'name': "string"==typeof scrs[i].name ? scrs[i].name : i,
						'filetype': "string"==typeof scrs[i].filetype ? scrs[i].filetype : this.config.filetype,
						'enabled': (typeof "object" == typeof settings.screens[i] && settings.screens[i].enabled) ? true : ("boolean"==typeof scrs[i].enabled ? scrs[i].enabled : defaultEnabled)
					}
				}
			};
			
			this._screens = ds;
			return this;
		},
		hints : (function() { 
			var i = function(collect) {
				for (var c=0;c<collect.length;c++) {
					this.hints.rules.push(collect[c]);
				};
				
				this.hints.current = false;
				return this;
			};
			i.rules = [{
				'title': 'auto',
				'width': false
			}];
			i.current = false;
			i.visible = false;
			return i;
		})(),
		showHints : function() {

			if (this.hints.current===false || this.hints.visible) return;
			var applet = this;
			this.hints.visible = true;
			/*
			Fix width to each screen
			*/

			var hint = this.hints.rules[this.hints.current];

			$.each(this._screens, function(key, value) {
				/* Search each element and put image to this */
				var hintImageUrl = applet.config.baseUrl+'/hints/'+hint.width+'/'+value.name+'.jpg';
				var hintImg = new Image();

				$(value.element)
				.css({
					'position': 'relative',
					'margin-left': 'auto',
					'margin-right': 'auto'
				})
				.put($('<div />', {
					"class": "bh-landing-hint"
				}))
				.css({
					'position': 'absolute',
					'top': '0px',
					'left': '0px',
					'opacity': '0.5',
					'background': 'url('+hintImageUrl+') top left no-repeat transparent'
				})
				.with(function() {
					var hw = this;
					hintImg.onload = function() {
						hw.css({
							width: hintImg.width,
							height: hintImg.height
						});;
					}
				});
				hintImg.src = hintImageUrl;
			});
		},
		hideHints : function() {
			if (!this.hints.visible) return;
			this.hints.visible = false;
			// Hide hints
			$.each(this._screens, function(key, value) {
				$(value.element).css({
					'margin-left': '',
					'margin-right': '',
					'position': ''
				})
				.find('.bh-landing-hint').remove();
			});
		},
		build : function(callback) {



			// Bind completed event
			if ("function" == typeof callback) {
				this.bind("completed", callback);
			};

			var applet = this;
			var wrapper = this.elements;

			// Calc almost count
			$.each(this._screens, function() {
				applet.loading.almost++;
			});
			
			// Include
			$.each(this._screens, function(id, data) {
				var screen = $(wrapper).put($("<section />", {
					id: 'screen_'+id,
					"class": "screen "+id
				}));
				applet._screens[id].element = screen;
				
				applet.loading.left++;
				$(screen).load(applet.config.baseUrl+data.name+'.'+data.filetype, function() {
					applet.trigger("change");
					applet.loaded();
				});
			});

			this.refresh();
			return this;
		}
	});
}, ["brahma-jquerybridge", "brahma.overlay"]);