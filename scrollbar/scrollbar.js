/**
 * @author Igor Kucheinyk (igorok@igorok.com)
 * 
 * @fileoverview Javascript scrollbar module
 * 
 */

// initialize namespace
if (typeof SS == 'undefined') {
	SS = function() {};
}

/**
 * Constructor of the scrollbar object
 * @constructor
 * @private
 * @param objArgs {object} Object configuration
 */
SS.scrollbar = function(objArgs) {
	this.config = objArgs;
	// if no eventlisteners
	if(!this.config.eventListeners) {
		this.config.eventListeners = [];
	}
	if(!objArgs.container) {
		alert('Scrollbar error: Container missing');
		return;
	}
	this.container = objArgs.container;
	if(objArgs.scrollbarContainer) {
		this.scrollbarContainer = objArgs.scrollbarContainer;
	}
	// Theme
	this.theme = this.config.theme ? this.config.theme : 'default';
	
    // added by Andrew
    // Display method (fixed (default) | auto).
    // If 'fixed' then container for scrollbar always visible. If 'auto', then automatic calculate show or not container for scrollbar.
	this.display = this.config.display ? this.config.display : 'fixed';
	
	var self = this;
	// register instance in objects array
	if(!SS.objects) SS.objects = [];
	this.objectId = SS.objects.length;
	SS.objects.push(this);
	
	this.status = 'visible';

	this.init();
}


/**
 * Initialize
 */
SS.scrollbar.prototype.init = function() {
	this.render();
}


/**
 * Render scrollbar
 *
 * @private
 * @param {object} oArg Arguments
 */
SS.scrollbar.prototype.render = function() {
	var self = this;
	// If scrollbar container is missing in config - it should be created
	if(!this.config.scrollbarContainer) {
		this.scrollbarContainer = document.createElement('div');
		// this.container.parentNode.insertBefore(this.scrollbarContainer, this.container.nextSibling);
		
		// added by Andrew
        // Found a bug, if this.container.nextSibling not exist then we have exception and script hangs
		if (this.container.nextSibling) {
            this.container.parentNode.insertBefore(this.scrollbarContainer, this.container.nextSibling);
		} else {
            this.container.parentNode.appendChild(this.scrollbarContainer);
		}
	}
	// Generate HTML layout
	this.scrollbarContainer.className = 'SSScrollbar_'+this.theme;
	this.scrollbarContainer.innerHTML = '<div>\
		<div class="ArrowUp" id="SSScrollbar' + this.objectId + 'ButtonTop"></div>\
		<div class="BarContainer" id="SSScrollbar' + this.objectId + 'BarContainer">\
			<div class="Slider" id="SSScrollbar' + this.objectId + 'Slider">\
				<div class="Top"></div>\
				<div class="Middle" id="SSScrollbar' + this.objectId + 'SliderMiddle">\
					<div></div>\
				</div>\
				<div class="Bottom"></div>\
			</div>\
		</div>\
		<div class="ArrowDown" id="SSScrollbar' + this.objectId + 'ButtonBottom"></div>\
	</div>';
	this.slider = document.getElementById('SSScrollbar' + this.objectId + 'Slider');
	this.sliderMiddle = document.getElementById('SSScrollbar' + this.objectId + 'SliderMiddle');
	this.barContainer = document.getElementById('SSScrollbar' + this.objectId + 'BarContainer');
	// Bar container events
	this.barContainer.onmousedown = function(event) {
		var oMouseCoords = self.mouseCoords(event);
		var oSliderOffset = SS.Utils.getElementOffset(self.slider);
		// If mouse position is on the slider
		if(oMouseCoords.top < oSliderOffset.top + oSliderOffset.height
			&& oMouseCoords.top > oSliderOffset.top
			&& oMouseCoords.left < oSliderOffset.left + oSliderOffset.left
			&& oMouseCoords.left > oSliderOffset.left) {
			
			// Start draggin it
			self.startDrag(event);
		} else {
			self.pageNavigation(event);
		}
	}
	this.barContainer.onmouseup = function(event) {
		self.stopDrag(event);
	}
	this.barContainer.onmousemove = function(event) {
		clearTimeout(self.releaseDragTimeout);
		self.dragSlider(event);
	}
	this.barContainer.onmouseout = function() {
		self.releaseDragTimeout = setTimeout(function() {
			self.drag = false;
		}, 500);		
	}
	this.buttonTop = document.getElementById('SSScrollbar' + this.objectId + 'ButtonTop');
	this.buttonBottom = document.getElementById('SSScrollbar' + this.objectId + 'ButtonBottom');
	// Top button events
	this.buttonTop.onmousedown = function(event) {
		self.keepScrolling = true;
		self.scrollUp();
	}
	this.buttonTop.onmouseup = function() {
		self.keepScrolling = false;
	}
	this.buttonTop.onmousemove = function() {
		self.keepScrolling = false;
	}
	// Bottom button events
	this.buttonBottom.onmousedown = function(event) {
		self.keepScrolling = true;
		self.scrollDown();
	}
	this.buttonBottom.onmouseup = function() {
		self.keepScrolling = false;
	}
	this.buttonBottom.onmousemove = function() {
		self.keepScrolling = false;
	}

	// Container must get thinner to get space for scrollbar
	var oContainerOffset = SS.Utils.getElementOffset(this.container);
	var oSliderOffset = SS.Utils.getElementOffset(this.scrollbarContainer);
	var iNewContainerWidth = oContainerOffset.width - oSliderOffset.width;
	this.container.style.width = iNewContainerWidth + 'px';
	
	// Set slider position
	this.updateSliderPosition();
}


