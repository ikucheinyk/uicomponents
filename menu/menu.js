/**
 * @author Igor Kucheinyk (igorok@igorok.com)
 * 
 * @fileoverview Menu module
 * 
 */

// initialize namespace
if (typeof SS == 'undefined') {
	SS = function() {};
}


/**
 * Constructor of the object
 * @constructor
 * @param objArgs {object} descr
 */
SS.Menu = function(objArgs) {
	this.config = objArgs;
	var self = this;

	// register instance in objects array
	if(!SS.objects) SS.objects = [];
	this.objectId = SS.objects.length;
	SS.objects.push(this);
	
	this.theme = this.config.theme || 'default';
	this.level = this.config.level || 0;
	this.tableLayout = this.config.tableLayout ? true : false;
	this.children = [];
	
	// Check if Utils loaded
	if(!SS.Utils) {
		alert('Error while initializing menu, missing `utils/ss.js`');
		return;
	}
	
	if(!objArgs.container) {
		alert('Container not found');
	}
	this.container = objArgs.container;
	
	// proceed with initialization
	this.init();
}

// inherit basic functionality
//SS.inherit(SS.Menu, SS.ingot);


/**
 * Initialize
 */
SS.Menu.prototype.init = function() {
	// Create DOM
	this.createDomStructure();
	// Create sub nodes
	this.createChildren();
};

/**
 * Creates dom structure
 */
SS.Menu.prototype.createDomStructure = function() {
	var self = this;
	// Create children DOM structure
	var elContainer = document.createElement("div");
	this.container.appendChild(elContainer);
	this.container = elContainer;
	elContainer.className = 'ssMenuChildren_' + this.theme;
	var elTop = document.createElement("div");
	elTop.className = 'ChildrenTop';
	var elBottom = document.createElement("div");
	elBottom.className = 'ChildrenBottom';
	var elMiddleNodes = document.createElement("div");
	elMiddleNodes.className = 'ChildrenNodes';
	this.container.appendChild(elTop);
	this.container.appendChild(elMiddleNodes);
	this.container.appendChild(elBottom);
	this.childrenNodes = elMiddleNodes;
	if(this.tableLayout) {
		this.childrenNodes.innerHTML = '<table cellpadding="0" cellspacing="0" border="0"><tbody><tr></tr></tbody></table>';
	} else {
		this.childrenNodes.innerHTML = '<ul></ul>';
	}
};


/**
 * Function that convert a html to json object.
 *
 * @private
 * @param {object} HTML tag <UL> or sub element
 * @return JSON object
 */
SS.Menu.prototype.DOM2JSON = function(oSource){
	if(!oSource){
		return;
	}
	var oUL = oSource;
	var oJSON = {};
	this.convertHtmlToJson(oJSON, oUL);
	return oJSON;
};

/**
 * Function that creates a (sub)tree of json object.
 *
 * This function walks the HTML element, computes and assigns CSS class names
 * and creates JSON elements for a subtree.
 * Each time a sub element is encountered, convertHtmlToJson() is called which
 * effectively creates the item.  Beware that convertHtmlToJson() might call back this
 * function in order to create the item's subtree. (so convertHtmlToJson and convertHtmlToJson
 * form an indirect recursion).
 *
 * @private
 * @param {object} JSON element
 * @param {object} HTML UL tag that should hold the (sub)tree
 */
