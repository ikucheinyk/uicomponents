/**
 * @author Igor Kucheinyk (igorok@igorok.com)
 * 
 * @fileoverview Javascript calendar module
 * 
 */

// initialize namespace
if (typeof SS == 'undefined') {
	SS = function() {};
}

/**
 * Constructor of the calendar object
 * @constructor
 * @private
 * @param objArgs {object} Object configuration
 */
SS.DatePicker = function(objArgs) {
	this.config = objArgs;
	// if no eventlisteners
	if(!this.config.eventListeners) {
		this.config.eventListeners = [];
	}
	if(objArgs.element) {
		this.element = objArgs.element;
	} else {
		alert('DatePicker initialization failed: trigger element missing');
	}
	this.expandEvent = this.config.expandEvent || 'focus';
	// register instance in objects array
	if(!SS.objects) SS.objects = [];
	this.objectId = SS.objects.length;
	SS.objects.push(this);

	this.init();
}

/**
 * Initialize
 */
SS.DatePicker.prototype.init = function() {
	var self = this;
	var oElementOffset = SS.Utils.getElementOffset(this.element);
	this.container = document.createElement('div');
	this.container.style.position = 'absolute';
	this.container.style.left = oElementOffset.left + 'px';
	this.container.style.top = (oElementOffset.top + oElementOffset.height) + 'px';
	this.container.style.display = 'none';
	SS.Utils.insertAfter(this.container, this.element);
	SS.Utils.addEvent(this.element, 'click', function(oEvent) {
		self.container.style.display = 'block';
		SS.Utils.stopEvent(oEvent);
	}, false);
	SS.Utils.addEvent(document, 'click', function(oEvent) {
		self.container.style.display = 'none';
		SS.Utils.stopEvent(oEvent);
	}, false);

	this.calendar = new SS.calendar({
		theme: this.config.theme,
		container: this.container,
		weekStart: 'sun',
		eventListeners: {

		}
	});
}

