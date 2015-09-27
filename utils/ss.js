// initialize namespace object
if(typeof SS == 'undefined') {
	SS = function() {};
}
// initialize namespace object
if(typeof SS.Utils == 'undefined') {
	SS.Utils = function() {};
}

// inherit
SS.inherit = function(oSubClass, oSuperClass) {
	var Inheritance = function() {};
	Inheritance.prototype = oSuperClass.prototype;
	oSubClass.prototype = new Inheritance();
	oSubClass.prototype.constructor = oSubClass;
	oSubClass.SUPERconstructor = oSuperClass;
	oSubClass.SUPERclass = oSuperClass.prototype;
}



/**
 * This is a blank class, which is used as superclass for all SS widgets
 * It holds all of interface functions needed
 */ 

SS.ingot = function() {
	alert('constructor executed');
}

// define eventlisteners array
SS.ingot.prototype.eventListeners = [];

/**
 * Fires an event
 * @param eventName {string} The name of event
 * @param parameter {string} Parameter, which will be passed to the event
 */
SS.ingot.prototype.fireEvent = function(eventName, parameter) {
	if(this.eventListeners[eventName]) {
		this.eventListeners[eventName](parameter);
	}
}

/**
 * Creates event listener
 * @param eventName {string} The name of event
 * @param eventFunction {function} Callback function
 */
SS.ingot.prototype.addEventListener = function(eventName, eventFunction) {
        if(typeof eventFunction == 'function') {
        	this.eventListeners[eventName] = eventFunction;
        }
}

/**
 * Converts element id to reference.
 *
 * @param {string} element Element id
 * @return Reference to element
 * @type object
 */
SS.ingot.getElementById = function(element) {
	if (typeof element == 'string') {
		return document.getElementById(element);
	}
	return element;
};


SS.Utils.isArray = function(obj) {
	return obj.constructor == Array;
}


/**
 * Returns absolute position of the element on the page and its dimensions.
 *
 * @private
 * @param {object} oEl Element object
 * @return Offset: left or x - left offset; top or y - top offset,
 * width - element width, height - element height
 * @object
 */
SS.Utils.getElementOffset = function(oEl) {
	// Check arguments
	if (!oEl) {
		return;
	}
	var iLeft = iTop = iWidth = iHeight = 0;
	var sTag;
	if (typeof oEl.getBoundingClientRect == 'function') {
		// IE
		var oRect = oEl.getBoundingClientRect();
		iLeft = oRect.left;
		iTop = oRect.top;
		iWidth = oRect.right - iLeft;
		iHeight = oRect.bottom - iTop;
		// getBoundingClientRect returns coordinates relative to the window
		iLeft += SS.Utils.getPageScrollX();
		iTop += SS.Utils.getPageScrollY();
		if (SS.is_ie) {
			// Why "- 2" is explained here:
			// http://msdn.microsoft.com/library/default.asp?url=/workshop/author/dhtml/reference/methods/getboundingclientrect.asp
			iLeft -= 2;
			iTop -= 2;
		}
	} else {
		// Others
		iWidth = oEl.offsetWidth;
		iHeight = oEl.offsetHeight;
		var sPos = SS.Utils.getStyleProperty(oEl, 'position');
		if (sPos == 'fixed') {
			iLeft = oEl.offsetLeft + SS.Utils.getPageScrollX();
			iTop = oEl.offsetTop + SS.Utils.getPageScrollY();
		} else if (sPos == 'absolute') {
			while (oEl) {
				sTag = oEl.tagName;
				if (sTag) {
					sTag = sTag.toLowerCase();
					// Safari adds margin of the body to offsetLeft and offsetTop values
					if (sTag != 'body' && sTag != 'html' || SS.is_khtml) {
						iLeft += parseInt(oEl.offsetLeft, 10) || 0;
						iTop += parseInt(oEl.offsetTop, 10) || 0;
					}
				}
				oEl = oEl.offsetParent;
				sTag = oEl ? oEl.tagName : null;
				if (sTag) {
					sTag = sTag.toLowerCase();
					if (sTag != 'body' && sTag != 'html') {
						iLeft -= oEl.scrollLeft;
						iTop -= oEl.scrollTop;
					}
				}
			}
		} else {
			var bMoz = (SS.is_gecko && !SS.is_khtml);
			var fStyle = SS.Utils.getStyleProperty;
			var oP = oEl;
			while (oP) {
				// -moz-box-sizing must be "border-box" to prevent subtraction of body
				// border in Mozilla
				if (bMoz) {
					sTag = oP.tagName;
					if (sTag) {
						sTag = sTag.toLowerCase();
						if (sTag == 'body' && !(fStyle(oP, '-moz-box-sizing') == 'border-box')) {
							iLeft += parseInt(fStyle(oP, 'border-left-width'));
							iTop += parseInt(fStyle(oP, 'border-top-width'));
						}
					}
				}
				iLeft += parseInt(oP.offsetLeft, 10) || 0;
				iTop += parseInt(oP.offsetTop, 10) || 0;
				oP = oP.offsetParent;
			}
			oP = oEl;
			while (oP.parentNode) {
				oP = oP.parentNode;
				sTag = oP.tagName;
				if (sTag) {
					sTag = sTag.toLowerCase();
					if (sTag != 'body' && sTag != 'html' && sTag != 'tr') {
						iLeft -= oP.scrollLeft;
						iTop -= oP.scrollTop;
					}
				}
			}
		}
	}
	return {
		left: iLeft,
		top: iTop,
		x: iLeft,
		y: iTop,
		width: iWidth,
		height: iHeight
	};
};