SS.Menu.prototype.convertHtmlToJson = function(subJSON, ulElem){
	if(!subJSON || !ulElem){
		return;
	}
	var oJSON = subJSON;
	var oUL 	= ulElem;
	var tmpClassName = null;
	if(oUL.className){
		tmpClassName = oUL.className;
	}

	for(var ii = 0; ii < oUL.childNodes.length; ii++ ){
		var elem = oUL.childNodes[ii];
		if(elem.nodeType == 1 && elem.tagName == "LI"){
			if(!oJSON.children){
				oJSON.children = [];
			}
			var tmpObj = {};
			oJSON.children[oJSON.children.length] = tmpObj;
			if(tmpClassName){
				tmpObj.parentDivClassName = tmpClassName;
			}
			if(elem.getAttribute("title")){
				tmpObj.title = elem.getAttribute("title");
			}
			if(elem.getAttribute("id")){
				tmpObj.id = elem.getAttribute("id");
			}
			if(elem.className){
			  tmpObj.className = elem.className;
			}

			// if item have the html elements
			for(var kk = 0; kk < elem.childNodes.length; kk++){
				var tmpElem = elem.childNodes[kk];
				if(tmpElem.nodeType == 1 && tmpElem.tagName != "A" && tmpElem.tagName != "HR" && tmpElem.tagName != "UL" && tmpElem.tagName != "IMG"){
					tmpObj.enableHTML = true;
					tmpObj.valueHTML = elem.innerHTML;
					break;
				}
			}
			//in other time
			for(var jj = 0; jj < elem.childNodes.length; jj++){
				var tmpElem = elem.childNodes[jj];

				if(tmpElem.nodeType == 1 && tmpElem.tagName == "IMG"){
					if(tmpElem.getAttribute("src")){
						tmpObj.img = tmpElem.getAttribute("src");
					}
					if(tmpElem.getAttribute("class")){
						tmpObj.className = tmpElem.getAttribute("class");
					}
				}
				// if no tag <A> search not empty text node
				if(tmpElem.nodeType == 3){
					String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g, ''); };
					var nodeTXT = tmpElem.nodeValue.trim();
					if(nodeTXT.length){
						tmpObj.label = "<span>" + nodeTXT + "</span>";
					}
				}
				// if tag is <A>
				if(tmpElem.nodeType == 1 && tmpElem.tagName == "A") {
					if(tmpElem.innerHTML) {
					tmpObj.label = tmpElem.innerHTML;
					}
					if(tmpElem.getAttribute("onclick")) {
					tmpObj.onclick = tmpElem.getAttribute("onclick");
					}
					if(tmpElem.getAttribute("href")) {
					tmpObj.link = tmpElem.getAttribute("href");
					}
					if(tmpElem.getAttribute("target")) {
						tmpObj.target = tmpElem.getAttribute("target");
					}
				}
				if(tmpElem.nodeType == 1 && tmpElem.tagName == "HR") {
					tmpObj.hr = "true";
				}
				if(tmpElem.nodeType == 1 && tmpElem.tagName == "UL") {
					this.convertHtmlToJson(tmpObj, tmpElem);
				}
			}
		}
	}
};


/**
 * Creates children objects
 */
SS.Menu.prototype.parseSource = function() {
	if(this.config.sourceType=='html') {
		this.children = this.DOM2JSON(this.config.source).children;
	} else if(this.config.sourceType=='html/text') {
		this.children = this.HTML2JSON();
	} else if(this.config.sourceType=='html/url') {
		// will be implemented later
	} else if(this.config.sourceType=='json/url') {
		// will be implemented later
	} else {
		// Just use json
		if(this.config.children instanceof Array) {
			this.children = this.config.children;
		} else {
			this.children = [];
		}
	}
};

/**
 * Creates children objects
 */
SS.Menu.prototype.createChildren = function() {
	// Parse the source to be json
	this.parseSource();
	if(!this.children || !(this.children instanceof Array) || this.children.length==0) {
		return;
	}
	// Go through all children and create object for each one
	var iChild, iChildLength, oChild;
	iChildLength = this.children.length;
	for (iChild=0; iChild<iChildLength; iChild++) {
		oChild = this.children[iChild];
		// Create child
		this.addChild(oChild);
	}
}

/**
 * Creates children objects
 * @param sName {string} Menuitem label
 * @param aChildren {array} JSON array with nodes
 * @return Created node object
 */