/**
 * Updates slider box position and height on the scrollbar
 * it must reflect data length in the container
 *
 * @private
 */
SS.scrollbar.prototype.updateScrollbarPosition = function() {
	// Container must get thinner to get space for scrollbar
	var oContainerOffset = SS.Utils.getElementOffset(this.container);
	var oSliderOffset = SS.Utils.getElementOffset(this.scrollbarContainer);
	// Set scrollbar height
	this.scrollbarContainer.style.height = oContainerOffset.height + 'px';
	var oButtonTopOffset = SS.Utils.getElementOffset(this.buttonTop);
	var oButtonBottomOffset = SS.Utils.getElementOffset(this.buttonBottom);
	var iSliderHeight = oContainerOffset.height - oButtonTopOffset.height - oButtonBottomOffset.height;
	this.barContainer.style.height = iSliderHeight + 'px';	
	// Put slider next to container
	this.scrollbarContainer.style.top = oContainerOffset.top + 'px';
	this.scrollbarContainer.style.left = (oContainerOffset.left + oContainerOffset.width) + 'px';
}

/**
 * Updates slider box position and height on the scrollbar
 * it must reflect data length in the container
 *
 * @private
 */
SS.scrollbar.prototype.updateSliderPosition = function() {
	// First slider height must be updated
	var oContainerOffset = SS.Utils.getElementOffset(this.container);
	var iContainerScrollHeight = this.container.scrollHeight;
	// Check if scrollbar is needed, if not just hide it
	if(this.status=='visible' && iContainerScrollHeight <= Math.ceil(oContainerOffset.height)) {
		this.hideScrollbar();
	} else if(this.status=='hidden' &&  iContainerScrollHeight > Math.ceil(oContainerOffset.height)) {
		this.showScrollbar();
	}

    if (this.status=='visible') {
		this.updateScrollbarPosition();
        var oBarContainerOffset = SS.Utils.getElementOffset(this.barContainer);
    	// Calculate slider height
    	var iSliderMiddleHeight = Math.floor(oContainerOffset.height * oBarContainerOffset.height / iContainerScrollHeight);
    	this.sliderMiddle.style.height = iSliderMiddleHeight + 'px';
    	// Calculate slider position
    	var oSliderOffset = SS.Utils.getElementOffset(this.slider);
    	var iSliderTop = Math.floor(this.container.scrollTop * oBarContainerOffset.height / iContainerScrollHeight);
    	if(iSliderTop+oSliderOffset.height > oBarContainerOffset.height) {
    		iSliderTop = oBarContainerOffset.height - oSliderOffset.height;
    	}
    	this.slider.style.top = iSliderTop + 'px';
	}
}