/**
 * Returns current document vertical scroll position.
 *
 * @return Current document vertical scroll position
 * @type number
 */
SS.Utils.getPageScrollY = function() {
	if (window.pageYOffset) {
		return window.pageYOffset;
	} else if (document.body && document.body.scrollTop) {
		return document.body.scrollTop;
	} else if (document.documentElement && document.documentElement.scrollTop) {
		return document.documentElement.scrollTop;
	}
	return 0;
};

/**
 * Returns current document horizontal scroll position.
 *
 * @return Current document horizontal scroll position
 * @type number
 */
SS.Utils.getPageScrollX = function() {
	if (window.pageXOffset) {
		return window.pageXOffset;
	} else if (document.body && document.body.scrollLeft) {
		return document.body.scrollLeft;
	} else if (document.documentElement && document.documentElement.scrollLeft) {
		return document.documentElement.scrollLeft;
	}
	return 0;
};

/**
 * Retrieves computed CSS property values from an element.
 *
 * @param {object} oEl Element object
 * @param {string} sPr Property name of element's style, e.g. "borderLeftWidth"
 * @return Computed CSS property value
 * @type string
 */
SS.Utils.getStyleProperty = function(oEl, sPr) {
	var oDV = document.defaultView;
	if (oDV && oDV.getComputedStyle) {
		// Standard
		var oCS = oDV.getComputedStyle(oEl, '');
		if (oCS) {
			sPr = sPr.replace(/([A-Z])/g, '-$1').toLowerCase();
			return oCS.getPropertyValue(sPr);
		}
	} else if (oEl.currentStyle) {
		// IE
		return oEl.currentStyle[sPr];
	}
	// None
	return oEl.style[sPr];
};

/// detect Opera browser
SS.is_opera = /opera/i.test(navigator.userAgent);

/// detect a special case of "web browser"
SS.is_ie = ( /msie/i.test(navigator.userAgent) && !SS.is_opera );

/// detect IE6.0/Win
SS.is_ie6 = ( SS.is_ie && /msie 6\.0/i.test(navigator.userAgent) );

/// detect IE7.0/Win
SS.is_ie7 = ( SS.is_ie && /msie 7\.0/i.test(navigator.userAgent) );

/// detect IE8.0/Win
SS.is_ie8 = ( SS.is_ie && /msie 8\.0/i.test(navigator.userAgent) );

/// detect IE for Macintosh
SS.is_mac_ie = ( /msie.*mac/i.test(navigator.userAgent) && !SS.is_opera );

