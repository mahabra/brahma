
dharma('services')
	.addModule('ajax')
	.assing({
		request: function(data) {
			var data = data;
			var context = data.context || window;
			$.ajax({
				url: data.url,
				type: data.type || 'post',
				data: {
					request: data.data || {},
					engineMode: 3					
				},
				dataType: 'json',
				success: function(response) {
					
					var response = response;
					var onready = function() {
						
						if ("undefined"!==typeof response.script) {


							;(function() {
								var content = response.content;
								var data = response.data;
								for (var e=0;e<response.script.length;e++) {
									eval(response.script[e]);
								}
							}).apply(context);
						}

						
						if ("function"==typeof data.ready) data.ready.call(context, response.data || (response.content || false));
					};
					var preventContinues = false;
					if ("object"==typeof response.metaCommands) {

						$.each(response.metaCommands, function() {
							
							if (this.split(':')[0]==='p') preventContinues = true;
							if ("function"==typeof data.metaCommand) data.metaCommand.call(context, this);
						});
					}
					if (!preventContinues) {
						if ("object"==typeof response.import) {

							// require js
							if ("object"==typeof response.import.requireJs) {
								
								var queue = [];
								$.each(response.import.requireJs, function() {
									queue.push(this);
								});
								queue = queue.reverse();
								var includes = [];
								includes.push(onready);
								
								for (var q = 0;q<queue.length;q++) {
									!(function(q) {
										var qq = q;
										includes.push(function() {
											
											include(queue[qq], function() {
												
												includes[qq]();
											});
										});
									})(q);
								};
								
								includes[includes.length-1]();
								
							} else {
								onready();
							}

							if ("object"==typeof response.import.requireCss) {
								
								includecss(response.import.requireCss);
							}
						} else {
							onready();
						};
					};

					if ("function"==typeof data.success) data.success.call(context, response.content || false, response.data || false);
				},
				error: function(r) {
					console.error(r);
					if ("function"==typeof data.error) data.error.call(context, r);
				}
			})
		}
	});