SS.Menu.prototype.addChild = function(objArgs) {
	// Add node triggerElement
	if(this.tableLayout) {
		var elTable = this.childrenNodes.getElementsByTagName('table')[0];
		var elRow = elTable.rows[0];
		var elTrigger = elRow.insertCell(-1);
	} else {
		var elList = this.childrenNodes.getElementsByTagName('ul')[0];
		var elTrigger = document.createElement("li");
		elList.appendChild(elTrigger);
	}
	// Add class name if it was defined
	if(objArgs.className) {
		elTrigger.className = objArgs.className + ' ';
	}
	elTrigger.className+= 'Item';
	var sUrl = '';
	if(objArgs.link) {
		sUrl = " onclick=\"window.location.href='" + objArgs.link + "'\"";
	}
	elTrigger.innerHTML = '<div ' + sUrl + '>' + objArgs.label + '</div>';
	objArgs.parent = this;
	objArgs.triggerElement = elTrigger;
	objArgs.level = this.level + 1;
	if(!objArgs.expandDirection && this.level==0) {
		objArgs.expandDirection = 'DownRight';
	}
	// Create node object
	var oNewNode = new SS.MenuNode(objArgs);
	// Trigger element should have expand direction classname
	// to expand styling customization
	//SS.Utils.addClass(elTrigger, oNewNode.expandDirection);
	// Create a link for the node in the children array
	this.children.push(oNewNode);
}


//---------------------------------------------------------



/**
 * Constructor of the object
 * @constructor
 * @param objArgs {object} descr
 */
SS.MenuNode = function(objArgs) {
	this.config = objArgs;
	var self = this;

	// register instance in objects array
	if(!SS.objects) SS.objects = [];
	this.objectId = SS.objects.length;
	SS.objects.push(this);
	
	this.theme = this.config.theme || 'default';
	this.level = this.config.level || 0;
	this.expandDirection = this.config.expandDirection || 'RightDown';
	this.children = [];
	this.parent = this.config.parent;
	this.label = this.config.label;
	// Get tableLayout
	if(typeof(this.config.tableLayout) == 'boolean') {
		// Keep table layout
		this.tableLayout = this.config.tableLayout;
	} else if(this.parent && typeof(this.parent.tableLayout) == 'boolean') {
		// If there is no tableLayout in objArgs, inherit it from parent node
		this.tableLayout = this.parent.tableLayout ? true : false;
	} else {
		// For default UL layout enabled
		this.tableLayout = false;
	}
	// Get theme
	if(typeof(this.config.theme) == 'string') {
		// Keep table layout
		this.theme = this.config.theme;
	} else if(this.parent && typeof(this.parent.theme) == 'string') {
		// If there is no theme in objArgs, inherit it from parent node
		this.theme = this.parent.theme;
	} else {
		// Set default theme
		this.theme = 'default';
	}
	
	// Check if Utils loaded
	if(!SS.Utils) {
		alert('Error while initializing menu, missing `utils/ss.js`');
		return;
	}
	
	if(!objArgs.triggerElement) {
		alert('triggerElement not found');
	}
	this.triggerElement = objArgs.triggerElement;
	
	// proceed with initialization
	this.init();
}

// inherit basic functionality
SS.inherit(SS.MenuNode, SS.ingot);


/**
 * Initialize
 */
SS.MenuNode.prototype.init = function() {
	// Create DOM
	this.createDomStructure();
	// Create sub nodes
	this.createChildren();
};

/**
 * Creates dom structure
 */
SS.MenuNode.prototype.createDomStructure = function() {
	var self = this;
	// Create children DOM structure
	this.container = document.createElement("div");
	this.container.style.visibility = 'hidden';
	this.container.className = 'ssMenuNodeChildren_' + this.theme;
	
	document.body.appendChild(this.container);
	this.triggerElement.onmouseover = function() {
		if(self.collapseTimeout) clearTimeout(self.collapseTimeout);
		SS.Utils.addClass(this, 'Hovered');
		self.expand();
	}
	this.triggerElement.onmouseout = function() {
		SS.Utils.removeClass(this, 'Hovered');
		self.collapseTimeout = setTimeout(function(){
			self.collapse();
		}, 20);
	}
	// Mouse events for children container
	this.container.onmouseover = function() {
		// Cancel branch collapse
		if(self.collapseTimeout) {
			clearTimeout(self.collapseTimeout);
		}
		// Cancel parent branch collapse
		if(self.parent && self.parent.collapseTimeout) {
			clearTimeout(self.parent.collapseTimeout);
		}
	}
	this.container.onmouseout = function() {
		self.collapseTimeout = setTimeout(function(){
			self.collapse();
			if(self.parent) {
				self.parent.collapseTimeout = setTimeout(function(){
					if(self.parent.collapse) {
						self.parent.container.onmouseout();
					}
				}, 20);
			}
		}, 20);
	}

/* 	var elTop = document.createElement("div");
	elTop.className = 'ChildrenTop';
	var elBottom = document.createElement("div");
	elBottom.className = 'ChildrenBottom'; */
	var elMiddleNodes = document.createElement("div");
	elMiddleNodes.className = 'ChildrenNodes';
	//this.container.appendChild(elTop);
	//this.container.appendChild(elBottom);
	this.container.appendChild(elMiddleNodes);
	this.childrenNodes = elMiddleNodes;
	if(this.tableLayout) {
		this.childrenNodes.innerHTML = '<table cellpadding="0" cellspacing="0" border="0"><tbody></tbody></table>';
	} else {
		this.childrenNodes.innerHTML = '<ul></ul>';
	}
};