/// detect KHTML-based browsers
SS.is_khtml = /Chrome|Safari|Konqueror|AppleWebKit|KHTML/i.test(navigator.userAgent);

/// detect Konqueror
SS.is_konqueror = /Konqueror/i.test(navigator.userAgent);

/// detect Gecko
SS.is_gecko = /Gecko/i.test(navigator.userAgent);

/// detect WebKit
SS.is_webkit = /WebKit/i.test(navigator.userAgent);

/// detect WebKit version
SS.webkitVersion = SS.is_webkit?parseInt(navigator.userAgent.replace(
				/.+WebKit\/([0-9]+)\..+/, "$1")):-1;
/// detect Google Chrome
SS.is_gchrome = /Chrome/i.test(navigator.userAgent);

/**
 * Returns current browser's window size without scrollbars. Calls
 * {@link SS.Utils#getWindowSize}, subtracts browser's scroll bar size, and
 * returns the result.
 *
 * <pre>
 * Returned object format:
 * {
 *   width: [number] window width in pixels,
 *   height: [number] window height in pixels
 * }
 * </pre>
 *
 * @return Window size without scrollbars
 * @type object
 */
SS.Utils.getWindowDimensions = function() {
	// Get window size
	var oSize = SS.Utils.getWindowSize();
	// Exception may occur if this function is called from <head>
	try {
		// Subtract scrollbars
		var iScrollX = window.pageXOffset || document.body.scrollLeft ||
		 document.documentElement.scrollLeft || 0;
		var iScrollY = window.pageYOffset || document.body.scrollTop ||
		 document.documentElement.scrollTop || 0;
		return {
			width: oSize.width - iScrollX,
			height: oSize.height - iScrollY
		};
	} catch (oException) {
		return oSize;
	};
};

/**
 * Returns current browser's window size. This is the usable size and does not
 * include the browser's menu and buttons.
 *
 * <pre>
 * Returned object format:
 * {
 *   width: [number] window width in pixels,
 *   height: [number] window height in pixels
 * }
 * </pre>
 *
 * @return Window size
 * @type object
 */
SS.Utils.getWindowSize = function() {
	var iWidth = 0;
	var iHeight = 0;
	// Exception may occur if this function is called from <head>
	try {
		if (SS.is_khtml) {
			iWidth = window.innerWidth || 0;
			iHeight = window.innerHeight || 0;
		} else if (document.compatMode && document.compatMode == 'CSS1Compat') {
			// Standards-compliant mode
			iWidth = document.documentElement.clientWidth || 0;
			iHeight = document.documentElement.clientHeight || 0;
		} else {
			// Non standards-compliant mode
			iWidth = document.body.clientWidth || 0;
			iHeight = document.body.clientHeight || 0;
		}
	} catch (oException) {};
	return {
		width: iWidth,
		height: iHeight
	};
};

/**
 * Makes a copy of an object.
 *
 * @param {object} oSrc Source object to clone
 */
SS.Utils.clone = function(oSrc) {
	// If object and not null
	if (typeof oSrc == 'object' && oSrc) {
		var oClone = new oSrc.constructor();
		var fClone = SS.Utils.clone;
		for (var sProp in oSrc) {
			oClone[sProp] = fClone(oSrc[sProp]);
		}
		return oClone;
	}
	return oSrc;
};

/**
 * Stops bubbling and propagation of an event.
 *
 * <pre>
 * Note for Safari:
 * If it doesn't work and listener is called, you can check returnValue property
 * of the event in the listener. If it is false, don't proceed further because
 * event has been stopped.
 * </pre>
 *
 * @param {object} oEvent Optional event object. Default: window.event.
 * @return Always false
 * @type boolean
 */
SS.Utils.stopEvent = function(oEvent) {
	oEvent || (oEvent = window.event);
	if (oEvent) {
		if (oEvent.stopPropagation) {
			oEvent.stopPropagation();
		}
		oEvent.cancelBubble = true;
		if (oEvent.preventDefault) {
			oEvent.preventDefault();
		}
		oEvent.returnValue = false;
	}
	return false;
};


