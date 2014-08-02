Brahma('brahma-disableselection', function() {
	
	if (navigator.userAgent.indexOf('Mozilla') != -1) {
        Brahma.api.disableselection = function() {
            return $(this).each(function() {
               $(this).css({
                    'MozUserSelect' : 'none'
                });
            });
        };
        window.Brahma.api.enableselection = function() {
            return $(this).each(function() {
                $(this).css({
                    'MozUserSelect' : ''
                });
            });
        };
    } else if (navigator.userAgent.indexOf('IE') != -1) {
       Brahma.api.disableselection = function() {
            return $(this).each(function() {
                $(this).bind('selectstart.disableTextSelect', function() {
                    return false;
                });
            });
        };
        window.Brahma.api.enableselection = function() {
            return $(this).each(function() {
               $(this).unbind('selectstart.disableTextSelect');
            });
        };
    } else {
        Brahma.api.disableselection = function() {
            return $(this).each(function() {
                $(this).bind('mousedown.disableTextSelect', function() {
                    return false;
                });
            });
        };
       window.Brahma.api.enableselection = function() {
            return $(this).each(function() {
                $(this).unbind('mousedown.disableTextSelect');
            });
        };
    };
}, ['brahma-jquerybridge']);