/* !attention: HTML5 only */
$bush.url = {
	set : function(url, title, args) {
		
		window.history.pushState((args || null), (title || null), (url || null));
	},
	edit : function(url, title, args) {
		
		window.history.replaceState((args || null), (title || null), (url || null));
	},
	title : function() {
		
	},
	popstate : function(callback) { // �������� history back / forth
		var callback = callback;
		$(window).bind("popstate", function(e) {
			
			callback(location.pathname, location);
		});	
	},
	depatch : function(link, prefix, sufix) {
		var link = link;
		var prefix = prefix || '';
		var sufix = sufix || '';
		var pathname = link;
		if (pathname.substring(0, prefix.length)==prefix) pathname = pathname.substring(prefix.length, pathname.length);
		
		if (pathname.substring(pathname.length-sufix.length)==sufix) pathname = pathname.substring(0, pathname.length-sufix.length);
		return pathname;
	},
	patch : function(link, prefix, sufix) {
		var prefix = prefix || '';
		var sufix = sufix || '';
		this.depatch(link,prefix,sufix);
		return prefix+link+sufix;
	}
};