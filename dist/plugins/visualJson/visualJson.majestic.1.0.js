Majestic('majestic.visualJson', function() {
	this.applet('visualJson', {
		json: {},
		execute : function() {
			var applet = this;
			Majestic(function() {
				applet.element = applet.elements[0];

				for (var i in applet.options.rules) {
					var rule = applet.options.rules[i];
					applet.json[i] = applet.options.source[i];
					switch(rule['type']) {
						case 'checkbox':
							applet.createCheckbox(i, rule);
						break;
						case 'slider':
							applet.createSlider(i, rule);
						break;
					};
				};
			}, ['majestic.curve']);
		},
		update : function() {
			this.json = {};
			for (var i in this.options.rules) {
				var rule = this.options.rules[i];
				this.json[i] = this.options.source[i];
			};
			// json result
			var json = this.toJson(this.json);
			if (typeof this.options.code == 'string') {
				json = this.options.code.split('[*json*]').join(json);
			}
			$(this.options.result).html(json);

			this.trigger('change');
		},
		createCheckbox : function(name, rule) {
			var that = this;
			var rule = rule;
			$(this.element)
			.put($('<fieldset />'))
			.put($('<input />', {
				'type': 'checkbox',
				'checked': this.options.source[name] ? true : false
			}))
			.bind('change click', function() {
				
				rule.change.call(that.options.context, $(this).is(":checked"));
				that.update();
			})
			.and($('<label />'))
			.html(rule.label);
		},
		createSlider : function(name, rule) {
			var that = this;
			var name = name;
			var rule = rule;
			$(this.element)
			.put($('<fieldset />'))
			.css({
				'float': 'left',
				'width': 'auto'
			})
			.put($('<label />'))
			.css({
				'margin': '0 0 6px 0'
			})
			.html(rule.label)
			.and($('<div />'))
			.css({
				width: '31px',
				height: '93px',
				margin: '0 0 6px 0',
				cursor: 'pointer'
			})
			.tie(function() {

				new (function(el, masterclass, input, rule, value) {
					this.el = el;
					this.input = input;
					this.rule = rule;

					this.masterclass = masterclass;
					this.curve = null;
					this.watch = null;
					this.vpos = 0;
					this.value = value;
					this.init = function() {
						var that = this;
						this.curve = Majestic(this.el).applet('curve');
						this.watch = Majestic(this.el).applet('mouse')
						.bind('drag', function(el, data, e) {

							that.reCalcByPos(data.offsetY);
						});
						// bind input
						this.input.change(function() {
							that.reCalcByValue($(this).val());
							
							that.masterclass.update();
						});
						// recalc
						this.reCalcByValue(this.value);
						
					};
					this.reInitWidget = function() {
						if (typeof this.rule.change == 'function') this.rule.change.call(this.masterclass.options.context, this.value);
						this.masterclass.update();

						
					};
					this.reCalcByPos = function(y) {
						this.vpos = y;
						
						this.value = this.rule.min + ( (this.rule.max-this.rule.min)/91 * (91-y) );
						
						$(this.input).val(this.value);
						// reinit widget
						this.reInitWidget();
						// rebuild
						this.reDraw();
					};
					this.reCalcByValue = function(value){

						
						this.vpos = 91-(91*((value-this.rule.min)/(this.rule.max-this.rule.min)));
						// reinit widget
						this.reInitWidget();
						// rebuild
						this.reDraw();
					};
					this.reDraw = function() {
						
						var delta = Majestic.trigonometria.delta2sc(93, 31, 90);

						var diagonal = Majestic.trigonometria.delta2c1s(this.vpos, 90, delta.$A);

						// draw
						this.curve.clear();
						this.curve.setStyle('#000000', '#414141', 1)
						.linear(0, 93, 31, 0)
						.setStyle('#650000', 'transparent', 1)
						.arc(
						  31-diagonal.b, diagonal.c, 5
						);
					};
					this.init();
				})(this, that, $(this).and($('<input />', {
					'type': 'text',
					'value': that.options.source[name]
				}))
				.css({
					width: '31px'
				}), rule, that.options.source[name]);
				
			});
		},
		humanJson: function($json, $flag) {
			var $flag = $flag || false;
			var repeat = function(s, n){
			    var a = [];
			    while(a.length < n){
			        a.push(s);
			    }
			    return a.join('');
			};
			var $tc = 0,        //tab count
	        $r = '',        //result
	        $q = false,     //quotes
	        $t = "\t",      //tab
	        $nl = "\n";     //new line

	        for(var $i=0;$i<$json.length;$i++){
	            $c = $json[$i];
	            if($c=='"' && $json[$i-1]!='\\') $q = !$q;
	            if($q){
	                $r += $c;
	                continue;
	            }
	            switch($c){
	                case '{':
	                case '[':
	                    $r += $c + $nl + repeat($t, ++$tc);
	                    break;
	                case '}':
	                case ']':
	                    $r += $nl + repeat($t, --$tc) + $c;
	                    break;
	                case ',':
	                    $r += $c;
	                    if($json[$i+1]!='{' && $json[$i+1]!='[') $r += $nl + repeat($t, $tc);
	                    break;
	                case ':':
	                    $r += $c + ' ';
	                    break;
	                default:
	                    $r += $c;
	            }
	        }
	        switch($flag) {
	            case 'JSON_UNESCAPED_SLASHES':
	                $r = $r.split('\/').join('/');
	            break;
	        }

	        return $r;
		},
		toJson : function(obj) {
			var that = this;
			return (new (function(obj) {
				var text = [];
				this.compile = function(obj) {

					if (obj instanceof Array) {
						text.push('[');
					} else {
						text.push('{');
					};	

					var items = [];	
					for (var i in obj) {
						var item = '"'+i+'":';
						var value = 'null';
						switch(typeof obj[i]) {
							case "string":
								value = '"'+obj[i].explode('"').join('\\"').explode("\n").join('\\n\\n')+'"';
							break;
							case "number":
								value = parseInt(obj[i]);
							break;
							case "boolean":
								value = (obj[i]) ? "true" : "false";
							break;
							case "function":
								value = "Function";
							break;
							case "object":

									value = this.toJson(obj[i]);
															
							break;
							default:
								value = 'null';
							break;
						};
						item+=value;
						items.push(item);
					};
					text.push(items.join(','));
					if (obj instanceof Array) {
						text.push(']');
					} else {
						text.push('}');
					};	

					return that.humanJson(text.join(""));
				};
				this.get = function() {
					
					return this.compile(obj);
				}
			})(obj).get());
			
		}
	});
}, ['majestic.jquerybridge']);