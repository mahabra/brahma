
Brahma('brahma.transit', function() {
	/*!
	 * jQuery Transit - CSS3 transitions and transformations
	 * (c) 2011-2012 Rico Sta. Cruz <rico@ricostacruz.com>
	 * MIT Licensed.
	 *
	 * http://ricostacruz.com/jquery.transit
	 * http://github.com/rstacruz/jquery.transit
	 */

	(function($) {

	  $.transit = {
	    version: "0.9.9",

	    // Map of $.css() keys to values for 'transitionProperty'.
	    // See https://developer.mozilla.org/en/CSS/CSS_transitions#Properties_that_can_be_animated
	    propertyMap: {
	      marginLeft    : 'margin',
	      marginRight   : 'margin',
	      marginBottom  : 'margin',
	      marginTop     : 'margin',
	      paddingLeft   : 'padding',
	      paddingRight  : 'padding',
	      paddingBottom : 'padding',
	      paddingTop    : 'padding'
	    },

	    // Will simply transition "instantly" if false
	    enabled: true,

	    // Set this to false if you don't want to use the transition end property.
	    useTransitionEnd: false
	  };

	  var div = document.createElement('div');
	  var support = {};

	  // Helper function to get the proper vendor property name.
	  // (`transition` => `WebkitTransition`)
	  function getVendorPropertyName(prop) {
	    // Handle unprefixed versions (FF16+, for example)
	    if (prop in div.style) return prop;

	    var prefixes = ['Moz', 'Webkit', 'O', 'ms'];
	    var prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);

	    if (prop in div.style) { return prop; }

	    for (var i=0; i<prefixes.length; ++i) {
	      var vendorProp = prefixes[i] + prop_;
	      if (vendorProp in div.style) { return vendorProp; }
	    }
	  }

	  // Helper function to check if transform3D is supported.
	  // Should return true for Webkits and Firefox 10+.
	  function checkTransform3dSupport() {
	    div.style[support.transform] = '';
	    div.style[support.transform] = 'rotateY(90deg)';
	    return div.style[support.transform] !== '';
	  }

	  var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

	  // Check for the browser's transitions support.
	  support.transition      = getVendorPropertyName('transition');
	  support.transitionDelay = getVendorPropertyName('transitionDelay');
	  support.transform       = getVendorPropertyName('transform');
	  support.transformOrigin = getVendorPropertyName('transformOrigin');
	  support.transform3d     = checkTransform3dSupport();

	  var eventNames = {
	    'transition':       'transitionEnd',
	    'MozTransition':    'transitionend',
	    'OTransition':      'oTransitionEnd',
	    'WebkitTransition': 'webkitTransitionEnd',
	    'msTransition':     'MSTransitionEnd'
	  };

	  // Detect the 'transitionend' event needed.
	  var transitionEnd = support.transitionEnd = eventNames[support.transition] || null;

	  // Populate jQuery's `$.support` with the vendor prefixes we know.
	  // As per [jQuery's cssHooks documentation](http://api.jquery.com/jQuery.cssHooks/),
	  // we set $.support.transition to a string of the actual property name used.
	  for (var key in support) {
	    if (support.hasOwnProperty(key) && typeof $.support[key] === 'undefined') {
	      $.support[key] = support[key];
	    }
	  }

	  // Avoid memory leak in IE.
	  div = null;

	  // ## $.cssEase
	  // List of easing aliases that you can use with `$.fn.transition`.
	  $.cssEase = {
	    '_default':       'ease',
	    'in':             'ease-in',
	    'out':            'ease-out',
	    'in-out':         'ease-in-out',
	    'snap':           'cubic-bezier(0,1,.5,1)',
	    // Penner equations
	    'easeOutCubic':   'cubic-bezier(.215,.61,.355,1)',
	    'easeInOutCubic': 'cubic-bezier(.645,.045,.355,1)',
	    'easeInCirc':     'cubic-bezier(.6,.04,.98,.335)',
	    'easeOutCirc':    'cubic-bezier(.075,.82,.165,1)',
	    'easeInOutCirc':  'cubic-bezier(.785,.135,.15,.86)',
	    'easeInExpo':     'cubic-bezier(.95,.05,.795,.035)',
	    'easeOutExpo':    'cubic-bezier(.19,1,.22,1)',
	    'easeInOutExpo':  'cubic-bezier(1,0,0,1)',
	    'easeInQuad':     'cubic-bezier(.55,.085,.68,.53)',
	    'easeOutQuad':    'cubic-bezier(.25,.46,.45,.94)',
	    'easeInOutQuad':  'cubic-bezier(.455,.03,.515,.955)',
	    'easeInQuart':    'cubic-bezier(.895,.03,.685,.22)',
	    'easeOutQuart':   'cubic-bezier(.165,.84,.44,1)',
	    'easeInOutQuart': 'cubic-bezier(.77,0,.175,1)',
	    'easeInQuint':    'cubic-bezier(.755,.05,.855,.06)',
	    'easeOutQuint':   'cubic-bezier(.23,1,.32,1)',
	    'easeInOutQuint': 'cubic-bezier(.86,0,.07,1)',
	    'easeInSine':     'cubic-bezier(.47,0,.745,.715)',
	    'easeOutSine':    'cubic-bezier(.39,.575,.565,1)',
	    'easeInOutSine':  'cubic-bezier(.445,.05,.55,.95)',
	    'easeInBack':     'cubic-bezier(.6,-.28,.735,.045)',
	    'easeOutBack':    'cubic-bezier(.175, .885,.32,1.275)',
	    'easeInOutBack':  'cubic-bezier(.68,-.55,.265,1.55)'
	  };

	  // ## 'transform' CSS hook
	  // Allows you to use the `transform` property in CSS.
	  //
	  //     $("#hello").css({ transform: "rotate(90deg)" });
	  //
	  //     $("#hello").css('transform');
	  //     //=> { rotate: '90deg' }
	  //
	  $.cssHooks['transit:transform'] = {
	    // The getter returns a `Transform` object.
	    get: function(elem) {
	      return $(elem).data('transform') || new Transform();
	    },

	    // The setter accepts a `Transform` object or a string.
	    set: function(elem, v) {
	      var value = v;

	      if (!(value instanceof Transform)) {
	        value = new Transform(value);
	      }

	      // We've seen the 3D version of Scale() not work in Chrome when the
	      // element being scaled extends outside of the viewport.  Thus, we're
	      // forcing Chrome to not use the 3d transforms as well.  Not sure if
	      // translate is affectede, but not risking it.  Detection code from
	      // http://davidwalsh.name/detecting-google-chrome-javascript
	      if (support.transform === 'WebkitTransform' && !isChrome) {
	        elem.style[support.transform] = value.toString(true);
	      } else {
	        elem.style[support.transform] = value.toString();
	      }

	      $(elem).data('transform', value);
	    }
	  };

	  // Add a CSS hook for `.css({ transform: '...' })`.
	  // In jQuery 1.8+, this will intentionally override the default `transform`
	  // CSS hook so it'll play well with Transit. (see issue #62)
	  $.cssHooks.transform = {
	    set: $.cssHooks['transit:transform'].set
	  };

	  // jQuery 1.8+ supports prefix-free transitions, so these polyfills will not
	  // be necessary.
	  if ($.fn.jquery < "1.8") {
	    // ## 'transformOrigin' CSS hook
	    // Allows the use for `transformOrigin` to define where scaling and rotation
	    // is pivoted.
	    //
	    //     $("#hello").css({ transformOrigin: '0 0' });
	    //
	    $.cssHooks.transformOrigin = {
	      get: function(elem) {
	        return elem.style[support.transformOrigin];
	      },
	      set: function(elem, value) {
	        elem.style[support.transformOrigin] = value;
	      }
	    };

	    // ## 'transition' CSS hook
	    // Allows you to use the `transition` property in CSS.
	    //
	    //     $("#hello").css({ transition: 'all 0 ease 0' });
	    //
	    $.cssHooks.transition = {
	      get: function(elem) {
	        return elem.style[support.transition];
	      },
	      set: function(elem, value) {
	        elem.style[support.transition] = value;
	      }
	    };
	  }

	  // ## Other CSS hooks
	  // Allows you to rotate, scale and translate.
	  registerCssHook('scale');
	  registerCssHook('translate');
	  registerCssHook('rotate');
	  registerCssHook('rotateX');
	  registerCssHook('rotateY');
	  registerCssHook('rotate3d');
	  registerCssHook('perspective');
	  registerCssHook('skewX');
	  registerCssHook('skewY');
	  registerCssHook('x', true);
	  registerCssHook('y', true);

	  // ## Transform class
	  // This is the main class of a transformation property that powers
	  // `$.fn.css({ transform: '...' })`.
	  //
	  // This is, in essence, a dictionary object with key/values as `-transform`
	  // properties.
	  //
	  //     var t = new Transform("rotate(90) scale(4)");
	  //
	  //     t.rotate             //=> "90deg"
	  //     t.scale              //=> "4,4"
	  //
	  // Setters are accounted for.
	  //
	  //     t.set('rotate', 4)
	  //     t.rotate             //=> "4deg"
	  //
	  // Convert it to a CSS string using the `toString()` and `toString(true)` (for WebKit)
	  // functions.
	  //
	  //     t.toString()         //=> "rotate(90deg) scale(4,4)"
	  //     t.toString(true)     //=> "rotate(90deg) scale3d(4,4,0)" (WebKit version)
	  //
	  function Transform(str) {
	    if (typeof str === 'string') { this.parse(str); }
	    return this;
	  }

	  Transform.prototype = {
	    // ### setFromString()
	    // Sets a property from a string.
	    //
	    //     t.setFromString('scale', '2,4');
	    //     // Same as set('scale', '2', '4');
	    //
	    setFromString: function(prop, val) {
	      var args =
	        (typeof val === 'string')  ? val.split(',') :
	        (val.constructor === Array) ? val :
	        [ val ];

	      args.unshift(prop);

	      Transform.prototype.set.apply(this, args);
	    },

	    // ### set()
	    // Sets a property.
	    //
	    //     t.set('scale', 2, 4);
	    //
	    set: function(prop) {
	      var args = Array.prototype.slice.apply(arguments, [1]);
	      if (this.setter[prop]) {
	        this.setter[prop].apply(this, args);
	      } else {
	        this[prop] = args.join(',');
	      }
	    },

	    get: function(prop) {
	      if (this.getter[prop]) {
	        return this.getter[prop].apply(this);
	      } else {
	        return this[prop] || 0;
	      }
	    },

	    setter: {
	      // ### rotate
	      //
	      //     .css({ rotate: 30 })
	      //     .css({ rotate: "30" })
	      //     .css({ rotate: "30deg" })
	      //     .css({ rotate: "30deg" })
	      //
	      rotate: function(theta) {
	        this.rotate = unit(theta, 'deg');
	      },

	      rotateX: function(theta) {
	        this.rotateX = unit(theta, 'deg');
	      },

	      rotateY: function(theta) {
	        this.rotateY = unit(theta, 'deg');
	      },

	      // ### scale
	      //
	      //     .css({ scale: 9 })      //=> "scale(9,9)"
	      //     .css({ scale: '3,2' })  //=> "scale(3,2)"
	      //
	      scale: function(x, y) {
	        if (y === undefined) { y = x; }
	        this.scale = x + "," + y;
	      },

	      // ### skewX + skewY
	      skewX: function(x) {
	        this.skewX = unit(x, 'deg');
	      },

	      skewY: function(y) {
	        this.skewY = unit(y, 'deg');
	      },

	      // ### perspectvie
	      perspective: function(dist) {
	        this.perspective = unit(dist, 'px');
	      },

	      // ### x / y
	      // Translations. Notice how this keeps the other value.
	      //
	      //     .css({ x: 4 })       //=> "translate(4px, 0)"
	      //     .css({ y: 10 })      //=> "translate(4px, 10px)"
	      //
	      x: function(x) {
	        this.set('translate', x, null);
	      },

	      y: function(y) {
	        this.set('translate', null, y);
	      },

	      // ### translate
	      // Notice how this keeps the other value.
	      //
	      //     .css({ translate: '2, 5' })    //=> "translate(2px, 5px)"
	      //
	      translate: function(x, y) {
	        if (this._translateX === undefined) { this._translateX = 0; }
	        if (this._translateY === undefined) { this._translateY = 0; }

	        if (x !== null && x !== undefined) { this._translateX = unit(x, 'px'); }
	        if (y !== null && y !== undefined) { this._translateY = unit(y, 'px'); }

	        this.translate = this._translateX + "," + this._translateY;
	      }
	    },

	    getter: {
	      x: function() {
	        return this._translateX || 0;
	      },

	      y: function() {
	        return this._translateY || 0;
	      },

	      scale: function() {
	        var s = (this.scale || "1,1").split(',');
	        if (s[0]) { s[0] = parseFloat(s[0]); }
	        if (s[1]) { s[1] = parseFloat(s[1]); }

	        // "2.5,2.5" => 2.5
	        // "2.5,1" => [2.5,1]
	        return (s[0] === s[1]) ? s[0] : s;
	      },

	      rotate3d: function() {
	        var s = (this.rotate3d || "0,0,0,0deg").split(',');
	        for (var i=0; i<=3; ++i) {
	          if (s[i]) { s[i] = parseFloat(s[i]); }
	        }
	        if (s[3]) { s[3] = unit(s[3], 'deg'); }

	        return s;
	      }
	    },

	    // ### parse()
	    // Parses from a string. Called on constructor.
	    parse: function(str) {
	      var self = this;
	      str.replace(/([a-zA-Z0-9]+)\((.*?)\)/g, function(x, prop, val) {
	        self.setFromString(prop, val);
	      });
	    },

	    // ### toString()
	    // Converts to a `transition` CSS property string. If `use3d` is given,
	    // it converts to a `-webkit-transition` CSS property string instead.
	    toString: function(use3d) {
	      var re = [];

	      for (var i in this) {
	        if (this.hasOwnProperty(i)) {
	          // Don't use 3D transformations if the browser can't support it.
	          if ((!support.transform3d) && (
	            (i === 'rotateX') ||
	            (i === 'rotateY') ||
	            (i === 'perspective') ||
	            (i === 'transformOrigin'))) { continue; }

	          if (i[0] !== '_') {
	            if (use3d && (i === 'scale')) {
	              re.push(i + "3d(" + this[i] + ",1)");
	            } else if (use3d && (i === 'translate')) {
	              re.push(i + "3d(" + this[i] + ",0)");
	            } else {
	              re.push(i + "(" + this[i] + ")");
	            }
	          }
	        }
	      }

	      return re.join(" ");
	    }
	  };

	  function callOrQueue(self, queue, fn) {
	    if (queue === true) {
	      self.queue(fn);
	    } else if (queue) {
	      self.queue(queue, fn);
	    } else {
	      fn();
	    }
	  }

	  // ### getProperties(dict)
	  // Returns properties (for `transition-property`) for dictionary `props`. The
	  // value of `props` is what you would expect in `$.css(...)`.
	  function getProperties(props) {
	    var re = [];

	    $.each(props, function(key) {
	      key = $.camelCase(key); // Convert "text-align" => "textAlign"
	      key = $.transit.propertyMap[key] || $.cssProps[key] || key;
	      key = uncamel(key); // Convert back to dasherized

	      if ($.inArray(key, re) === -1) { re.push(key); }
	    });

	    return re;
	  }

	  // ### getTransition()
	  // Returns the transition string to be used for the `transition` CSS property.
	  //
	  // Example:
	  //
	  //     getTransition({ opacity: 1, rotate: 30 }, 500, 'ease');
	  //     //=> 'opacity 500ms ease, -webkit-transform 500ms ease'
	  //
	  function getTransition(properties, duration, easing, delay) {
	    // Get the CSS properties needed.
	    var props = getProperties(properties);

	    // Account for aliases (`in` => `ease-in`).
	    if ($.cssEase[easing]) { easing = $.cssEase[easing]; }

	    // Build the duration/easing/delay attributes for it.
	    var attribs = '' + toMS(duration) + ' ' + easing;
	    if (parseInt(delay, 10) > 0) { attribs += ' ' + toMS(delay); }

	    // For more properties, add them this way:
	    // "margin 200ms ease, padding 200ms ease, ..."
	    var transitions = [];
	    $.each(props, function(i, name) {
	      transitions.push(name + ' ' + attribs);
	    });

	    return transitions.join(', ');
	  }

	  // ## $.fn.transition
	  // Works like $.fn.animate(), but uses CSS transitions.
	  //
	  //     $("...").transition({ opacity: 0.1, scale: 0.3 });
	  //
	  //     // Specific duration
	  //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500);
	  //
	  //     // With duration and easing
	  //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500, 'in');
	  //
	  //     // With callback
	  //     $("...").transition({ opacity: 0.1, scale: 0.3 }, function() { ... });
	  //
	  //     // With everything
	  //     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500, 'in', function() { ... });
	  //
	  //     // Alternate syntax
	  //     $("...").transition({
	  //       opacity: 0.1,
	  //       duration: 200,
	  //       delay: 40,
	  //       easing: 'in',
	  //       complete: function() { /* ... */ }
	  //      });
	  //
	  $.fn.transition = $.fn.transit = function(properties, duration, easing, callback) {
	    var self  = this;
	    var delay = 0;
	    var queue = true;

	    // Account for `.transition(properties, callback)`.
	    if (typeof duration === 'function') {
	      callback = duration;
	      duration = undefined;
	    }

	    // Account for `.transition(properties, duration, callback)`.
	    if (typeof easing === 'function') {
	      callback = easing;
	      easing = undefined;
	    }

	    // Alternate syntax.
	    if (typeof properties.easing !== 'undefined') {
	      easing = properties.easing;
	      delete properties.easing;
	    }

	    if (typeof properties.duration !== 'undefined') {
	      duration = properties.duration;
	      delete properties.duration;
	    }

	    if (typeof properties.complete !== 'undefined') {
	      callback = properties.complete;
	      delete properties.complete;
	    }

	    if (typeof properties.queue !== 'undefined') {
	      queue = properties.queue;
	      delete properties.queue;
	    }

	    if (typeof properties.delay !== 'undefined') {
	      delay = properties.delay;
	      delete properties.delay;
	    }

	    // Set defaults. (`400` duration, `ease` easing)
	    if (typeof duration === 'undefined') { duration = $.fx.speeds._default; }
	    if (typeof easing === 'undefined')   { easing = $.cssEase._default; }

	    duration = toMS(duration);

	    // Build the `transition` property.
	    var transitionValue = getTransition(properties, duration, easing, delay);

	    // Compute delay until callback.
	    // If this becomes 0, don't bother setting the transition property.
	    var work = $.transit.enabled && support.transition;
	    var i = work ? (parseInt(duration, 10) + parseInt(delay, 10)) : 0;

	    // If there's nothing to do...
	    if (i === 0) {
	      var fn = function(next) {
	        self.css(properties);
	        if (callback) { callback.apply(self); }
	        if (next) { next(); }
	      };

	      callOrQueue(self, queue, fn);
	      return self;
	    }

	    // Save the old transitions of each element so we can restore it later.
	    var oldTransitions = {};

	    var run = function(nextCall) {
	      var bound = false;

	      // Prepare the callback.
	      var cb = function() {
	        if (bound) { self.unbind(transitionEnd, cb); }

	        if (i > 0) {
	          self.each(function() {
	            this.style[support.transition] = (oldTransitions[this] || null);
	          });
	        }

	        if (typeof callback === 'function') { callback.apply(self); }
	        if (typeof nextCall === 'function') { nextCall(); }
	      };

	      if ((i > 0) && (transitionEnd) && ($.transit.useTransitionEnd)) {
	        // Use the 'transitionend' event if it's available.
	        bound = true;
	        self.bind(transitionEnd, cb);
	      } else {
	        // Fallback to timers if the 'transitionend' event isn't supported.
	        window.setTimeout(cb, i);
	      }

	      // Apply transitions.
	      self.each(function() {
	        if (i > 0) {
	          this.style[support.transition] = transitionValue;
	        }
	        $(this).css(properties);
	      });
	    };

	    // Defer running. This allows the browser to paint any pending CSS it hasn't
	    // painted yet before doing the transitions.
	    var deferredRun = function(next) {
	      var i = 0;

	      // Durations that are too slow will get transitions mixed up.
	      // (Tested on Mac/FF 7.0.1)
	      if ((support.transition === 'MozTransition') && (i < 25)) { i = 25; }

	      window.setTimeout(function() { run(next); }, i);
	    };

	    // Use jQuery's fx queue.
	    callOrQueue(self, queue, deferredRun);

	    // Chainability.
	    return this;
	  };

	  function registerCssHook(prop, isPixels) {
	    // For certain properties, the 'px' should not be implied.
	    if (!isPixels) { $.cssNumber[prop] = true; }

	    $.transit.propertyMap[prop] = support.transform;

	    $.cssHooks[prop] = {
	      get: function(elem) {
	        var t = $(elem).css('transit:transform');
	        return t.get(prop);
	      },

	      set: function(elem, value) {
	        var t = $(elem).css('transit:transform');
	        t.setFromString(prop, value);

	        $(elem).css({ 'transit:transform': t });
	      }
	    };

	  }

	  // ### uncamel(str)
	  // Converts a camelcase string to a dasherized string.
	  // (`marginLeft` => `margin-left`)
	  function uncamel(str) {
	    return str.replace(/([A-Z])/g, function(letter) { return '-' + letter.toLowerCase(); });
	  }

	  // ### unit(number, unit)
	  // Ensures that number `number` has a unit. If no unit is found, assume the
	  // default is `unit`.
	  //
	  //     unit(2, 'px')          //=> "2px"
	  //     unit("30deg", 'rad')   //=> "30deg"
	  //
	  function unit(i, units) {
	    if ((typeof i === "string") && (!i.match(/^[\-0-9\.]+$/))) {
	      return i;
	    } else {
	      return "" + i + units;
	    }
	  }

	  // ### toMS(duration)
	  // Converts given `duration` to a millisecond string.
	  //
	  //     toMS('fast')   //=> '400ms'
	  //     toMS(10)       //=> '10ms'
	  //
	  function toMS(duration) {
	    var i = duration;

	    // Allow for string durations like 'fast'.
	    if ($.fx.speeds[i]) { i = $.fx.speeds[i]; }

	    return unit(i, 'ms');
	  }
	   
	  // Export some functions for testable-ness.
	  $.transit.getTransitionValue = getTransition;
	})(jQuery);
	Brahma.applet('transit', {
		backup: {
			style: {
				left: 0,
				top: 0
			}
		},
		defaults: {
			duration: 450
		},
		operands: [],
		execute: function() {
			
				var that = this;
				$(this.elements).each(function() {
					var pos = that._getAbsolutePosition(this);

					var parentCss = $(this).parent().css(['min-width','min-height','position']);
					parentCss.width = $(this).parent().width();
					parentCss.height = $(this).parent().height();
					var css = $(this).css(['width','height','min-width','min-height','position']);
					css.outerWidth = $(this).outerWidth(),
					css.outerHeight = $(this).outerHeight();

					// calc x
					var x = $(this)[0].offsetLeft;
					
					if (x==0) {
						/* the value can be lie! Check for FF */
						/* ... */
						if (Brahma.browser.firefox) {
							/* Firefox hates position absolute inside table-cell parent node. So we calc position of parent */
							
							if ($(this).parent().css('display')=='table-cell') {
								x+=$(this).parent().position().left;
							}
						};
					};

					var y = $(this).position().top;
					
					if (y==0) {
						/* test for problem with TD container */
						if (parentCss.height>css.outerHeight) {
							/* something isn't right. test for padding */
							var pparentTop = $(this).parent().css("parentTop");

							if (typeof pparentTop != "undefined" && parseInt(pparentTop)!=0) {
								
								y+=parseInt(pparentTop);
							};

							/* test for parent element */

							switch($(this).parent().css("display")) {
								case 'table-cell':

									/* test for vertical align */
									switch($(this).parent().css("vertical-align")) {
										case 'middle':

											y+=(parentCss.height/2)-(css.outerHeight/2);
										break;
										case 'bottom':
											y+=parentCss.height-css.outerHeight;
										break;
									};
								break;
							};
						};
					};

					that.operands.push({
						lnk: this,
						defaults: {
							'left': pos.x,
							'top': pos.y,
							'x': x,
							'y': y,
							'position': css.position,
							'min-width': css['min-width'],
							'width': css['width'],
							'height': css['height'],
							'outerWidth': css['outerWidth'],
							'outerHeight': css['outerHeight'],
							'parentPosition': parentCss['position'],
							'parentMinWidth': parentCss['min-width'],
							'parentMinHeigth': parentCss['min-height'],
							'parentWidth': parentCss['width'],
							'parentHeight': parentCss['height']
						}
					});
				});
			
		},
		_css: function(options) {
			
			if (typeof jQuery.transit == "undefined") {
					
					if (typeof options.x != "undefined" || typeof options.y != undefined) {
							
							this._transitSimulatorMode(options);
					};
					
					var that = this;
					var options = options;
					$.each(this.operands, function() {

							options = that._adaptToClassic(options, this);
							
							$(this.lnk).css(options);
							
					});

			} else {
					console.log(options);
					$(this.elements).transit(options, 0);
			}
		},
		jump: function(options) {
			
			this._css(options);			
			return this;
		},
		_transitSimulatorMode: function(options, operand, emancipationOnly) {
			var options = options;
			var emancipationOnly = emancipationOnly || false; // < if reset true - break;
			var that = this;
			var x = 0;
			var y = 0;
			var reset = false;
			var operand = operand || false;
			var position = 'static';
			if (typeof options.x != "undefined") x = options.x;
			if (typeof options.y != "undefined") y = options.y;
			if (x == 0 && y == 0) {
				reset = true;
			};

			if (reset && emancipationOnly) return !reset;

			var fixOperand = function(reset) {
				/*
				if using transit emulation we have to fixate parent sizes so we create dummy node with element sizes
				*/
				if (!reset) {
					
					this.dummy = $('<div />');
					$(this.dummy).insertAfter($(this.lnk));
					$(this.dummy).css({
						//'visibility': 'hidden',
						'width': this.defaults.outerWidth,
						'height': this.defaults.outerHeight,
						'position': this.defaults.position
					});
				} else {
					if (this.dummy) {
						$(this.dummy).remove();
						this.dummy = false;
					};
				};

				// > repair parent position
				$(this.lnk).parent().css({
					'position': (reset  ? this.defaults.parentPosition : 'relative')
				});

				// > repair min-width
				if (!reset) {
					$(this.lnk).css('min-width', this.defaults.width);
				} else {
					$(this.lnk).css('min-width', this.defaults['min-width']);
				};
				
				// > repair element position
				$(this.lnk).css('position', (reset  ? this.defaults.position : 'absolute'));

				// > repair element left, Top
				$(this.lnk).css({
					left: this.defaults.left,
					top: this.defaults.top
				});
				
			};

			if (!operand) {
				$.each(this.operands, function() {
					fixOperand.call(this, reset);
				});
			} else {
				fixOperand.call(operand, reset);
			};

			return !reset;
		},
		_checkIsSimulated : function(element) {
			if ($(element.lnk).css('position')!='absolute') return false;
			return true;
		},
		_getAbsolutePosition : function(element) {
			
			var y = $(element).css('top');
			if (typeof y != 'number') {
				if (y.substr(-1)=='%') y = (parseInt($(this).parent().height())/100) * parseInt(y);
				else y = 0;
			};

			var x = $(element).css('left');
			if (typeof x != 'number') {
				if (x.substr(-1)=='%') x = (parseInt($(this).parent().height())/100) * parseInt(x);
				else x = 0;
			};

			return {
				x: x,
				y: y
			};
		},
		_adaptToClassic : function(options, element) {
			
			if (typeof options.x != 'undefined') {

				options.left = element.defaults.left+options.x+element.defaults.x;
			};
			if (typeof options.y != 'undefined') {

				options.top = element.defaults.top+options.y+element.defaults.y;
			};

			return options;
		},
		animate: function() {


			var that = this;
			var options = arguments[0];
			var duration = this.defaults.duration;
			var callback = function() {};
			var ease = 'swing';
			var callback_master = callback;

			if (typeof arguments[1] == "number" || typeof arguments[1] == "string") {
				duration = arguments[1];
			} else if (typeof arguments[1] == "function") {
				callback = arguments[1];
			};

			if (typeof arguments[2] == 'string') {
				ease = arguments[2];
			} else if (typeof arguments[2] == "function") {
				callback = arguments[2];
			};

			if (arguments.length>3) {
				if (typeof arguments[3] == "function") {
					callback = arguments[3];
				};
			};


			if (typeof jQuery.transit != "undefined") {
				setTimeout(function() {
					
					jQuery(that.elements).transit(options, duration, callback);
				}, 10);
				
			} else {
				
				setTimeout(callback, duration+1);
				var that = this;
				var options = options;
				
				$.each(this.operands, function() {
					
					var operand = this;
					
					if (!that._checkIsSimulated(operand) && that._transitSimulatorMode(options, operand, true)) {
						/* We must check is element in not simulation mode & if transit is not zero position, we need to just element by simulation mode */
						
						
							/* So, if it's not simulated we believe that x & y equal zero. So jump to cimulated zero. */
							
							$(this.lnk).css(that._adaptToClassic({x:0,y:0}, this));
						
					};


					options = that._adaptToClassic(options, this);
					

					$(this.lnk).animate(options, duration, ease, function() {
						if (typeof options.x != "undefined" || typeof options.y != "undefined") {
								that._transitSimulatorMode(options, operand);
						};
					});
			
				});
				
			};
		}
	});
}, ['brahma.jquerybridge']);