/**
 * Expands the node
 */
SS.MenuNode.prototype.expand = function() {
	if(this.expanded || !this.children || !this.children.length) {
		return;
	}
	var tDelay = 50;
	var self = this;
	this.expanded = true;
	this.setChildrenElementPosition();
	SS.Utils.addClass(self.triggerElement, 'Expanded');
	// Disable animation for IE
	if(SS.is_ie) {
		self.container.style.visibility = 'visible';
		return;
	}
	var fAnimate = function() {
		SS.Utils.addClass(self.container, 'Frame1');
		self.container.style.visibility = 'visible';
		setTimeout(function() {
			SS.Utils.removeClass(self.container, 'Frame1');
			SS.Utils.addClass(self.container, 'Frame2');
			setTimeout(function() {
				SS.Utils.removeClass(self.container, 'Frame2');
				SS.Utils.addClass(self.container, 'Frame3');
				setTimeout(function() {
					SS.Utils.removeClass(self.container, 'Frame3');
				}, tDelay);
			}, tDelay);
		}, tDelay);
	}
	fAnimate();
}


/**
 * Collapses the node
 */
SS.MenuNode.prototype.collapse = function() {
	if(!this.expanded) {
		return;
	}
	var tDelay = 50;
	var self = this;
	this.expanded = false;
	// Disable animation for IE
	if(SS.is_ie) {
		self.container.style.visibility = 'hidden';
		SS.Utils.removeClass(self.triggerElement, 'Expanded');
		return;
	}

	var fAnimate = function() {
		SS.Utils.addClass(self.container, 'Frame3');
		setTimeout(function() {
			SS.Utils.removeClass(self.container, 'Frame3');
			SS.Utils.addClass(self.container, 'Frame2');
			setTimeout(function() {
				SS.Utils.removeClass(self.container, 'Frame2');
				SS.Utils.addClass(self.container, 'Frame1');
				setTimeout(function() {
					SS.Utils.removeClass(self.container, 'Frame1');
					self.container.style.visibility = 'hidden';
					SS.Utils.removeClass(self.triggerElement, 'Expanded');
				}, tDelay);
			}, tDelay);
		}, tDelay);
	}
	fAnimate();
}


/**
 * Sets position of the expanding panel that contains the children
 */