SS.Utils.removeOnUnload = [];

/**
 * Adds event handler to certain element or widget using DOM addEventListener or
 * MSIE attachEvent method. Doing this means that you can add multiple handlers
 * for the same object and event, and they will be called in order.
 *
 * @param {object} oElement Element object
 * @param {string} sEvent Event name
 * @param {function} fListener Event listener
 * @param {boolean} bUseCapture Optional. Default: false. For details see
 *	http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html#Events-EventTarget-addEventListener
 * @param {boolean} bRemoveOnUnload Optional. Default: true. remove eventlistener
 *	on page unload.
 */
SS.Utils.addEvent = function(oElement, sEvent, fListener, bUseCapture) {
	if (oElement.addEventListener) {
		// W3C
		if (!bUseCapture) {
			bUseCapture = false;
		}
		oElement.addEventListener(sEvent, fListener, bUseCapture);
	} else if (oElement.attachEvent) {
		// IE
		oElement.detachEvent('on' + sEvent, fListener);
		oElement.attachEvent('on' + sEvent, fListener);
		if (bUseCapture) {
			oElement.setCapture(false);
		}
	}
};

/**
 * Removes event handler added with {@link SS.Utils#addEvent}.
 *
 * @param {object} oElement Element object
 * @param {string} sEvent Event name
 * @param {function} fListener Event listener
 * @param {boolean} bUseCapture Optional. Default: false. For details see
 * http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html#Events-EventTarget-removeEventListener
 */
SS.Utils.removeEvent = function(oElement, sEvent, fListener, bUseCapture) {
	if (oElement.removeEventListener) {
		// W3C
		if (!bUseCapture) {
			bUseCapture = false;
		}
		oElement.removeEventListener(sEvent, fListener, bUseCapture);
	} else if (oElement.detachEvent) {
		// IE
		oElement.detachEvent('on' + sEvent, fListener);
	}
};

SS.Utils.getElementsByClassName = function(className, tag, elm){
	var tag = tag || "*";
	var elm = elm || document;
	var elements = (tag == "*" && elm.all)? elm.all : elm.getElementsByTagName(tag);
	var returnElements = [];
	var current, aClasses;
	var length = elements.length;
	for(var i=0; i<length; i++) {
		current = elements[i];
		aClasses = current.className.split(' ');
		if(SS.Utils.inArray(aClasses, className)) {
			returnElements.push(current);
		}
	}
	return returnElements;
}

SS.Utils.removeClass = function(el, className) {
	if (!el || !el.className) {
		return;
	}
	var aClassNames = el.className.split(" ");
	for (var i = aClassNames.length; i > 0;) {
		if (aClassNames[--i] == className) {
			aClassNames.splice(i, 1);
		}
	}
	el.className = aClassNames.join(" ");
};

SS.Utils.addClass = function(el, className) {
	if (!el || el.className==null) {
		return;
	}
	SS.Utils.removeClass(el, className);
	el.className += " " + className;
};

SS.Utils.inArray = function(array, needle) {
	var i;
	var len = array.length;
	for(i=0; i<len; i++) {
		if(array[i]==needle) {
			return true;
		}
	}
	return false;
}

SS.Utils.findAndRemove = function(arr, needle) {
	if (!arr || !(arr instanceof Array)) {
		return;
	}
	for (var i = arr.length; i > 0;) {
		if (arr[--i] == needle) {
			arr.splice(i, 1);
		}
	}
	return arr;
};

SS.Utils.removeOnUnload = [];

/**
 * Adds event handler to certain element or widget using DOM addEventListener or
 * MSIE attachEvent method. Doing this means that you can add multiple handlers
 * for the same object and event, and they will be called in order.
 *
 * @param {object} oElement Element object
 * @param {string} sEvent Event name
 * @param {function} fListener Event listener
 * @param {boolean} bUseCapture Optional. Default: false. For details see
 *	http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html#Events-EventTarget-addEventListener
 * @param {boolean} bRemoveOnUnload Optional. Default: true. remove eventlistener
 *	on page unload.
 */
