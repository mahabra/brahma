/* !attention: HTML5 only */
$bush.url = {
	set : function(url) {
		window.history.pushState(null, null, url);
	},
	popstate : function(callback) { // Перехват history back / forth
		var callback = callback;
		$(window).bind("popstate", function(e) {
			
			callback(location.pathname, location);
		});	
	}
};