Brahma.extension('jquery.trigonometria', function() {
		
		this.trigonometria = {
			trinatur : function(num) {
				return num;
			},
			de_ra : function(de) {
				var pi = Math.PI;
				var de_ra = (de*(pi/180));
				return de_ra;
			},
			ra_de : function(radian) {
				var y = (radian * 180) / Math.PI;
				while (y>360) y=y-360;
				return y;
			},
			sin : function(ra) {
				if ( (ra == 0) || (ra == 180) || (ra == 360) ) return 0;
				else return Math.sin(this.de_ra(ra));
			},
			cos : function(ra) {
				if ( (ra == 270) || (ra == 90) ) return 0;
				else return Math.cos(this.de_ra(ra));
			},
			delta2sc: function(a, b, $C) {
				
				var c = Math.sqrt(
					Math.pow(a,2) + Math.pow(b, 2) - (2 * a * b * this.cos($C))
				);
				
				var $A = this.ra_de(Math.acos((b*b + c*c - a*a)/(2*b*c)));
				
				var $B = 180-$A-$C;
				
				var result = {
					a: a,
					b: b,
					c: c,
					'$A': $A,
					'$B': $B,
					'$C': $C
				};
				
				return result;
			},
			delta2c1s: function(a, $C, $A) {
				var $B = 180-($C+$A);
				var c = a * (this.sin($C) / this.sin($A));
				var b = a * (this.sin($B) / this.sin($A));
				return {
					a: a,
					b: b,
					c: c,
					'$A': $A,
					'$B': $B,
					'$C': $C
				};
			},
			rotation : function(l, a, back)
			{
				W = l * this.cos(a);
				if (back!=true) {
					if (W<0) return 0;
				};
				return W;
			},
			disrotation : function(a,ac) {
				dis = ac * this.sin(a);
				return dis;
			},
			not0 : function(num) {
				if (num<1) {
				   num = 1;
				};
				return num;
			}, 
			distX: function(radius, radian) {
				return this.disrotation(radian, radius);
			},
			distY: function(radius, radian) {
				return radius*this.sin(90 - radian);
			},
			/*
			@function perspective
			!
			ГђГ Г±Г·ГҐГІ Г°Г Г§Г¬ГҐГ°Г  Г§Г ГµГўГ ГІГ»ГўГ ГҐГ¬Г®ГЈГ® ГЇГ°Г®Г±ГІГ°Г Г­Г±ГІГўГ  Гў Г§Г ГўГЁГ±ГЁГ¬Г®Г±ГІГЁ Г®ГІ ГіГ¤Г Г«ГҐГ­Г­Г®Г±ГІГЁ, ГґГ®ГЄГіГ±Г­Г®ГЈГ® Г°Г Г±Г±ГІГ®ГїГ­ГЁГї ГЁ Г°Г Г§Г¬ГҐГ°Г®Гў Г¬Г ГІГ°ГЁГ¶Г»
			*/
			perspective: function(focusd, matrixw, distantion) {
				/* ! ГіГ§Г­Г ГҐГ¬ ГЇГ®Г«Г®ГўГЁГ­Гі ГіГЈГ®Г«Г  Г®ГЎГ§Г®Г°Г  */
				var hangle = this.delta2sc(matrixw/2, focusd, 90)['$A'];
				/* ! ГіГ§Г­Г ГҐГ¬ ГёГЁГ°ГЁГ­Гі Г®ГЎГ®Г§Г°ГҐГўГ ГҐГ¬Г®ГЈГ® ГЇГ°Г®Г±ГІГ°Г Г­Г±ГІГўГ  Г­Г  Г°Г Г±Г±ГІГ®ГїГ­ГЁГЁ distantion */
				var areaw = this.delta2c1s(distantion, hangle, (90-hangle)).c;
				
				return areaw;
			}
		};
});