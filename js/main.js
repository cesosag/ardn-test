$(function(){
	// Vars declaration
	var title = "";
	var raw_data = [];
	var images = [];
	var frames = 0;

	// Get data from JSON file, when done, render first frame
	$.get('data.json').done(function(data){
		title = data.title;	// Get the title from file
		raw_data = data.images;	// Get the images from file and store them in an array
		frames = Math.ceil(raw_data.length/6); // Calculate total frames number

		// Sort images in a bidimmensional array, first dimmension is the frame number, and second dimmension, the image. Six images per frame.
		for(var i = 0; i < frames; i++){
			images.push([]);
			for(var j = 0; j < 6; j++){
				if(raw_data[6*i + j]){
					images[i].push(raw_data[6*i + j]);
				}
			}
		}

		// Render initial data
		$('#title').html(title);
		TweenMax.from('#title', .3, {
			autoAlpha: 0,
			ease: Power1.easeIn,
			x: -200,
			y: -100
		});
		G.renderFrame(images, 0, frames);
		TweenMax.from('#pagination', .3, {
			autoAlpha: 0,
			delay: 2,
			ease: Power1.easeIn,
			x: 200,
			y: 100
		});
	});

	// Navigation between frames using the buttons
	$('#main').on('click', '#pagination-next', function(){
		var $button = $(this);
		var current_frame = $button.data('current');
		G.unrenderFrame(images, current_frame, frames);
	});
	$('#main').on('click', '#pagination-prev', function(){
		var $button = $(this);
		var current_frame = $button.data('current');
		G.unrenderFrame(images, current_frame - 2, frames);
	});

	// Expanded view of a picture
	$('#main').on('click', '.gallery-item', function(){
		var $image = $(this);
		var position = $image.offset();
		var width = $image.innerWidth();
		var height = $image.innerHeight();
		var $clone = $image.clone();
		$image.addClass('cloned');
		$clone.addClass('clone').css({
			//bottom: position.top + height,
			//right: position.left + width,
			position: 'fixed',
			top: position.top,
			left: position.left,
			height: height,
			width: width
		});
		$('#main').append($clone)
		TweenMax.to($clone, .5, {
			className: '+=is-expanded',
			top: 0,
			left: 0,
			bottom: 0,
			right: 0,
			height: "100vh",
			width: "100vw",
			ease: Bounce.easeOut
		});
	});
	$('#main').on('click', '.gallery-item .close', function(e){
		e.stopPropagation();
		var $original = $('.cloned');
		var original_position = $original.offset();
		var original_width = $original.innerWidth();
		var original_height = $original.innerHeight();
		var $clone = $(this).parent();
		TweenMax.to($clone, .5, {
			className: '-=is-expanded',
			top: original_position.top,
			left: original_position.left,
			height: original_height,
			width: original_width,
			ease: Bounce.easeOut,
			onComplete: function(){
				$original.removeClass('cloned');
				setTimeout(function(){
					$('.clone').remove();
				}, 1000);
			}
		});
	});
});

// Functions encapsulation
G = new (function(){
	var self = this;
	this.imgTemplate = function(id, src, caption){
		return '<figure id="'+id+'" class="gallery-item"><button type="button" class="close">X</button><img src="'+src+'" alt="" class="gallery-item-img"><figcaption class="gallery-item-caption">'+caption+'</figcaption></figure>';
	}
	this.prevButton = function(current_frame, disabled){
		var is_disabled = (disabled ? " disabled" : "");
		return '<button type="button" id="pagination-prev" class="pagination-button" data-current="'+current_frame+'"'+is_disabled+'>Fotos anteriores</button>';
	}
	this.nextButton = function(current_frame, disabled){
		var is_disabled = (disabled ? " disabled" : "");
		return '<button type="button" id="pagination-next" class="pagination-button" data-current="'+current_frame+'"'+is_disabled+'>Fotos siguientes</button>';
	}
	this.renderFrame = function(images, frame, frames){
		var figures = "";
		var tl = new TimelineMax();

		images[frame].forEach(function(item, index){
			figures += self.imgTemplate('img-' + index, item.src, item.caption);
		});
		$('#gallery').html(figures);
		tl.staggerTo('.gallery-item', .5, {
			bezier: [
				{x:-300, y:-150, rotationY: 90, rotationX: 90, opacity: 0},
				{x:-150, y:-50, rotationY: 45, rotationX: 45, opacity: 0.3},
				{x:0, y:0, rotationY: 0, rotationX: 0, opacity: 1},
			],
			ease:Power1.easeInOut
		}, -0.3);
		$('#counter').html((1+frame)+"/" + frames);
		if(frame + 1 == frames){
			$('#buttons').html(self.prevButton(frame + 1, false) + self.nextButton(frame + 1, true));
		}
		else if(frame + 1 == 1){
			$('#buttons').html(self.prevButton(frame + 1, true) + self.nextButton(frame + 1, false));
		}
		else{
			$('#buttons').html(self.prevButton(frame + 1, false) + self.nextButton(frame + 1, false));
		}
	}
	this.unrenderFrame = function(images, frame, frames){
		var tl = new TimelineMax({
			onComplete: function(){
				self.renderFrame(images, frame, frames);
			}
		});
		tl.staggerTo('.gallery-item', .5, {
			bezier: [
				{x:0, y:0, rotationY: 0, rotationX: 0, opacity: 1},
				{x:-150, y:-50, rotationY: 45, rotationX: 45, opacity: 0.3},
				{x:-300, y:-150, rotationY: 90, rotationX: 90, opacity: 0},
			],
			ease:Power1.easeInOut
		}, .3);
	}
});