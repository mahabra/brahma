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
			hotkey: 17
		},
		current: {
			controlVisible: false
		},
		modal: false, // Modal window
		_screens: {},
		execute : function() {
			var plugin = this;
			// Initial global event
			Brahma.document.translateEvents(this, ['document.keydown','document.keyup']);

			// Bind
			this.bind('document.keydown', function(e) {
				switch(e.which) {
					case plugin.config.hotkey:
						plugin.showControl();
						e.preventDefault();
					break;
				}
			});

			this.bind('document.keyup', function(e) {
				switch(e.which) {
					case plugin.config.hotkey:
						plugin.hideControl();
						e.preventDefault();
					break;
				}
			});

			// generate uin
			//this.uin = Brahma.document.identifiers.create('landing');
		},
		toStorage : function() {
			if (Brahma.api.isLocalStorageAvailable()) {
				
				var screensSettings = {};
				$.each(this._screens, function(name, data) {
					screensSettings[name] = {
						enabled: data.enabled
					}
				});
				localStorage.setItem('screensSettings', JSON.stringify(screensSettings));
			};
		},
		fromStorage : function() {
			if (Brahma.api.isLocalStorageAvailable()) {
				try {
					return JSON.parse(localStorage.getItem('screensSettings')) || false;
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
			.put($("<ul />"))
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
			
			(!settings) && ((defaultEnabled=!settings) && (settings={}));
			
			if (scrs instanceof Array) {
				for (var i=0;i<scrs.length;i++) {
					
					ds[scrs[i]] = {
						'name': scrs[i],
						'filetype': this.config.filetype,
						'enabled': ("object" == typeof settings[scrs[i]] && settings[scrs[i]].enabled) ? true : ("boolean"==typeof scrs[i].enabled ? scrs[i].enabled : defaultEnabled)
					};
				};
			} else {
				for (var i in scrs) {
					ds[i] = {
						'name': "string"==typeof scrs[i].name ? scrs[i].name : i,
						'filetype': "string"==typeof scrs[i].filetype ? scrs[i].filetype : this.config.filetype,
						'enabled': (typeof "object" == typeof settings[i] && settings[i].enabled) ? true : ("boolean"==typeof scrs[i].enabled ? scrs[i].enabled : defaultEnabled)
					}
				}
			};
			
			this._screens = ds;
			return this;
		},
		build : function() {
			var applet = this;
			var wrapper = this.elements;
			$.each(this._screens, function(id, data) {
				var screen = $(wrapper).put($("<section />", {
					id: 'screen_'+id,
					"class": "screen "+id
				}));
				applet._screens[id].element = screen;
				$(screen).load(applet.config.baseUrl+data.name+'.'+data.filetype, function() {
					applet.trigger("change");
				});
			});

			this.refresh();
			return this;
		}
	});
}, ["brahma-jquerybridge", "brahma.overlay"]);