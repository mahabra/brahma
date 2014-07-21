Brahma("brahma.form", function() {
	Brahma.applet("form", {
		execute: function() {
			// Initial
			switch(Brahma(this.elements)[0].tagName.toLowerCase()) {
				case 'form':
					this.initialing();
				break;
				default:
					Brahma.die("Element is not form tag");
				break;
			}
		},
		initialing: function() {

		},
		val: function() {
			var applet = this;
			if (arguments.length==1) {
				switch(typeof arguments[0]) {
					case 'object': // set
						if (!Brahma.isArray(arguments[0])) { 
							for (var i in arguments[0]) {
								this.setValue(i, arguments[0][i]);
							};
						} else {
							var result = {};
							for (var i =0; i<arguments[0].length;i++) {
								result[arguments[0][i]] = this.getValue(arguments[0][i]);
							}
						};
					break;
					default: // search name=arguments[0] and return val
						return this.getValue(arguments[0]);
					break;
				}
			} else if (arguments.length>1) {
				this.setValue(arguments[0], arguments[1]);
			};

			return this;
		},
		setValue: function(name, value) {
			this.searchByName(name)[0].value = value;
			return this;
		},
		getValue: function(name) {
			return this.searchByName(name)[0].value;
		},
		searchByName: function(name) {
			
			return Brahma(Brahma(this.elements).find("INPUT[name="+name+"],TEXTAREA[name="+name+"],SELECT[name="+name+"]"));
		},
		values: function() {
			var form_data = {};
			// специальных хак под JQuery ]
			var Elements = Brahma(this.elements).find('input,textarea,select');

			for(var i=0; i < Elements.length; i++){
				var name = Brahma(Elements[i]).attr("name");

				if(name && (Elements[i].tagName=="INPUT" || Elements[i].tagName=="TEXTAREA" || Elements[i].tagName=="SELECT")){
					
					switch(Elements[i].tagName.toUpperCase()) {
						case 'SELECT':
							var value='';
							value = Brahma(Elements[i]).val();
						break;
						default:
							var value = Brahma(Elements[i]).val();	
						break;
					};
					


					if(name!=""){
						
						var type = Brahma(Elements[i]).attr("type");
						if(Elements[i].tagName=="INPUT" && (type=="radio" || type=="checkbox") && $(Elements[i]).is(":checked")==false){

							continue;
						}
						if(Elements[i].tagName=="SELECT" && Brahma(Elements[i]).attr("multiple")){
							
							Brahma("option", Elements[i]).each(function(){
								if(Brahma(this).attr("selected")){
									var matches = null;
									// F multiple
								}
							});
						}else{
								var value=Brahma(Elements[i]).val();
								switch(Elements[i].tagName) {
									case 'INPUT':
										if (value=='on') value = true;
									break;
								};					
								
							
						}

						// parse name
						if (/\[([^\[]*|\[\])\]/.test(name)) {
							// Get first part of name
							var first = name.split('[')[0];
							if (first.length>0) {
								if (typeof form_data[first] != 'object') form_data[first] = {};
								var current = form_data[first];
							} else {
								var current = form_data;
							}

							var matches = name.match(/\[([^\[]*|\[\])\]/g);
							
							for (var m = 0;m<matches.length;m++) {
								var rname = matches[m].substring(1, matches[m].length-1);
								
								if (m<matches.length-1) {
										// not last
									if (rname.length<1) {
										
										current.push([]);
										var current = current[current.length-1]

										// Push to object
										var current = this.pushToObject(current, rname, []);
									} else {
										// Conver array to object
										current = this.converToObject(current);
										
										if ("object" != typeof(current[rname])) current[rname] = [];
										var current = current[rname];
									};
								} else {
									// last
									
									if (rname.length<1) {
										// Push to object
										this.pushToObject(current, value);
									} else {
										var current = this.pushToObject(current, rname, value);
										current[rname] = value;
									};
								};
							};
							
						} else {										
							form_data[name]=value;
						};
					}
					
				}
			};
			
			return form_data;
		},
		submit : function() {
			Brahma(this.elements)[0].submit();
		},
		submitAjax : function(data, onSuccess, onError) {
			var data = Brahma.ajax({
				'data': this.values()
			}, data || {});
			Brahma.ajax(data, onSuccess || false, onError || false);
		},
		/* API */
		/* Conver Array to object */
		converToObject : function(obj) {
			if (obj instanceof Array) {
				var n = {};
				for (var i = 0;i<obj.length;obj++) {
					n[i] = obj[i];
				};
				obj = n;
			};
			return obj;
		},
		/* to to object, doenst metter it is array of object */
		pushToObject : function(arr, key, value) {
			value==null && (value=key, key=false);
			arr = key===false ? (function(arr,value) {
				var c = 0;
				for (var i in arr) { c++; };
					var pro = 0;
				while(typeof arr[c]!="undefined") { c++; pro++; if (pro>99) {  }; };
				arr[c] = value;
				
				return arr;
			})(arr,value) : (function(arr,key,value) {
				arr[key] = value;
				return arr;
			})(arr,key,value);
			return arr;
		}
	});
});