/**
 * Hide scrollbar
 *
 * @private
 */
SS.scrollbar.prototype.hideScrollbar = function() {
    // added by Andrew
    this.defaultContainerScrollPosition();
    
    if(this.display=='fixed') {
        this.scrollbarContainer.style.display = 'none';
    } else if(this.display=='auto') {
    	// Container must get thinner to get space for scrollbar
     	var oContainerOffset = SS.Utils.getElementOffset(this.container);
    	var oSliderOffset = SS.Utils.getElementOffset(this.scrollbarContainer);
    	var iNewContainerWidth = oContainerOffset.width + oSliderOffset.width;
    	this.container.style.width = iNewContainerWidth + 'px';
    	this.scrollbarContainer.style.display = 'none';
	}
	this.status = 'hidden';
	// Run event
	if(this.config.eventListeners.hide) {
		this.config.eventListeners.hide();
	}
}

/**
 * Show scrollbar
 *
 * @private
 */
SS.scrollbar.prototype.showScrollbar = function() {
	// Container must get thinner to get space for scrollbar
	if(this.display=='fixed') {
        this.scrollbarContainer.style.display = 'block';
    } else if(this.display=='auto') {
     	this.scrollbarContainer.style.display = 'block';
    	var oContainerOffset = SS.Utils.getElementOffset(this.container);
    	var oSliderOffset = SS.Utils.getElementOffset(this.scrollbarContainer);
    	var iNewContainerWidth = oContainerOffset.width - oSliderOffset.width;
    	this.container.style.width = iNewContainerWidth + 'px';
	}	
	this.status = 'visible';
	// Run event
	if(this.config.eventListeners.show) {
		this.config.eventListeners.show();
	}
}

/**
 * Updates container scroll position to default
 * Set container scrolling to 0
 *
 * @private
 */
SS.scrollbar.prototype.defaultContainerScrollPosition = function() {
    this.container.scrollTop = 0 + 'px';
}

/**
 * Show scrollbar
 *
 * @private
 */
SS.scrollbar.prototype.hide = function() {
	// Container width is back
	var oContainerOffset = SS.Utils.getElementOffset(this.container);
	var oSliderOffset = SS.Utils.getElementOffset(this.scrollbarContainer);
	var iNewContainerWidth = oContainerOffset.width + oSliderOffset.width;
	this.container.style.width = iNewContainerWidth + 'px';
}

/**
 * Updates container scroll position according to position of the slider
 *
 * @private
 */
SS.scrollbar.prototype.updateContainerScrollPosition = function() {
	var oContainerOffset = SS.Utils.getElementOffset(this.container);
	var oSliderOffset = SS.Utils.getElementOffset(this.slider);
	var oBarContainerOffset = SS.Utils.getElementOffset(this.barContainer);
	var sliderOffsetTop = oSliderOffset.top - oBarContainerOffset.top;
	var iContainerScrollHeight = this.container.scrollHeight;
	var iContainerScrollTop = Math.ceil((iContainerScrollHeight-oContainerOffset.height) * sliderOffsetTop / (oBarContainerOffset.height-oSliderOffset.height));
	this.container.scrollTop = iContainerScrollTop;
}

/**
 * Scrolls the container up
 *
 * @private
 */
SS.scrollbar.prototype.scrollUp = function() {
	var self = this;
	if(this.keepScrolling) {		
		this.container.scrollTop -= 30;
		this.updateSliderPosition();
		setTimeout(function() {
			self.scrollUp();
		}, 100);
	}
}
/**
 * Scrolls the container down
 *
 * @private
 */
