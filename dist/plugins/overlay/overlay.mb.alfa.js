window.$bush.plugin('overlay',
{
	context : null,
	wrappers : {
		content : null
	},
	execute : function() {	
		
		this.context = this.getContext();
		this.newOverlay(this.context);
		this.appendContent();
		this.show();
		return this;
	},
	getContext : function() {
		try {
			var tagName = $(this.elements)[0].tagName.strToLower();
		} catch(e) {
			var tagName = false;
		};
		switch(tagName) {
			case 'body':
				return $($(this.elements)[0]);
			break;
			default:
				if ($(this.elements)[0]==document) {
					return $('body');
				} else {
					return $('body');
				};
			break;
		}
	},
	newOverlay : function(context) {
		var plugin = this;
		// > get Zindex
		var zindex = $bush.document.zindex.get();
		
		// > build Nodes
		this.wrappers.overlay = $(context).put($('<div />', {
			'class': 'mb-plugin-overlay'
		}))
		.css({
			'width': '100%',
			'height': '100%',
			'position': 'fixed',
			'top': '0px',
			'left': '0px',
			'backgroundColor': 'none',
			'backgroundImage': 'none',
			'display': 'none',
			'z-index': zindex
		});
		// > build first TABLE
		var table = $(this.wrappers.overlay).put($('<table />', {
			'cellspacing': 0, 
			'cellpadding': 0
		}))
		.css({
			'height': '100%',
			'margin': '0 auto'
		})
		.ramp($('<tbody />'), $('<tr />'))
		.put($('<td />'))
		.css({
			'height': '1%'
		})
		.and($('<td />'))
		.css({
			'height': '100%'
		})
		.tie(function() {
			plugin.wrappers.content = $(this).put($('<div />'));
		})
		.and($('<td />'))
		.css({
			'height': '1%'
		});
	},
	show : function() {
		$(this.wrappers.overlay).show();
	},
	appendContent : function() {
		var plugin = this;
		// > append static content
		if (typeof this.options.html == 'string') {
			this.wrappers.content.html(this.options.html);
			plugin.trigger('ready', [this.wrappers.content]);
		};
		// > append url request data
		if (typeof this.options.url == 'string') $(this.wrappers.content).load(this.options.url, function() {
			plugin.trigger('ready', [plugin.wrappers.content]);
		});
		return this;
	},
	remove : function() {
		$(this.wrappers.content).remove();
		$(this.wrappers.overlay).remove();
		this.destroy();
	},
	destroy : function() {
		$.each(this, function() {
			
			delete this;
		});
	}
});