SS.MenuNode.prototype.setChildrenElementPosition = function() {
	var offTriggerElement = SS.Utils.getElementOffset(this.triggerElement);
	var offContainer = SS.Utils.getElementOffset(this.container);
	var iPositionTop, iPositionLeft;
	if(this.expandDirection=='DownRight') {
		iPositionTop = offTriggerElement.top + offTriggerElement.height;
		iPositionLeft = offTriggerElement.left;
	} else if(this.expandDirection=='DownLeft') {
		iPositionTop = offTriggerElement.top + offTriggerElement.height;
		iPositionLeft = offTriggerElement.left + offTriggerElement.width - offContainer.width;
	} else if(this.expandDirection=='LeftDown') {
		iPositionTop = offTriggerElement.top;
		iPositionLeft = offTriggerElement.left - offContainer.width;
	} else if(this.expandDirection=='LeftUp') {
		iPositionTop = offTriggerElement.top + offTriggerElement.height - offContainer.height;
		iPositionLeft = offTriggerElement.left - offContainer.width;
	} else if(this.expandDirection=='UpRight') {
		iPositionTop = offTriggerElement.top - offContainer.height;
		iPositionLeft = offTriggerElement.left;
	} else if(this.expandDirection=='UpLeft') {
		iPositionTop = offTriggerElement.top - offContainer.height;
		iPositionLeft = offTriggerElement.left + offTriggerElement.width - offContainer.width;
	} else if(this.expandDirection=='RightUp') {
		iPositionTop = offTriggerElement.top + offTriggerElement.height - offContainer.height;
		iPositionLeft = offTriggerElement.left + offTriggerElement.width;
	} else {
		// RightDown
		iPositionTop = offTriggerElement.top;
		iPositionLeft = offTriggerElement.left + offTriggerElement.width;
	}
	this.container.style.top = iPositionTop + 'px';
	this.container.style.left = iPositionLeft + 'px';
}



/**
 * Function that convert a html to json object.
 *
 * @private
 * @param {object} HTML tag <UL> or sub element
 * @return JSON object
 */
SS.MenuNode.prototype.DOM2JSON = function(oSource){
	if(!oSource){
		return;
	}
	var oUL = oSource;
	var oJSON = {};
	this.convertHtmlToJson(oJSON, oUL);
	return oJSON;
};

/**
 * Function that creates a (sub)tree of json object.
 *
 * This function walks the HTML element, computes and assigns CSS class names
 * and creates JSON elements for a subtree.
 * Each time a sub element is encountered, convertHtmlToJson() is called which
 * effectively creates the item.  Beware that convertHtmlToJson() might call back this
 * function in order to create the item's subtree. (so convertHtmlToJson and convertHtmlToJson
 * form an indirect recursion).
 *
 * @private
 * @param {object} JSON element
 * @param {object} HTML UL tag that should hold the (sub)tree
 */
SS.MenuNode.prototype.convertHtmlToJson = function(subJSON, ulElem){
	if(!subJSON || !ulElem){
		return;
	}
	var oJSON = subJSON;
	var oUL 	= ulElem;
	var tmpClassName = null;
	if(oUL.className){
		tmpClassName = oUL.className;
	}

	for(var ii = 0; ii < oUL.childNodes.length; ii++ ){
		var elem = oUL.childNodes[ii];
		if(elem.nodeType == 1 && elem.tagName == "LI"){
			if(!oJSON.children){
				oJSON.children = [];
			}
			var tmpObj = {};
			oJSON.children[oJSON.children.length] = tmpObj;
			if(tmpClassName){
				tmpObj.parentDivClassName = tmpClassName;
			}
			if(elem.getAttribute("title")){
				tmpObj.title = elem.getAttribute("title");
			}
			if(elem.getAttribute("id")){
				tmpObj.id = elem.getAttribute("id");
			}
			if(elem.className){
			  tmpObj.className = elem.className;
			}

			// if item have the html elements
			for(var kk = 0; kk < elem.childNodes.length; kk++){
				var tmpElem = elem.childNodes[kk];
				if(tmpElem.nodeType == 1 && tmpElem.tagName != "A" && tmpElem.tagName != "HR" && tmpElem.tagName != "UL" && tmpElem.tagName != "IMG"){
					tmpObj.enableHTML = true;
					tmpObj.valueHTML = elem.innerHTML;
					break;
				}
			}
			//in other time
			for(var jj = 0; jj < elem.childNodes.length; jj++){
				var tmpElem = elem.childNodes[jj];

				if(tmpElem.nodeType == 1 && tmpElem.tagName == "IMG"){
					if(tmpElem.getAttribute("src")){
						tmpObj.img = tmpElem.getAttribute("src");
					}
					if(tmpElem.getAttribute("class")){
						tmpObj.className = tmpElem.getAttribute("class");
					}
				}
				// if no tag <A> search not empty text node
				if(tmpElem.nodeType == 3){
					String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g, ''); };
					var nodeTXT = tmpElem.nodeValue.trim();
					if(nodeTXT.length){
						tmpObj.label = "<span>" + nodeTXT + "</span>";
					}
				}
				// if tag is <A>
				if(tmpElem.nodeType == 1 && tmpElem.tagName == "A") {
					if(tmpElem.innerHTML) {
					tmpObj.label = tmpElem.innerHTML;
					}
					if(tmpElem.getAttribute("onclick")) {
					tmpObj.onclick = tmpElem.getAttribute("onclick");
					}
					if(tmpElem.getAttribute("href")) {
					tmpObj.link = tmpElem.getAttribute("href");
					}
					if(tmpElem.getAttribute("target")) {
						tmpObj.target = tmpElem.getAttribute("target");
					}
				}
				if(tmpElem.nodeType == 1 && tmpElem.tagName == "HR") {
					tmpObj.hr = "true";
				}
				if(tmpElem.nodeType == 1 && tmpElem.tagName == "UL") {
					this.convertHtmlToJson(tmpObj, tmpElem);
				}
			}
		}
	}
};