SS.scrollbar.prototype.scrollDown = function() {
	var self = this;
	if(this.keepScrolling) {		
		this.container.scrollTop += 30;
		this.updateSliderPosition();
		setTimeout(function() {
			self.scrollDown();
		}, 100);
	}
}

/**
 * Called when mouse down on the slider
 *
 * @private
 */
SS.scrollbar.prototype.startDrag = function(event) {
	this.drag = true;
	var oSliderOffset = SS.Utils.getElementOffset(this.slider);
	var oMousePosition  = this.mouseCoords(event);
	// Keep mouse offset
	this.mouseOffset = {
		left: oMousePosition.left - oSliderOffset.left, 
		top: oMousePosition.top - oSliderOffset.top
	};
}

/**
 * Called when mouse up on the slider
 *
 * @private
 */
SS.scrollbar.prototype.stopDrag = function() {
	this.drag = false;
	this.mouseOffset = null;
}

/**
 * Called when mouse moves over the slider
 *
 * @private
 */
SS.scrollbar.prototype.dragSlider = function(event) {
	if(this.drag) {
		var oMousePosition  = this.mouseCoords(event);
		var oBarContainerOffset = SS.Utils.getElementOffset(this.barContainer);
		var oSliderOffset = SS.Utils.getElementOffset(this.slider);
		var iSliderTop = oMousePosition.top - oBarContainerOffset.top - this.mouseOffset.top;
		if(iSliderTop < 0) {
			iSliderTop = 0;
		} else if(iSliderTop > (oBarContainerOffset.height - oSliderOffset.height)) {
			iSliderTop = oBarContainerOffset.height - oSliderOffset.height;
		}		
		this.slider.style.top = iSliderTop + 'px';
		this.updateContainerScrollPosition();
	}
}

/**
 * Return mouse coordinates
 *
 * @private
 */
SS.scrollbar.prototype.mouseCoords = function(event) {
	if(event.pageX || event.pageY){
		return {
			left: event.pageX,
			top: event.pageY
		};
	}
	return {
		left: event.clientX + document.body.scrollLeft - document.body.clientLeft,
		top: event.clientY + document.body.scrollTop  - document.body.clientTop
	};
}

/**
 * Jump 1 page up or down depending on mouse position (above or below the slider)
 *
 * @private
 */
SS.scrollbar.prototype.pageNavigation = function(event) {
	var oMouseCoords = this.mouseCoords(event);
	var oSliderOffset = SS.Utils.getElementOffset(this.slider);
	if(oMouseCoords.top < oSliderOffset.top) {
		this.pageUp();
	} else if(oMouseCoords.top > oSliderOffset.top + oSliderOffset.height) {
		this.pageDown();
	}
}

/**
 * Moves the screen 1 page up
 *
 * @private
 */
SS.scrollbar.prototype.pageUp = function(event) {
	var oBarContainerOffset = SS.Utils.getElementOffset(this.barContainer);
	var oSliderOffset = SS.Utils.getElementOffset(this.slider);
	var iSliderTop = oSliderOffset.top - oBarContainerOffset.top - oSliderOffset.height;
	if(iSliderTop < 0) {
		iSliderTop = 0;
	} else if(iSliderTop > (oBarContainerOffset.height - oSliderOffset.height)) {
		iSliderTop = oBarContainerOffset.height - oSliderOffset.height;
	}
	this.slider.style.top = iSliderTop + 'px';
	this.updateContainerScrollPosition();
}
/**
 * Moves the screen 1 page down
 *
 * @private
 */
SS.scrollbar.prototype.pageDown = function(event) {
	var oBarContainerOffset = SS.Utils.getElementOffset(this.barContainer);
	var oSliderOffset = SS.Utils.getElementOffset(this.slider);
	var iSliderTop = oSliderOffset.top - oBarContainerOffset.top + oSliderOffset.height;
	if(iSliderTop > (oBarContainerOffset.height - oSliderOffset.height)) {
		iSliderTop = oBarContainerOffset.height - oSliderOffset.height;
	}
	this.slider.style.top = iSliderTop + 'px';
	this.updateContainerScrollPosition();
}