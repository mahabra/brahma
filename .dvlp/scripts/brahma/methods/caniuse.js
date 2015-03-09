Brahma.caniuse = function(test) {
	if (Brahma.caniuse.info[test] && "function"===typeof Brahma.caniuse.info[test]) Brahma.caniuse.info[test] = Brahma.caniuse.info[test]();
	if (Brahma.caniuse.info[test]) return Brahma.caniuse.info[test]; else return false;
};
Brahma.caniuse.info = {
    /* dataset - определяет возможность использования dataset для получения аргументов data-* */
	"dataset": (typeof document.createElement('div').dataset !== "undefined"),
    /* translate3D - определяет возможность использования translate3D */
	"translate3D": function() {
		// https://gist.github.com/dryan/738720
		// borrowed from modernizr
		var div = document.createElement('div'),
			ret = false,
			properties = ['perspectiveProperty', 'WebkitPerspective'];
		for (var i = properties.length - 1; i >= 0; i--){
			ret = ret ? ret : div.style[properties[i]] != undefined;
		};
        
        // webkit has 3d transforms disabled for chrome, though
        //   it works fine in safari on leopard and snow leopard
        // as a result, it 'recognizes' the syntax and throws a false positive
        // thus we must do a more thorough check:
        if (ret){
            var st = document.createElement('style');
            // webkit allows this media query to succeed only if the feature is enabled.    
            // "@media (transform-3d),(-o-transform-3d),(-moz-transform-3d),(-ms-transform-3d),(-webkit-transform-3d),(modernizr){#modernizr{height:3px}}"
            st.textContent = '@media (-webkit-transform-3d){#test3d{height:3px}}';
            document.getElementsByTagName('head')[0].appendChild(st);
            div.id = 'test3d';
            document.body.appendChild(div);
            
            ret = div.offsetHeight === 3;
            
            st.parentNode.removeChild(st);
            div.parentNode.removeChild(div);
        }
        return ret;
	},
    "mobile": function() {
        var check = false;
        var i = 0,
         iOS = false,
         iDevice = ['iPad', 'iPhone', 'iPod'];


        for (;i < iDevice.length ; i++ ) {
            if( navigator.platform === iDevice[i] ){ return true; break; }
        }
        (function(a,b){if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(a))check = true})(navigator.userAgent||navigator.vendor||window.opera);
        
        return check;
    }
};