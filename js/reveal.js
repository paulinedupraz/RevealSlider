
/**
 * Buzz Brothers Reveal Slider jQuery Plugin
 *
 * This plugin allow to create a slider with a reveal/scan effect and more...
 *
 * @author	Pauline Dupraz 
 * @created	31.03.2012
 * @updated	31.03.2012
 * @version	1.0
 */

;(function($){
	
	/**
	 * Plugin :
	 */
	 
	function reveal(item, options) {
		// vars :
		this.settings = {		
			draggable					: true,					// if the dragger is draggable
			navigation					: true,					// insert a navigation
			navigationTransitionSpeed	: 200,					// speed of the transition from the current slide to the selected one
			animation 					: false,				// if the slider is animated or not
			speed						: 1000,					// speed of the animation
			delay						: 2000,					// delay between each animation 
			timeoutClassChangeMedia		: 500,					// the display time of the class "changing-media"
			callbackChangeMedia			: null,					// call back when the media is changing
			direction					: 'lr',					// determine the direction of the slide: LR (Left to Right), RL, TB (Top to Bottom) or BT
			fixedDragger				: false,				// determine if the dragger has to follow the mouse on the oposite axis
			wrapperOffset				: 0,					// determine an offset inside the wrapper to stop the dragger
			draggerStartOffset			: 0,					// dragger's offset (in pixel, from the first value of the direction)
			changeMediaOffset			: 0,					// the zone which changed the change media function
			wrapper						: '.wrapper',			// the class to access to the slider wrapper
			dragger						: '.dragger',			// the class to access to the dragger
			front						: '.covered',			// the class to access to the front slide
			back 						: '.back'				// the class to access to the slide in the back
		},
		this.$refs = {
			slider						: '',					// path to the slider itself
			slides						: '',					// path to each slide
			wrapper						: '',					// path to the slider wrapper
			dragger						: '',					// path to the dragger itself
			front						: '',					// path to the front slide
			back 						: '',					// path to the slide in the back
			navigation					: ''					// path to the navigation
		};
			
		this.currentIndex = 0;									// save the index of the current slide 
		this.total = 0;											// save the number of slides
		this.multipleSlides = false;							// save the type of the slider
		this.changed = '';	 									// save the last changed event							
		this.is_mousedown = false;								// save the statement of the mousedown event	
		this.is_loadingMedia = false;							// save the statement of the loading
		this.navigationChanged = false;							// save the statement of the navigation events
		this.width = 0;											// save the width of the container
		this.height = 0;										// save the height of the container
			
		this.$this;												// save the jquery base DOM element
	
		// init :
		this.init($(item), options); 
	}	
		
		
	/**
	 * Init : init the plugin
	 *
	 * @param	jQuery	item	The jQuery item
	 * @param	object	options	The options
	 */
	 
	reveal.prototype.init = function(item, options) {
		
		// vars :
		var _this = this,
			$this = $(item);	
		
		// save the $this ref in properties :
		_this.$this = $this;
			
		// extend settings with jquery extend method :
		if (options) $.extend(_this.settings, options);
		
		// save some references :
		_this.$refs.slider = $this;
		_this.$refs.dragger = $this.find(_this.settings.dragger);
		
		
		// rewrite the output		
		_this._rewriteSliderOutput();
		
		// total
		_this.total = _this.$refs.slides.length-1;
		
		// save size of the container
		_this.width = $this.width();
		_this.height = $this.height();
		
		// check if there is more than 2 slides
		_this.multipleSlides = (_this.total > 2) ? true : false;
		
		_this.settings.changeMediaOffset = _this._setPercentinPixel(_this.settings.changeMediaOffset);
		
		var index = 0;
		
		switch (_this.settings.direction.toUpperCase())
		{
			case 'LR':
		
				// save the next slide which has to be redisplayed
				_this.changed = 'back';
			
				_this.currentIndex = _this.getIndex();
				index = (_this.currentIndex+1 <= _this.total ) ? _this.currentIndex+1 : 0;
				
				// replace the front and back content
				_this.$refs.front.html($(_this.$refs.slides[index]));
				_this.$refs.back.html($(_this.$refs.slides[_this.currentIndex]));
 				
 				_this.currentIndex ++;
 				
			break;
			case 'RL':
				
				// save the next slide which has to be redisplayed
				_this.changed = 'front';
			
				_this.currentIndex = (_this.currentIndex+1 > _this.total-1) ? 0 : _this.currentIndex+1;
				index = (_this.currentIndex-1 >=0 ) ? _this.currentIndex-1 : _this.total;

				// replace the front and back content
				_this.$refs.front.html($(_this.$refs.slides[index]));
				_this.$refs.back.html($(_this.$refs.slides[_this.currentIndex]));
		
			break;
			case 'TB':
				
				// save the next slide which has to be redisplayed
				_this.changed = 'back';
			
				_this.currentIndex = _this.getIndex();
				index = (_this.currentIndex+1 <= _this.total ) ? _this.currentIndex+1 : 0;
				
				// replace the front and back content
				_this.$refs.front.html($(_this.$refs.slides[index]));
				_this.$refs.back.html($(_this.$refs.slides[_this.currentIndex]));
 				
 				_this.currentIndex ++;
				
			break;
			case 'BT':
			
				// save the next slide which has to be redisplayed
				_this.changed = 'front';
				
				_this.currentIndex = (_this.currentIndex+1 > _this.total-1) ? 0 : _this.currentIndex+1;
				index = (_this.currentIndex-1 >=0 ) ? _this.currentIndex-1 : _this.total;
				
				// replace the front content
				_this.$refs.front.html($(_this.$refs.slides[index]));
				_this.$refs.back.html($(_this.$refs.slides[_this.currentIndex]));
 				
 			break;
				
		}

		// init the css
		_this._initCss();
		
		// check if the container size has changed
		_this._resize();

		if(_this.settings.navigation === true){
			_this.navigation();
		}	
		
		// check if the type of the slider
		if(_this.settings.animation === true){
			_this.animation();
		} 
		if(_this.settings.draggable === true){
			_this.mouseHandler();
		}
		
		if(_this.settings.callbackChangeMedia != null){
			_this._loadingState();
		}
	}
	
	
	/**
	 * Init Output 		rewrite the output
	 */
	 
	reveal.prototype._rewriteSliderOutput = function(){
		
		var _this = this,
			$this = _this.$this;
			
		// save the class of the wrapper
		var wrapperClass = _this.settings.wrapper;
			wrapperClass = wrapperClass.substr(1, wrapperClass.length);		
		// save the class of the front slide	
		var frontClass = _this.settings.front;
			frontClass = frontClass.substr(1, frontClass.length);
		// save the class of the back slide
		var backClass = _this.settings.back;
			backClass = backClass.substr(1, backClass.length);
		
		//	write the ouput
		var output = '<ul class="' + wrapperClass + '"><li class="' + frontClass + '"></li><li class="' + backClass + '"></li></ul>';
		
		// remove the dragger 
		$this.find(_this.$refs.dragger).remove(); 
		
		// get all slide
		_this.$refs.slides = $this.find(_this.settings.wrapper).children();
		
		// insert the slider output
		_this.$refs.slider.empty().html(output);
			
		// save the reference to the output	
		_this.$refs.wrapper = $this.find(_this.settings.wrapper);
		_this.$refs.front = $this.find(_this.settings.front);
		_this.$refs.back = $this.find(_this.settings.back);	
			
		// place the dragger
		_this.$refs.slider.prepend(_this.$refs.dragger);
	}
	
	/**
	 * init CSS
	 */
	
	reveal.prototype._initCss = function(){
	
	 	var _this = this,
			$this = _this.$this;
			
		// save the slider offset		
		var offset = _this.settings.draggerStartOffset;	
		
		// save the dragger offset
		var draggerOffsetX = _this.$refs.dragger.width()/2*-1;
		var draggerOffsetY = _this.$refs.dragger.height()/2*-1;
			
		// slider 
		$this.css({
			'position'	: 'relative'
		});
		
		// wrapper
		_this.$refs.wrapper.css({
			'width'		: '100%',
			'height'	: '100%'
		});
		
		// dragger
		_this.$refs.dragger.css({
			'position'	: 'absolute',
			'z-index'	: 100,
			'marginLeft': draggerOffsetX,
			'marginTop' : draggerOffsetY
		});
		
		// front slide
		_this.$refs.front.css({
			'z-index'	: 2,
			'width'		: '100%',
			'height'	: '100%',
			'position'	: 'absolute',
			'overflow'	: 'hidden',
			'list-style': 'none',
			'left'		: 0,
			'top'		: 0
		});
		
		// back slide
		_this.$refs.back.css({
			'z-index'	: 1,
			'width'		: '100%',
			'height'	: '100%',
			'position'	: 'absolute',
			'overflow'	: 'hidden',
			'list-style': 'none',
			'left'		: 0,
			'top'		: 0
		});
		
		switch (_this.settings.direction.toUpperCase())
			{
				case 'LR':
					
					// set the front position
					_this.$refs.front.width(offset);
		
					// set the dragger position
					_this.$refs.dragger.css({ 
						'left': offset
					});

				break;
				
				case 'RL':
					// set the front position
					_this.$refs.front.width($this.width() - offset);
					// set the dragger position
					_this.$refs.dragger.css({ 
						'left': $this.width() - offset
					});
				
				break;
				
				case 'TB' :
					// set the front position
					_this.$refs.front.height(offset);
					
					// set the dragger position
					_this.$refs.dragger.css({ 
						'top': offset
					});

				break;
				
				case 'BT':
					// set the front position
					_this.$refs.front.height($this.height() - offset);
					
					// set the dragger position
					_this.$refs.dragger.css({ 
						'top': $this.height() - offset
					});

				break;
			}
		
	}
	
	/**
	 * Check if the width/height of the slider has changed
	 */
	 
	reveal.prototype._resize = function(){

		var _this = this,
			$this = _this.$this;
		
		var timeout;
		
		function checkSize(){
			if(_this.width != $this.width()){
				_this.width = $this.width();
			}
			
			if(_this.height != $this.height()){
				_this.height = $this.height();
			}
			
			timeout = setTimeout(checkSize, 100);
		}
		checkSize();
	
	} 
	 
	/**
	 * Loading State
	 */ 
	 
	 reveal.prototype._loadingState = function(){
	 	
		var _this = this,
			$this = _this.$this;
	 
		if(_this.settings.animation === true){
			_this.$refs.front.stop(true, false);
			_this.$refs.dragger.stop(true, false);
		}	 
		_this.is_loadingMedia = true;
		
	 	_this.settings.callbackChangeMedia(_this.getIndex(), _this._onLoadingComplete, _this);
	 	
	 }
	 
	 reveal.prototype._onLoadingComplete = function(_this){
			
			
	 	_this.is_loadingMedia = false;
	 	if(_this.settings.animation === true){
	 		_this.animation();
	 	}
	 	
	 }
	 
	/**
	 * Add slide
	 */
	
	reveal.prototype.addSlide = function(slides){
		
		var _this = this,
			$this = _this.$this;
				
		var length = slides.length;
		
		// rewrite the navigation
		if(_this.settings.navigation){
			var marks = '';
			for(var i=0; i < length; i++){
				marks += '<li>'+(length+i+1)+'</li>';
			}
			_this.$refs.navigation.append(marks);
			_this.$refs.navigation.children().click(function(){
				_this._navigationChanged($(this).index());
			});
		}
		
		// recalculate the total and check the multipleSlides value
		_this.total = _this.total + length;
		if(_this.total>1){
			_this.multipleSlides = true;
		}	
		
		// insert the new slide(s)
		for(var i in slides){	
			_this.$refs.slides.push(slides[i]);
		}
	} 

	/**
	 * Remove slide
	 */		
	 
	reveal.prototype.removeSlide = function(index){
		
		var _this = this,
			$this = _this.$this;
			
		var currentIndex = _this.getIndex();
		
		var length = index.length;
		
		// recalculate the total and check the multipleSlides value
		_this.total = _this.total - length;
		if(_this.total<2){
			_this.multipleSlides = false;
		}
		
		for(var i in index){
			// rewrite the navigation
			_this.$refs.navigation.children().each(function(j){
				if(j == index[i]){
					$(this).remove();
				}
			});
			// remove the content of the slide(s)
			_this.$refs.slides[index[i]] = '';
		}
		
		// reset the active class in the navigation
		if(_this.settings.navigation != false){
			_this._navigationActiveClass();	
		}
			
		// remove the slide(s) from the array
		for(var j=0 ; j<_this.$refs.slides.length ; j++){
			if(_this.$refs.slides[j] == ''){
				_this.$refs.slides.splice(j, 1);
				j--;
			}
		}
		
		// reset the currents displayed slides
		_this.$refs.front.hide().html($(_this.$refs.slides[currentIndex])).fadeIn(_this.settings.navigationTransitionSpeed);;
		currentIndex = (currentIndex-1 >= 0) ? currentIndex-1 : _this.total;
		_this.$refs.back.hide().html($(_this.$refs.slides[currentIndex])).fadeIn(_this.settings.navigationTransitionSpeed);;
		
	} 
	
		 
	/**
	 * Navigation
	 */
	 
	reveal.prototype.navigation = function(){
		
		var _this = this,
			$this = _this.$this;
		
		// rewrite the output
		var marks = '';
		for(var i=0; i < _this.$refs.slides.length; i++){
			marks += '<li>'+(i+1)+'</li>';
		}
		var output = '<ul class="navigation">'+marks+'</ul>';
		
		$this.prepend(output);
		
		// save the path to the navigation
		_this.$refs.navigation = $this.find('.navigation');
		
		_this.$refs.navigation.find('li:first-child').addClass('active');
		_this.$refs.navigation.css('z-index', 3).children().click(function(){
			_this._navigationChanged($(this).index());
		});
						
	} 
	
	reveal.prototype._navigationChanged = function(index){
	
		var _this = this,
			$this = _this.$this;
			
		var current = index;
			
		if(index+1 == _this.currentIndex || index == _this.total && _this.currentIndex == 0){
			return ;
		}
		
		if(_this.settings.animation === true){
			_this.$refs.front.stop(true, false);
			_this.$refs.dragger.stop(true, false);
		}
		_this.navigationChanged = true;
		
		_this.currentIndex = (index+1 <= _this.total) ? index+1: 0;
		
		_this.$refs.back.hide().html($(_this.$refs.slides[current])).fadeIn(_this.settings.navigationTransitionSpeed);
		
		index = (index+1 <= _this.total) ? index+1: 0;
		_this.$refs.front.hide().html($(_this.$refs.slides[index])).fadeIn(_this.settings.navigationTransitionSpeed, function(){
			if(_this.settings.animation === true){
				_this.navigationChanged = false;
				_this.animation();
			}
		});
		
		if(_this.settings.navigation != false){
			_this._navigationActiveClass();	
		}
	}
	
	reveal.prototype._navigationActiveClass = function(){
	
		var _this = this,
			$this = _this.$this;
			
			_this.$refs.navigation.children('li').removeClass('active');
			
			var index = _this.getIndex();
				index = (index-1 >= 0) ? index-1 : _this.total ;
				
			_this.$refs.navigation.children('li:eq('+index+')').addClass('active');
	}
	 
	/**
	 * Display the class "changing-media" while the media is changing
	 */ 
	 
	reveal.prototype._displayClassChangingMedia = function(){
	 	
		var _this = this,
			$this = _this.$this;
			
		// add a loading class
		_this.$refs.slider.addClass('changing-media');		
		setTimeout(function(){
			// remove the class
		    _this.$refs.slider.removeClass('changing-media');
		},_this.settings.timeoutClassChangeMedia);	 
	}
	 
	 
	
	/**
	 * Get the current slide
	 *
	 * @return		the current index
	 */
	 
	 reveal.prototype.getIndex = function(){
	 	var _this = this,
			$this = _this.$this;
			
		return _this.currentIndex;
	 }
	
	
	/**
	 * Update index
	 */
	
	reveal.prototype.updateIndex = function(){
	 	
	 	var _this = this,
			$this = _this.$this;
			
		
	 	_this.currentIndex = (_this.currentIndex+1 <= _this.total) ? _this.currentIndex+1 : 0;	
	 		
	 	if(_this.settings.navigation != false){	
	 		_this._navigationActiveClass();
	 	}
	 	_this._changeMedia();
	}
	
	/**
	 * Next media
	 */
	 
	 reveal.prototype.next = function(){
	 	
	 	var _this = this,
			$this = _this.$this;
			
		
		var index = _this.currentIndex;
	 	var current = index;
	 	
	 	
	 	if(_this.settings.animation === true){
			_this.$refs.front.stop(true, false);
			_this.$refs.dragger.stop(true, false);
		}
		_this.navigationChanged = true;
		
		_this.$refs.back.hide().html($(_this.$refs.slides[current])).fadeIn(_this.settings.navigationTransitionSpeed);
		
		index = (index+1 <= _this.total) ? index+1: 0;
		_this.currentIndex = index;
		
		_this.$refs.front.hide().html($(_this.$refs.slides[index])).fadeIn(_this.settings.navigationTransitionSpeed, function(){
			if(_this.settings.animation === true){
				_this.navigationChanged = false;
				_this.animation();
			}
		});
		
		if(_this.settings.navigation != false){
			_this._navigationActiveClass();	
		}
	}
	
	/**
	 * Previous media
	 */
	 
	 reveal.prototype.previous = function(){
	 	
	 	var _this = this,
			$this = _this.$this;

	 	
	 	_this.currentIndex = (_this.currentIndex-1 >= 0) ? _this.currentIndex-1 : _this.total;	
	 	
	 	var index = _this.currentIndex;
	 	var current = index;
	 	
	 	if(_this.settings.animation === true){
			_this.$refs.front.stop(true, false);
			_this.$refs.dragger.stop(true, false);
		}
		_this.navigationChanged = true;
		
		
		_this.$refs.back.hide().html($(_this.$refs.slides[current])).fadeIn(_this.settings.navigationTransitionSpeed);
		
		index = (index-1 >= 0) ? index-1: _this.total;
		
		_this.$refs.front.hide().html($(_this.$refs.slides[index])).fadeIn(_this.settings.navigationTransitionSpeed, function(){
			if(_this.settings.animation === true){
				_this.navigationChanged = false;
				_this.animation();
			}
		});
		
		if(_this.settings.navigation != false){
			_this._navigationActiveClass();	
		}

	}
	
	/**
	 * Change Media
	 */
	 
	reveal.prototype._changeMedia = function(){
	 	
	 	var _this = this,
			$this = _this.$this;
	 	
	 	var index = _this.getIndex();	
	 	
	 	if(_this.settings.callbackChangeMedia != null){
			_this._loadingState();
		} else {
			_this._displayClassChangingMedia();
		}
	 	
	 	
	 	if(_this.changed == 'back'){
	 		// replace the content in the back
		 	_this.$refs.back.html($(_this.$refs.slides[index]));
		 	_this.changed = 'front';
		 	
	 	} else {
	 		// replace the front content
	 		_this.$refs.front.html($(_this.$refs.slides[index]));
	 		_this.changed = 'back';
	 	}
	 	
	}
	 
	/**
	 * Disabled the user selection inside the wrapper when the dragger are moving
	 */ 
	 
	reveal.prototype._disabledUserSelectionWhenMoving = function(param){
		
	 	var _this = this,
			$this = _this.$this;
			
		_this.$refs.wrapper.attr('unselectable', 'on');	
			
		var mozParam = '-moz-none';
		
		if(param === 'all'){
			mozParam = param;
		}	
			


		$this.css({
			'-webkit-user-select'	: param,
			'-khtml-user-select'	: param,
			'-moz-user-select'		: mozParam,
			'-ms-user-select'		: param,
			'-o-user-select'		: param,
			'user-select'			: param	
		});
		
		_this.$refs.dragger.css({
			'-webkit-user-select'	: param,
			'-khtml-user-select'	: param,
			'-moz-user-select'		: mozParam,
			'-ms-user-select'		: param,
			'-o-user-select'		: param,
			'user-select'			: param	
		});
		
	} 

	/** 
	 * Check if the media should be changed
	 */

	 reveal.prototype.checkMousePositionToChangeMedia = function(){
	 	
	 	var _this = this,
			$this = _this.$this;

	 	// save the direction
		var direction = _this.settings.direction.toUpperCase();
		// save the axis
		var axis = (direction == 'LR' || direction == 'RL') ? 'X' : 'Y' ;
	 	
	 	if(_this.multipleSlides){
		 	if(_this.$refs.front.width() >= _this.$refs.wrapper.width()-_this.settings.changeMediaOffset && _this.changed == 'back' && axis == 'X'){
				_this.updateIndex();
			} else if(_this.$refs.front.width() <= 0+_this.settings.changeMediaOffset && _this.changed == 'front' && axis == 'X'){
				_this.updateIndex();
			} else if(_this.$refs.front.height() >= _this.$refs.wrapper.height()-_this.settings.changeMediaOffset && _this.changed == 'back' && axis == 'Y'){
				_this.updateIndex();
			} else if(_this.$refs.front.height() <= 0+_this.settings.changeMediaOffset && _this.changed == 'front' && axis == 'Y'){
				_this.updateIndex();
			}
		}						
	 }
	
	/** 
	 * Mouse Handler
	 */
	 
	 reveal.prototype.mouseHandler = function(){
	 	
	 	var _this = this,
			$this = _this.$this;
		
		// save the direction
		var direction = _this.settings.direction.toUpperCase();
		// save the axis
		var axis = (direction == 'LR' || direction == 'RL') ? 'X' : 'Y' ;
		
		// save the offset
		var offset = 0;
		// save the mouse position in X
		var mouseX = 0;
		// save the mouse position in Y
		var mouseY = 0;
		// save the new position of the front slide
		var position = 0;
		
		var positionMin = 0;
		var positionMax = 0;
		var wrapperOffset = String(_this.settings.wrapperOffset);
		
		// check if the wrapperOffset is in pixel or percent
		if(wrapperOffset.substr(wrapperOffset.length-1, wrapperOffset.length) == '%'){
			// remove the '%'
			wrapperOffset = wrapperOffset.substr(0, wrapperOffset.length-1);
		} else {
			// set it in percent
			wrapperOffset = (axis == 'X') ? wrapperOffset*100/$this.width() : wrapperOffset*100/$this.height();
		}
		
		// calulate and set the minimal/maximal positions
		positionMin = wrapperOffset;
		positionMax = 100 - wrapperOffset;
		
		function onmove(){
					
			// work out the new slide position (unity: percent)
			if(axis == 'X'){
				position = mouseX * 100 / _this.width;
			} else {
				position = mouseY * 100 / _this.height;
			}
			
			// check the mouse position to change the media
			_this.checkMousePositionToChangeMedia();
			
			// move the slide only inside the wrapper
			if(position >= positionMin && position <= positionMax){
			
				position = position + '%';
				
				// move the slide
				if(axis == 'X'){
					_this.$refs.front.width(position);
					_this.$refs.dragger.css({'left': position});	
				} else {
					_this.$refs.front.height(position);	
					_this.$refs.dragger.css({'top': position});
				}
				
			} else if(position > positionMax){
				
				// move the slide
				if(axis == 'X'){
					_this.$refs.front.width(positionMax+'%');
					_this.$refs.dragger.css({'left': positionMax+'%'});	
					
					if(
						_this.$refs.front.width() >= _this.$refs.wrapper.width()-_this.settings.changeMediaOffset && 
						_this.changed == 'back' && 
						_this.multipleSlides
					){
						_this.updateIndex();
					}
					
				} else {
					_this.$refs.front.height(positionMax+'%');	
					_this.$refs.dragger.css({'top': positionMax+'%'});
					
					if(
						_this.$refs.front.height() >= _this.$refs.wrapper.height()-_this.settings.changeMediaOffset && 
						_this.changed == 'back' && 
						_this.multipleSlides
					){
						_this.updateIndex();
					}
				}
			} else if(position < positionMin){
				if(axis == 'X'){
					_this.$refs.front.width(positionMin+'%');
					_this.$refs.dragger.css({'left': positionMin+'%'});	
					
					
					if(
						_this.$refs.front.width() <= 0+_this.settings.changeMediaOffset && 
						_this.changed == 'front' && 
						_this.multipleSlides
					){
						_this.updateIndex();
					}
					
				} else {
					_this.$refs.front.height(positionMin+'%');	
					_this.$refs.dragger.css({'top': positionMin+'%'});
					
					if(
						_this.$refs.front.height() <= 0+_this.settings.changeMediaOffset && 
						_this.changed == 'front' 
						&& _this.multipleSlides
					){
						_this.updateIndex();
					}
				}
			}
			
			// move the dragger on the oposite axis if it's not fixed
			if(!_this.settings.fixedDragger && axis == 'X'){
				// check if the Y position is inside the wrapper
				if(mouseY * 100 / _this.height >= 0 && mouseY * 100 / _this.height <= 100){
					_this.$refs.dragger.css({'top': (mouseY * 100 / _this.height)+'%'});
				} else if(mouseY * 100 / _this.height > 100){
					_this.$refs.dragger.css({'top': '100%'});
				} else if(mouseY * 100 / _this.height < 0){
					_this.$refs.dragger.css({'top': 0});
				}	
			} else if(!_this.settings.fixedDragger && axis == 'Y'){
				// check if the X position is inside the wrapper
				if(mouseX * 100 / _this.width >= 0 && mouseX * 100 / _this.width <= 100){
					_this.$refs.dragger.css({'left': (mouseX * 100 / _this.width)+'%'});	
				} else if(mouseX * 100 / _this.width > 100){
					_this.$refs.dragger.css({'left': '100%'});
				} else if(mouseX * 100 / _this.width < 0){
					_this.$refs.dragger.css({'left': 0});
				}
			}	

		}
		
		// touch event
		_this.$refs.slider.bind('touchstart', function(){
			
			_this.$refs.front.stop(true, false);
			_this.$refs.dragger.stop(true, false);
			
			_this.is_mousedown = true;
		
			// add an active class on the dragger
			_this.$refs.dragger.addClass('active');
		
			$(document).bind('touchmove',function(e){
				e.preventDefault();
				var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
				
				// save the wrapper's offset
				offset = $this.offset();
				// save the mouse position over the wrapper	
				mouseX = touch.pageX - offset.left;
				mouseY = touch.pageY - offset.top;
				
				onmove();
			});

		})
		
		$(document).bind('touchend', function(e){
			$(this).unbind('touchmove');
			
			_this.is_mousedown = false;
			
			if(_this.settings.animation === true){
				_this.animation();
			}
			
			// add an active class on the dragger
			_this.$refs.dragger.removeClass('active');
		});
				
				
		
		// handle the mousedown event
		_this.$refs.dragger.mousedown(function(){
		
			if(_this.settings.animation === true){
				_this.$refs.front.stop(true, false);
				_this.$refs.dragger.stop(true, false);
			}
			
			_this.is_mousedown = true;
			
			// remove the selection
			_this._disabledUserSelectionWhenMoving('none');

			// add an active class on the dragger
			$(this).addClass('active');
			
			// bind the mouse move function
			$(document).bind('mousemove', function(e) { 
				// save the wrapper's offset
				offset = $this.offset();
			
				// save the mouse position over the wrapper	
				mouseX = e.pageX - offset.left;
				mouseY = e.pageY - offset.top;
				onmove();					
			});
			
		});
		
		$(document).mouseup(function(e){
		
			_this.is_mousedown = false;

			// reset the selection
			_this._disabledUserSelectionWhenMoving('auto');

			// remove the dragger's active class
			_this.$refs.dragger.removeClass('active');
			
			// unbind the mousemove event
			$(this).unbind('mousemove');
			
			
			if(_this.settings.animation === true){
				_this.animation();
			}
			
		});
	}
	
	
	/**
	 * Animation
	 */
	 
	reveal.prototype.animation = function(position, settings){
		 	
		var _this = this,
			$this = _this.$this;
			
		// save the direction		
		var direction = _this.settings.direction.toUpperCase();	
		// save the axis
		var axis = (direction == 'LR' || direction == 'RL')? 'X' : 'Y';
		
		
		var toPosition = 0;
		var delay =  _this.settings.delay;
		var speed = _this.settings.speed;
		var easing = _this.settings.easing;

		if(position !== undefined){
		
			position = _this._setPercentinPixel(position);
			toPosition = position + 'px';
			
			if(settings !== undefined){
				delay = (settings.delay !== undefined)? settings.delay : delay;
				speed = (settings.speed !== undefined)? settings.speed : speed;
				easing = (settings.easing !== undefined)? settings.easing : easing;
			}
			
		} else {
		
			var currentPos = 0;
			var positionMin = 0;
			var positionMax = 0;
			
			var wrapperOffset = String(_this.settings.wrapperOffset);
		
			// check if the wrapperOffset is in pixel or percent
			if(wrapperOffset.substr(wrapperOffset.length-1, wrapperOffset.length) == '%'){
				// remove the '%'
				wrapperOffset = _this._setPercentinPixel(wrapperOffset);
			} 
		
			// calulate and set the minimal/maximal positions
			positionMin = wrapperOffset;
			positionMax =  (axis=='X') ? $this.width() - wrapperOffset : $this.height() - wrapperOffset;
		
		}
		
		var timer;
		
		function setAnimation(){
			
			if(_this.is_mousedown === false && _this.navigationChanged === false){		

				if(position === undefined){
					currentPos = (axis=='X') ? _this.$refs.front.width() : _this.$refs.front.height();
					
					if(_this.changed === 'back'){
						toPosition = positionMax;
						currentPos = 100 - currentPos*100/positionMax;

					} else {
						toPosition = positionMin;
						currentPos = currentPos*100/positionMax;
					}	
					speed = currentPos * _this.settings.speed / 100;				
				}
				
				var draggerCurrentPosition;
				
				if(axis == 'X'){
					draggerCurrentPosition = _this.$refs.dragger.css('left');
					draggerCurrentPosition = _this._setPercentinPixel(draggerCurrentPosition);
				
					_this.$refs.dragger.css({'left': draggerCurrentPosition+'px'});
				} else {
					draggerCurrentPosition = _this.$refs.dragger.css('top');
					draggerCurrentPosition = _this._setPercentinPixel(draggerCurrentPosition);
				
					_this.$refs.dragger.css({'top': draggerCurrentPosition+'px'});
				}
				
				if(axis == 'X'){
					function launchAnimationX(){
						if(_this.is_mousedown === false && _this.navigationChanged === false && _this.is_loadingMedia === false){
							_this.$refs.front.animate(
							{
								'width' : toPosition
							}, speed, easing);
							_this.$refs.dragger.animate(
							{
								'left': toPosition
							}, speed, easing, onComplete);	
							
							clearTimeout(timer);
						}
					}
					
					timer = setTimeout(launchAnimationX, delay);
						
				} else {	
					function launchAnimationY(){
						if(_this.is_mousedown === false && _this.navigationChanged === false && _this.is_loadingMedia === false){			
							_this.$refs.front.animate(
							{
								'height' : toPosition
							}, speed, easing);
							
							_this.$refs.dragger.animate(
							{
								'top': toPosition
							}, speed, easing, onComplete);
							clearTimeout(timer);
						}
					}
					timer = setTimeout(launchAnimationY, delay);				
				}
			}
			
		}
		setAnimation();
		
		function onComplete(){
			
			// check the mouse position to change the media
			_this.checkMousePositionToChangeMedia();
			
			if(!_this.multipleSlides){
				if(_this.changed === 'back'){
					_this.changed = 'front';
				} else {
					_this.changed = 'back';
				}
			}
			
			if(position === undefined && _this.is_mousedown === false && _this.navigationChanged === false && _this.is_loadingMedia === false){
				setAnimation();
			}
		}

	}	
	
	/**
	 * Move to
	 */
	 	 
	reveal.prototype.moveTo = function(position) {
		var _this = this,
			$this = _this.$this;
		
		// save the direction		
		var direction = _this.settings.direction.toUpperCase();	
		// save the axis
		var axis = (direction == 'LR' || direction == 'RL')? 'X' : 'Y';
	
		position = _this._setPercentinPixel(position);	
		position = position + 'px';
		
		if(axis == 'X'){
			_this.$refs.front.width(position);
			_this.$refs.dragger.css({'left': position});	
		} else {
			_this.$refs.front.height(position);
			_this.$refs.dragger.css({'top': position});	
		}
		
		// check the mouse position to change the media
		_this.checkMousePositionToChangeMedia();
	}
	
		
	/** 
	 * set Percent in Pixel
	 */	
	 
	reveal.prototype._setPercentinPixel = function(num){
		
		var _this = this,
			$this = _this.$this;
			
		num = String(num);
		if(num.substr(num.length-1, num.length-1) == '%'){
			num = num.substr(0, num.length-1);			
		} else {
			return num; 
		}
		
			
		// save the direction
		var direction = _this.settings.direction.toUpperCase();
		// save the axis
		var axis = (direction == 'LR' || direction == 'RL') ? 'X' : 'Y' ;
		
		if(axis == 'X'){
			num = num * _this.width / 100;
		} else {
			num = num * _this.height / 100;
		}
		
		return num;
	} 
	
		
	var methods = {
	
		/**
		 * Init :
		 */
		init : function(options) {
			return this.each(function() {
				// init plugin :
				var p = new reveal(this, options);
				// save plugin :
				$(this).data('reveal', p);
			});	
		},
	
		/**
		 * Next :
		 */
		next : function(){
			return this.each(function() {
				// call on plugin : 
				plugin_call(this, 'next');
			});
		},
		
		/**
		 * Previous :
		 */
		previous : function(){
			return this.each(function() {
				// call on plugin : 
				plugin_call(this, 'previous');
			});
		},
		
		/**
		 * Animate to Position :
		 */
		
		animateTo : function(position, settings) {
			return this.each(function() {
				// call on plugin :
				plugin_call(this, 'animation', position, settings);
			});
		},
		
		/**
		 * Move to position : 
		 */	
		 
		moveTo : function(position) {
		 	return this.each(function() {
		 		// call on plugin : 
		 		plugin_call(this, 'moveTo', position);
		 	});
		}, 
		 
		/**
		 * Add slide(s)
		 */
		  
		addSlide : function(settings) {
		  	return this.each(function() {
		  		// call on plugin :
		  		plugin_call(this, 'addSlide', settings);
		  	});
		},
		  
		/** 
		 * Remove slide(s)
		 */
		   
		removeSlide : function(settings) {
			return this.each(function() {
		   		// call on plugin :
		   		plugin_call(this, 'removeSlide', settings);
			});
		}
	};
	
	
	/**
	 * Call methods on plugin :
	 */
	function plugin_call(ref, method)
	{	
		// get plugin :
		var plugin = $(ref).data('reveal');
		// check plugin :
		if (plugin) {
			// call into plugin :
			return plugin[method].apply( plugin, Array.prototype.slice.call( arguments, 2 ));
		}
	}
	 
	/**
	 * jQuery bb_counter controller :
	 */
	$.fn.reveal = function(method) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.reveal' );
		}    
	}


})(jQuery);