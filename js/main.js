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
	$('#main').on('click', '.pagination-button', function(){
		var $button = $(this);
		var current_frame = $button.data('current');
		var next_frame = 0;
		// Get button id, to asign what frame goes next
		if($button[0].id == "pagination-next"){
			next_frame = current_frame;
		}
		else if($button[0].id == "pagination-prev"){
			next_frame = current_frame - 2;
		}
		G.unrenderFrame(images, next_frame, frames);
	});

	// Expanded view of a picture
	$('#main').on('click', '.gallery-item', G.expandImage);
	$('#main').on('click', '.gallery-item .close', G.closeImage);
});

// Functions encapsulation
G = new (function(){
	var self = this;
	this.imgTemplate = function(src, caption){
		return '<figure class="gallery-item"><button type="button" class="close">X</button><img src="'+src+'" alt="" class="gallery-item-img"><figcaption class="gallery-item-caption">'+caption+'</figcaption></figure>';
	}
	this.renderFrame = function(images, frame, frames){
		var figures = "";
		var tl = new TimelineMax();

		// Get the images of the desired frame, and place them into image template
		images[frame].forEach(function(item){
			figures += self.imgTemplate(item.src, item.caption);
		});
		// Place the images into the gallery
		$('#gallery').html(figures);
		// Staggered animation of the pictures using a bezier path
		tl.staggerTo('.gallery-item', 1, {
			bezier: { 
				values: [
					{x: -300, y: -150, rotationY: 0, rotationX: -90, scaleX: 0.5, scaleY: 0.5, opacity: 0},
					{x: -600, y: -100, rotationY: 45, rotationX: -67.5, scaleX: 2, scaleY: 2, opacity: 0.3},
					{x: -150, y: 50, rotationY: 22.5, rotationX: -45, scaleX: 1.1, scaleY: 1.1, opacity: 0.8},
					{x: 0, y: 0, rotationY: 0, rotationX: 0, scaleX: 1, scaleY: 1, opacity: 1},
				]
			},
			ease:Power1.easeInOut
		}, -0.3);
		// Update the pagination counter
		$('#counter').html((1+frame)+"/" + frames);
		// Update the current frame data in buttons
		$('#buttons .pagination-button').data('current', frame + 1);
		// Disable or enabe buttons according to pagination edges
		if(frame + 1 == frames){
			$('#pagination-prev').prop('disabled', false);
			$('#pagination-next').prop('disabled', true);
		}
		else if(frame + 1 == 1){
			$('#pagination-prev').prop('disabled', true);
			$('#pagination-next').prop('disabled', false);
		}
		else{
			$('#buttons .pagination-button').prop('disabled', false);
		}
	}
	this.unrenderFrame = function(images, frame, frames){
		var tl = new TimelineMax({
			// When complete, render next frame
			onComplete: function(){
				self.renderFrame(images, frame, frames);
			}
		});
		// Taking out the pictures of the current frame
		tl.staggerTo('.gallery-item', .5, {
			bezier: {
				values: [
					{x: 0, y: 0, rotationY: 0, rotationX: 0, scaleX: 1, scaleY: 1, opacity: 1},
					{x: -150, y: 50, rotationY: -22.5, rotationX: 45, scaleX: 1.1, scaleY: 0.5, opacity: 0.8},
					{x: -600, y: -100, rotationY: -45, rotationX: 67.5, scaleX: 2, scaleY: 1.1, opacity: 0.3},
					{x: -300, y: -150, rotationY: 0, rotationX: 90, scaleX: 0.5, scaleY: 2, opacity: 0}
				]
			},
			ease:Power1.easeInOut
		}, .3);
	}
	this.expandImage = function(){
		var $image = $(this);	// Get original image
		var position = $image.offset();	// Get global position of the selected image
		var width = $image.innerWidth(); // Get actual size, width and height of the selected image
		var height = $image.innerHeight();
		var $clone = $image.clone();	// Clone the selected image, so it won't change layout when animating 'it'
		$image.addClass('cloned');
		// Positioning the cloned image over the original one
		$clone.addClass('clone').css({
			position: 'fixed',
			top: position.top,
			left: position.left,
			height: height,
			width: width
		});
		$('#main').append($clone);	// Placing the cloned image in the exact absolute position over the original one
		// Animating the cloned image to expanded state
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
	}
	this.closeImage = function(e){
		e.stopPropagation();	// Prevent expandImage function from being called
		var $original = $('.cloned');	// Get original image
		var original_position = $original.offset();	//Get original position and size
		var original_width = $original.innerWidth();
		var original_height = $original.innerHeight();
		var $clone = $(this).parent();	// Get the cloned image
		// Animating the cloned expanded image to a non expanded state, and removing it from DOM when complete
		TweenMax.to($clone, .5, {
			className: '-=is-expanded',
			top: original_position.top,
			left: original_position.left,
			height: original_height,
			width: original_width,
			ease: Bounce.easeOut,
			onComplete: function(){
				$original.removeClass('cloned');
				$('.clone').remove();
			}
		});
	}
});