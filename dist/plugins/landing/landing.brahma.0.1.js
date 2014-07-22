Brahma("brahma.landing", function() {
	Brahma.applet("landing", {
		config: {
			baseUrl:  "",
			filetype: 'html'
		},
		screens: [],
		execute : function() {

		},
		screens : function(scrs) {
			var ds = {};
			if (scrs instanceof Array) {
				for (var i=0;i<scrs.length;i++) {
					ds[scrs[i]] = {
						'name': scrs[i],
						'filetype': this.config.filetype
					};
				};
			} else {
				for (var i in scrs) {
					ds[i] = {
						'name': "string"==typeof scrs[i].name ? scrs[i].name : i,
						'filetype': "string"==typeof scrs[i].filetype ? scrs[i].filetype : this.config.filetype
					}
				}
			};

			this.screens = ds;
			return this;
		},
		build : function() {
			var applet = this;
			var wrapper = this.elements;
			$.each(this.screens, function(id, data) {
				var screen = $(wrapper).put($("<section />", {
					id: 'screen_'+id,
					"class": "screen "+id
				}));
				
				$(screen).load(applet.config.baseUrl+data.name+'.'+data.filetype, function() {
					applet.trigger("change");
				});
			});
			return this;
		}
	});
}, ["brahma-jquerybridge"]);