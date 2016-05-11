/*
 * pixelate.js
 * 43081j
 * Pixelate images with ease
 * License: MIT
 */
(function($) {
	$.fn.extend({
		pixelate: function() {
			var defaults = {
				value: 0.05,
				reveal: true
			};
			var options = arguments[0] || {};
			if(typeof options !== 'object') {
				options = { value: parseInt(arguments[0]) };
			}
			options = $.extend(defaults, options);
			return this.each(function() {
				var img = this,
					imgWidth = $(img).width(),
					imgHeight = $(img).height(),
					revealed = false;
				var canv = document.createElement('canvas');
				canv.width = imgWidth;
				canv.height = imgHeight;
				var ctx = canv.getContext('2d');
				ctx.mozImageSmoothingEnabled = false;
				ctx.webkitImageSmoothingEnabled = false;
				ctx.imageSmoothingEnabled = false;
				var opts = $.extend(options, (function() {
					var o = {};
					for(var i = 0; i < img.attributes.length; i++) {
						o[img.attributes[i].name.replace(/^data\-/, '')] = img.attributes[i].value;
					}
					return o;
				})());
				var width = imgWidth * opts.value,
					height = imgHeight * opts.value;
				ctx.drawImage(img, 0, 0, width, height);
				ctx.drawImage(canv, 0, 0, width, height, 0, 0, canv.width, canv.height);
				$(img).hide();
				$(img).before(canv);

				function goLeft() {
					$("#megaman").attr('src', 'img/megaman-left.gif');
					$("#megaman").animate({left: "-=90%"}, 5000, "swing", goRight);
				}

				function goRight() {
					$("#megaman").attr('src', 'img/megaman.gif');
					$("#megaman").animate({left: "+=90%"}, 5000, "swing", goLeft);
				}

		        $('body').css('background-image', 'url(' + canv.toDataURL() + ')');
		        $(canv).before('<audio autoplay loop><source src="audio/razor1911.ogg" type="audio/ogg"><source src="audio/razor1911.mp3" type="audio/mpeg"></audio>');
		        $(canv).before('<img id="megaman" style="position:absolute; left:0; top:60%" src="img/megaman.gif" />');
		        goRight();

				if(opts.reveal && opts.reveal !== 'false') {
					$(canv).click(function() {
						revealed = !revealed;
						if(revealed) {
							ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
						} else {
							ctx.drawImage(img, 0, 0, width, height);
							ctx.drawImage(canv, 0, 0, width, height, 0, 0, canv.width, canv.height);
						}
					});
					$(canv).hover(
						function() {
							if(revealed) return;
							ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
						},
						function() {
							if(revealed) return;
							ctx.drawImage(img, 0, 0, width, height);
							ctx.drawImage(canv, 0, 0, width, height, 0, 0, canv.width, canv.height);
						}
					);
				}
			});
		}
	});
	$(window).on('load', function() {
		$('img[data-pixelate]').pixelate();
	});
})(jQuery);
