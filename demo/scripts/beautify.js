Brahma.app('beautify', {
	overflowHeight: 0,
	run: function() {
		var that = this;
		console.log('init');
		// Watch window size
		this.banner = Brahma("#biglogo");
		this.bannerHeight = this.banner[0].height;
		this.wrapper = Brahma("body>div");
		
		this.content = Brahma("#content");

		that.reinit();
		Brahma(window).bind('resize', function() {
			that.reinit();
		});

		Brahma(window).bind('scroll', function() {
			
			that.recalc();
		});
		this.recalc();
	},
	reinit: function() {
		var D = document;
		
	    this.overflowHeight = Math.max(
	        D.body.scrollHeight, D.documentElement.scrollHeight,
	        D.body.offsetHeight, D.documentElement.offsetHeight,
	        D.body.clientHeight, D.documentElement.clientHeight
	    )-(document.documentElement.clientHeight||D.body.clientHeight);
	},
	recalc: function() {
		var st = Brahma(window).scroll().top/this.overflowHeight;
		
		this.banner.css(['-webkit-','-ms-'],{
			"transform": "scale("+(1-st)+")"
		});
		// translateY(-"+Math.round((bannerHeight-that.overflowHeight-100)*st)+"px
		this.content.css(['-webkit-','-ms-'],{
			"transform": "scale("+(st)+")"
		});
	}
});

Brahma(function() {
	Brahma.run('beautify');
});