SS.Utils.addEvent = function(oElement, sEvent, fListener, bUseCapture, bRemoveOnUnload) {
	if (oElement.addEventListener) {
		// W3C
		if (!bUseCapture) {
			bUseCapture = false;
		}
		oElement.addEventListener(sEvent, fListener, bUseCapture);
	} else if (oElement.attachEvent) {
		// IE
		oElement.detachEvent('on' + sEvent, fListener);
		oElement.attachEvent('on' + sEvent, fListener);
		if (bUseCapture) {
			oElement.setCapture(false);
		}
	}
	if (typeof bRemoveOnUnload == 'undefined') {
		bRemoveOnUnload = true;
	}
	if (bRemoveOnUnload && SS.is_ie6) {
		SS.Utils.removeOnUnload.push({
			'element': oElement,
			'event': sEvent,
			'listener': fListener,
			'capture': bUseCapture
		});
	}
};


/**
 * Removes event handler added with {@link SS.Utils#addEvent}.
 *
 * @param {object} oElement Element object
 * @param {string} sEvent Event name
 * @param {function} fListener Event listener
 * @param {boolean} bUseCapture Optional. Default: false. For details see
 * http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html#Events-EventTarget-removeEventListener
 */
SS.Utils.removeEvent = function(oElement, sEvent, fListener, bUseCapture) {
	if (oElement.removeEventListener) {
		// W3C
		if (!bUseCapture) {
			bUseCapture = false;
		}
		oElement.removeEventListener(sEvent, fListener, bUseCapture);
	} else if (oElement.detachEvent) {
		// IE
		oElement.detachEvent('on' + sEvent, fListener);
	}
	for (var iLis = SS.Utils.removeOnUnload.length - 1; iLis >= 0; iLis--) {
		var oParams = SS.Utils.removeOnUnload[iLis];
		if (!oParams) {
			continue;
		}
		if (oElement == oParams['element'] && sEvent == oParams['event'] &&
		 fListener == oParams['listener'] && bUseCapture == oParams['capture']) {
			SS.Utils.removeOnUnload[iLis] = null;
			SS.Utils.removeEvent(
			 oParams['element'],
			 oParams['event'],
			 oParams['listener'],
			 oParams['capture']
			);
		}
	}
};



function preloadImages(aImageUrls) {
	var iUrl, elImage;
	images = [];
	var iUrlLength = aImageUrls.length;
	for(iUrl=0; iUrl<iUrlLength; iUrl++) {
		elImage = new Image(20,20);
		elImage.src = aImageUrls[iUrl];
		images.push(elImage);
	}
}

function $(sElement) {
	return document.getElementById(sElement);
}


/**
 * Create DOM element from text. Useful when you need to create node from HTML 
 * fragment and add it to the DOM tree.
 * @param {Object} txt HTML string
 * @return Created object
 * @type Object
 */
SS.Utils.convertHTML2DOM = function(txt){
	// return null if no content given
	if(!txt){
		return null;
	}

	// create temp container
	var el = document.createElement("div");
	el.innerHTML = txt;

	var currEl = el.firstChild;
	
	// search for first element node
	while(currEl != null && (!currEl.nodeType || currEl.nodeType != 1)){
		currEl = currEl.nextSibling;
	}
	
	SS.Utils.destroy(currEl);

	return currEl;
};

/**
 * Destroys the given element (remove it from the DOM tree) if it's not null
 * and it's parent is not null.
 *
 * @param el [HTMLElement] the element to destroy.
 */
SS.Utils.destroy = function(el) {
	if (el && el.parentNode) {
		el.parentNode.removeChild(el);
	}
};


SS.Utils.insertAfter = function(oNewNode, oExistingNode) {
	if(!oNewNode || !oExistingNode) {
		return;
	}
	// Insert cloned element after original
	if(oExistingNode.parentNode.lastchild == oExistingNode) {
		oExistingNode.parentNode.appendChild(oNewNode);
	} else {
		oExistingNode.parentNode.insertBefore(oNewNode, oExistingNode.nextSibling);
	}
}