/**
 * Creates children objects
 */
SS.MenuNode.prototype.parseSource = function() {
	if(this.config.sourceType=='html') {
		this.children = this.DOM2JSON(this.config.source);
	} else if(this.config.sourceType=='html/text') {
		this.children = this.HTML2JSON(this.config.source);
	} else if(this.config.sourceType=='html/url') {

	} else if(this.config.sourceType=='json/url') {

	} else {
		// Just use json
		if(this.config.children instanceof Array) {
			this.children = this.config.children;
		} else {
			this.children = [];
		}
	}
};

/**
 * Creates children objects
 */
SS.MenuNode.prototype.createChildren = function() {
	// Parse the source to be json
	this.parseSource();
	// Go through all children and create object for each one
	var iChild, iChildLength, oChild;
	iChildLength = this.children.length;
	for (iChild=0; iChild<iChildLength; iChild++) {
		oChild = this.children[iChild];
		// Create child
		this.addChild(oChild);
	}
	SS.Utils.addClass(this.triggerElement, 'Level'+this.level);
	if(iChildLength) {
		// Container should have expand direction classname
		// to expand styling customization
		SS.Utils.addClass(this.triggerElement, this.expandDirection);
		SS.Utils.addClass(this.triggerElement, 'HasChildren');
	} else {
		SS.Utils.addClass(this.triggerElement, 'NoChildren');
	}
	// Set expand direction class for the children container
	SS.Utils.addClass(this.container.firstChild, 'Level'+this.level);
	SS.Utils.addClass(this.container.firstChild, this.expandDirection);

}

/**
 * Creates children objects
 * @param sName {string} Menuitem label
 * @param aChildren {array} JSON array with nodes
 * @return Created node object
 */
SS.MenuNode.prototype.addChild = function(objArgs) {
	// Add node triggerElement
	if(this.tableLayout) {
		var elTable = this.childrenNodes.getElementsByTagName('table')[0];
		var elRow = elTable.insertRow(-1);
		var elTrigger = elRow.insertCell(-1);
	} else {
		var elList = this.childrenNodes.getElementsByTagName('ul')[0];
		var elTrigger = document.createElement("li");
		elList.appendChild(elTrigger);
	}
	// Add class name if it was defined
	if(objArgs.className) {
		elTrigger.className = objArgs.className + ' ';
	}
	elTrigger.className+= 'Item';


	var sUrl = '';
	if(objArgs.link) {
		sUrl = " onclick=\"window.location.href='" + objArgs.link + "'\"";
	}
	elTrigger.innerHTML = '<div ' + sUrl + '>' + objArgs.label + '</div>';

	objArgs.parent = this;
	objArgs.triggerElement = elTrigger;
	objArgs.level = this.level + 1;
	// Create node object
	var oNewNode = new SS.MenuNode(objArgs);
	// Trigger element should have expand direction classname
	// to expand styling customization
	//SS.Utils.addClass(elTrigger, oNewNode.expandDirection);
	// Create a link for the node in the children array
	this.children.push(oNewNode);
}