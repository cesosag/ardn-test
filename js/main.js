$(function(){
	// Vars declaration
	var title = "";
	var raw_data = [];
	var images = [];
	var frames = 0;
	var tl = new TimelineMax();

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
		renderFrame(images, 0, frames);

		tl.from('#title', .3, {
			autoAlpha: 0,
			ease: Power1.easeIn,
			x: -200,
			y: -100
		}).staggerFrom('.gallery-item', 10, {
			bezier: [
				{left:-300, top:-150, rotationY: 90, rotationX: 90, opacity: 0},
				{left:-150, top:-50, rotationY: 0, rotationX: 0, opacity: 1},
			],
			//autoRotate: true,
			//autoAlpha: 0,
			ease:Power1.easeInOut
		}, .3);
	});

	$('#main').on('click', '#pagination-next', function(){
		var $button = $(this);
		var current_frame = $button.data('current');
		renderFrame(images, current_frame, frames);
	});
	$('#main').on('click', '#pagination-prev', function(){
		var $button = $(this);
		var current_frame = $button.data('current');
		renderFrame(images, current_frame - 2, frames);
	});
});

var imgTemplate = function(id, src, caption){
	return '<figure id="'+id+'" class="gallery-item"><img src="'+src+'" alt="" class="gallery-item-img"><figcaption class="gallery-item-caption">'+caption+'</figcaption></figure>';
}

var prevButton = function(current_frame, disabled){
	var is_disabled = (disabled ? " disabled" : "");
	return '<button type="button" id="pagination-prev" class="pagination-button" data-current="'+current_frame+'"'+is_disabled+'>Fotos anteriores</button>';
}

var nextButton = function(current_frame, disabled){
	var is_disabled = (disabled ? " disabled" : "");
	return '<button type="button" id="pagination-next" class="pagination-button" data-current="'+current_frame+'"'+is_disabled+'>Fotos siguientes</button>';
}

var renderFrame = function(images, frame, frames){
	var figures = "";
	images[frame].forEach(function(item, index){
		figures += imgTemplate('img-' + index, item.src, item.caption);
	});
	$('#gallery').html(figures);
	$('#counter').html((1+frame)+"/" + frames);
	if(frame + 1 == frames){
		$('#buttons').html(prevButton(frame + 1, false) + nextButton(frame + 1, true));
	}
	else if(frame + 1 == 1){
		$('#buttons').html(prevButton(frame + 1, true) + nextButton(frame + 1, false));
	}
	else{
		$('#buttons').html(prevButton(frame + 1, false) + nextButton(frame + 1, false));
	}
}