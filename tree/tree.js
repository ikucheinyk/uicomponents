/**
 * @author Igor Kucheinyk (igorok@igorok.com)
 * 
 * @fileoverview Javascript tree module
 * 
 * Example of usage
 * 
 * <pre>
 * 		tr1 = new SS.tree({
 * 			container: document.getElementById('tree1'),
 * 			//sourceType: 'json',
 * 			source: [{
 * 				label: 'Node Title 1',
 * 				expanded: true,
 * 				children: [{
 * 					label: 'Subnode 1'
 * 				},{
 * 					label: 'Subnode 2',
 * 					expanded: true,
 * 					children: [{
 * 						label: 'Subnode'
 * 					}]
 * 				},{
 * 					label: 'Subnode 3',
 * 					expanded: true,
 * 					sourceType: 'json/url',
 * 					source: 'recursive_branch.php'
 * 				},{
 * 					label: 'Subnode 4',
 * 					children: [{
 * 						label: 'asd',
 * 						children: [{
 * 							label: '123'
 * 						}]
 * 					}]
 * 				}]					
 * 			},{
 * 				label: '123'
 * 			}]
 * 		});		
 * </pre> 
 * 
 * Config Options:
 * <b>container</b>
 * <b>sourceType</b>
 * <b>source</b>
 * <b>selectOnLabelClick</b>
 * <b>expandOnLabelClick</b>
 * <b>expandCollapseOnLabelClick</b>
 * <b>expandAll</b>
 * 
 * Eventlisteners:
 * <b>iconClick</b>
 * <b>signClick</b>
 * <b>labelClick</b>
 * <b>select</b>
 * <b>expand</b>
 * <b>collapse</b>
 * 
 */

// initialize namespace
if (typeof SS == 'undefined') {
	SS = function() {};
}

/**
 * Constructor of the tree object
 * @constructor
 * @private
 * @param objArgs {object} Object configuration
 */
SS.tree = function(objArgs) {
	this.config = objArgs;
	// if no eventlisteners
	if(!this.config.eventListeners) {
		this.config.eventListeners = [];
	}
	this.nodeType = 'root';
	this.container = objArgs.container
	this.sourceType = this.config.sourceType;
	this.source = this.config.source;
	this.theme = this.config.theme ? this.config.theme : 'default';
	var self = this;

	// create eventlisteners
	//this.SUPERconstructor.call(objArgs);
	//this.addEventListener('iconClick', objArgs.eventListeners.iconClick);


	this.children = [];
	this.allNodes = [];

	// register instance in objects array
	if(!SS.objects) SS.objects = [];
	this.objectId = SS.objects.length;
	SS.objects.push(this);

	// Create tree table
	// generate html
	this.container.innerHTML = '<TABLE class="rootNode_' + this.theme + '" cellpadding="0" cellspacing="0"><TBODY></TBODY></TABLE>';
	this.tableChildren = this.container.firstChild;
		
	this.childrenInitialized = false;

	// Init
	if(this.sourceType=='json/url' && this.source) {
		this.preload();
	} else {
		// init children
		for(var ii=0; ii<this.config.source.length; ii++) {
			this.addChild(this.config.source[ii]);
		}
		this.childrenInitialized = true;
		// fire event `init`
		if(this.config.eventListeners.init) {
			this.config.eventListeners.init(this);
		}
	}	
}

// inherit basic functionality
SS.inherit(SS.tree, SS.ingot);

/**
 * Creates new child node
 * @param objArgs {object} New child json object
 * @return Created node object
 */
SS.tree.prototype.addChild = function(objArgs) {
	// create node
	var newNode = new SS.treeNode(objArgs);
	// create links
	newNode.parent = this;
	newNode.rootNode = this;
	// generate row elements
	newNode.render(this.tableChildren);
	// add node to children
	this.children.push(newNode);
	// add node to all nodes array
	this.allNodes.push(newNode);
	// init children
	if(objArgs.children) {
		for(var ii=0; ii<objArgs.children.length; ii++) {
			newNode.addChild(objArgs.children[ii]);
		}
	}
	// expand if needed
	if(newNode.expanded || this.config.expandAll) {
		newNode.expand();
	}
	// update first & last child and update style classes
	this.resetFirstLastChild();	
}

/**
 * Set theme classes for node elements
 * @private
 */
SS.tree.prototype.resetFirstLastChild = function() {
	// reset first and last child classes
	if(this.lastChild) {
		if(this.lastChild.childrenInitialized && this.lastChild.children.length==0) {
			this.lastChild.rowLabel.className = 'middleChild Empty';
		} else {
			this.lastChild.rowLabel.className = 'middleChild ' + (this.lastChild.expanded ? 'Expanded' : 'Collapsed');
		}
		this.lastChild.rowChildren.className = 'middleChildChildren';
		this.lastChild.cellLine.className = 'middleChildChildrenCellLine';
	}	
	if(this.firstChild) {
		if(this.firstChild.childrenInitialized && this.firstChild.children.length==0) {
			this.firstChild.rowLabel.className = 'middleChild Empty';
		} else {
			this.firstChild.rowLabel.className = 'middleChild ' + (this.firstChild.expanded ? 'Expanded' : 'Collapsed');
		}
		this.firstChild.rowChildren.className = 'middleChildChildren';
		this.firstChild.cellLine.className = 'middleChildChildrenCellLine';
	}	
	// update links to first and last child node objects
	if(this.children.length) {
		this.firstChild = this.children[0];
		this.lastChild = this.children[this.children.length-1];
		// if there is only 1 child
		if(this.children.length==1) {
			// set only
			if(this.firstChild.childrenInitialized && this.firstChild.children.length==0) {
				this.firstChild.rowLabel.className = 'onlyChild Empty';
			} else {
				this.firstChild.rowLabel.className = 'onlyChild ' + (this.firstChild.expanded ? 'Expanded' : 'Collapsed');
			}
			this.firstChild.rowChildren.className = 'onlyChildChildren';
			this.firstChild.cellLine.className = 'onlyChildChildrenCellLine';
		} else {
			// set first
			if(this.firstChild.childrenInitialized && this.firstChild.children.length==0) {
				this.firstChild.rowLabel.className = 'firstChild Empty';
			} else {
				this.firstChild.rowLabel.className = 'firstChild ' + (this.firstChild.expanded ? 'Expanded' : 'Collapsed');
			}
			this.firstChild.rowChildren.className = 'firstChildChildren';
			this.firstChild.cellLine.className = 'firstChildChildrenCellLine';
			// set last
			if(this.lastChild.childrenInitialized && this.lastChild.children.length==0) {
				this.lastChild.rowLabel.className = 'lastChild Empty';
			} else {
				this.lastChild.rowLabel.className = 'lastChild ' + (this.firstChild.expanded ? 'Expanded' : 'Collapsed');
			}
			this.lastChild.rowChildren.className = 'lastChildChildren';
			this.lastChild.cellLine.className = 'lastChildChildrenCellLine';
		}
	} else {
		this.firstChild = null;
		this.lastChild = null;
	}
}

/**
 * Preload node children 
 * @return Returns false if node doesn't have source to preload or sourceType is not url type
 */
SS.tree.prototype.preload = function(onPreload) {
	var self = this;
	
	if(this.sourceType!='json/url' || !this.source) {
		return false;
	}
	
	if(!SS.Transport) {
		alert('Preloading requires transport module to be loaded');
		return false;
	}
		
	// preload children
	new SS.Transport({
	   	url: self.source,
   		method: 'GET',
   		onLoad: function(oResponse) {
			oResponse = oResponse.parseJSON();
			if(oResponse) {
				for(var ii=0; ii<oResponse.length; ii++) {
					self.addChild(oResponse[ii]);
				}
				self.childrenInitialized = true;
				// Run callback
				if(onPreload) {
					onPreload(self);
				}
				// fire event `init`
				if(self.config.eventListeners.init) {
					self.config.eventListeners.init(self);
				}
			} else {
				alert('Incorrect JSON');
			}
   		},
		onError: function() {
			alert('Error');				
		}
	});
	
	return true;	
}

/**
 * Expand all nodes in the tree
 */
SS.tree.prototype.expandAll = function() {
	for(var ii=0; ii<this.allNodes.length; ii++) {
		this.allNodes[ii].expand();
	}
	this.testFunction();
}

/**
 * Collapse all nodes in the tree
 */
SS.tree.prototype.collapseAll = function() {
	for(var ii=0; ii<this.allNodes.length; ii++) {
		this.allNodes[ii].collapse();
	}
}

/**
 * Constructor of the tree node object
 * @constructor
 * @private
 * @param objArgs {object} Object configuration
 */
SS.treeNode = function(objArgs) {
	this.config = objArgs;
	this.nodeType = 'child';
	this.sourceType = this.config.sourceType;
	this.source = this.config.source;
	var self = this;

	// register instance in objects array
	if(!SS.objects) SS.objects = [];
	this.objectId = SS.objects.length;
	SS.objects.push(this);

	// Init
	this.label = objArgs.label;
	this.expanded = objArgs.expanded ? objArgs.expanded : false;
	this.children = [];
	
	if(this.sourceType=='json/url' && this.source) {
		this.childrenInitialized = false;
	} else {
		this.childrenInitialized = true;
	}

}

/**
 * Creates new child node
 * @param objArgs {object} New child json object
 * @return Created node object
 */
SS.treeNode.prototype.addChild = function(objArgs) {
	
	// create new node
	var newNode = new SS.treeNode(objArgs);
	// create links
	newNode.parent = this;
	newNode.rootNode = this.rootNode;
	// generate row elements
	newNode.render(this.tableChildren);
	// add to children
	this.children.push(newNode);	
	// add node to all nodes array
	this.rootNode.allNodes.push(newNode);	
	// init children
	if(objArgs.children) {
		for(var ii=0; ii<objArgs.children.length; ii++) {
			newNode.addChild(objArgs.children[ii]);
		}
	}
	// expand if needed
	if(newNode.expanded) {
		newNode.expand();
	}		
	// update first & last child and update style classes
	this.resetFirstLastChild();
	// return created node
	return newNode;
}

/**
 * Generate node html elements, set default theme classes
 * create links to elements inside node object
 * @private
 */
SS.treeNode.prototype.render = function(tableCurrent) {
	var self = this;
	if(!tableCurrent) {
		alert('Current table invalid');
		return false;
	}
	
	this.tableCurrent = tableCurrent;
	
	// row with label and sign
	var cellSign = document.createElement('TD');
	var nodeSign = document.createElement('DIV');
	cellSign.appendChild(nodeSign);
	var cellLabel = document.createElement('TD');
	var nodeLabel = document.createElement('DIV');
	var nodeIcon = document.createElement('DIV');
	nodeLabel.className = 'nodeLabel';
	nodeIcon.className = 'nodeIcon';
	
	//for FF
	nodeIcon.setAttribute("style","float:left");
	nodeLabel.setAttribute("style","float:left");
	cellLabel.setAttribute("style","float:left");
	// for IE
	nodeIcon.style.styleFloat = "left";
	nodeLabel.style.styleFloat = "left";
	cellLabel.style.styleFloat = "left";
		
	cellLabel.appendChild(nodeIcon);
	cellLabel.appendChild(nodeLabel);
	var rowLabel = document.createElement('TR');
	rowLabel.appendChild(cellSign);
	rowLabel.appendChild(cellLabel);
	
	// row with children
	var cellLine = document.createElement('TD');
	var cellChildren = document.createElement('TD');
	var rowChildren = document.createElement('TR');
	rowChildren.appendChild(cellLine);
	rowChildren.appendChild(cellChildren);
		
	// create children table
	cellChildren.innerHTML = '<TABLE class="childNode_' + this.rootNode.theme + '" cellpadding="0" cellspacing="0"><TBODY></TBODY></TABLE>';
	var tableChildren = cellChildren.firstChild;
	
	// set label
	nodeLabel.innerHTML = this.label;
	// set icon if needed
	if(this.config.iconCollapsed) {
		nodeIcon.innerHTML = '<IMG src="' + this.config.iconCollapsed + '">';
	}

	// keep links in the node
	this.tableChildren = tableChildren;
	this.rowChildren = rowChildren;
	this.rowLabel = rowLabel;
	this.cellChildren = cellChildren;
	this.cellLine = cellLine;
	this.cellSign = cellSign;
	this.cellLabel = cellLabel;
	this.nodeLabel = nodeLabel;
	this.nodeIcon = nodeIcon;
	this.nodeSign = nodeSign;
	
	tableCurrent.lastChild.appendChild(rowLabel);
	tableCurrent.lastChild.appendChild(rowChildren);
	
	// set events
	// set +- click evenet
	cellSign.onclick = function() {
		SS.objects[self.objectId].onSignClick();
	}
	// set label click event
	nodeLabel.onclick = function() {
		SS.objects[self.objectId].onLabelClick();
	}	
	// set icon click event
	nodeIcon.onclick = function() {
		SS.objects[self.objectId].onIconClick();
	}
	
	this.tableChildren.setAttribute('cellpadding', 0);
	this.tableChildren.setAttribute('cellspacing', 0);
	this.tableChildren.setAttribute('border', 0);
	this.tableChildren.style.margin = '0px';
	
	// set class names
	this.cellSign.className = 'nodeSignCell';
	this.nodeSign.className = 'nodeSign';
	this.cellChildren.className = 'cellChildren';
	this.cellLine.className = 'middleChildChildrenCellLine';
	this.rowLabel.className = 'middleChild' + (this.expanded ? 'Expanded' : 'Collapsed');
	this.rowChildren.className = 'middleChildChildren';
	
	// set child visibility
	if(this.expanded) {
		rowChildren.style.display = "";				
	} else {
		rowChildren.style.display = "none";
	}
	
	this.rendered = true;
	
	return true;		
}

/**
 * Set theme classes for node elements
 * @private
 */
SS.treeNode.prototype.resetFirstLastChild = function() {
	// reset first and last child classes
	if(this.lastChild) {
		if(this.lastChild.childrenInitialized && this.lastChild.children.length==0) {
			this.lastChild.rowLabel.className = 'middleChild Empty';
		} else {
			this.lastChild.rowLabel.className = 'middleChild ' + (this.lastChild.expanded ? 'Expanded' : 'Collapsed');
		}
		this.lastChild.rowChildren.className = 'middleChildChildren';
		this.lastChild.cellLine.className = 'middleChildChildrenCellLine';
	}	
	if(this.firstChild) {
		if(this.firstChild.childrenInitialized && this.firstChild.children.length==0) {
			this.firstChild.rowLabel.className = 'middleChild Empty';
		} else {
			this.firstChild.rowLabel.className = 'middleChild ' + (this.firstChild.expanded ? 'Expanded' : 'Collapsed');
		}
		this.firstChild.rowChildren.className = 'middleChildChildren';
		this.firstChild.cellLine.className = 'middleChildChildrenCellLine';
	}	
	// update links to first and last child node objects
	if(this.children.length) {
		this.firstChild = this.children[0];
		this.lastChild = this.children[this.children.length-1];
		// if there is only 1 child
		if(this.children.length==1) {
			// set only
			if(this.firstChild.childrenInitialized && this.firstChild.children.length==0) {
				this.firstChild.rowLabel.className = 'onlyChild Empty';
			} else {
				this.firstChild.rowLabel.className = 'onlyChild ' + (this.firstChild.expanded ? 'Expanded' : 'Collapsed');
			}
			this.firstChild.rowChildren.className = 'onlyChildChildren';
			this.firstChild.cellLine.className = 'onlyChildChildrenCellLine';
		} else {
			// set first
			if(this.firstChild.childrenInitialized && this.firstChild.children.length==0) {
				this.firstChild.rowLabel.className = 'firstChild Empty';
			} else {
				this.firstChild.rowLabel.className = 'firstChild ' + (this.firstChild.expanded ? 'Expanded' : 'Collapsed');
			}
			this.firstChild.rowChildren.className = 'firstChildChildren';
			this.firstChild.cellLine.className = 'firstChildChildrenCellLine';
			// set last
			if(this.lastChild.childrenInitialized && this.lastChild.children.length==0) {
				this.lastChild.rowLabel.className = 'lastChild Empty';
			} else {
				this.lastChild.rowLabel.className = 'lastChild ' + (this.firstChild.expanded ? 'Expanded' : 'Collapsed');
			}
			this.lastChild.rowChildren.className = 'lastChildChildren';
			this.lastChild.cellLine.className = 'lastChildChildrenCellLine';
		}
	} else {
		this.firstChild = null;
		this.lastChild = null;
	}
}

/**
 * Function called when nodeSign (+ or -) has been clicked
 * @private
 */
SS.treeNode.prototype.onSignClick = function() {
	if(this.expanded) {
		this.collapse();
	} else {
		this.expand();
	}
	// execute event
	if(this.rootNode.config.eventListeners.signClick) {
		this.rootNode.config.eventListeners.signClick(this);
	}
}

/**
 * Function called when label has been clicked
 * @private
 */
SS.treeNode.prototype.onLabelClick = function() {
	// if expand allowed
	if(this.rootNode.config.expandOnLabelClick) {
		// do expand
		this.expand();
	} else if(this.rootNode.config.expandCollapseOnLabelClick) {
		// expand if node collapsed, otherwise collapse
		if(this.expanded) {
			this.collapse();
		} else {
			this.expand();
		}
	}	
	// if selecting allowed
	if(this.rootNode.config.selectOnLabelClick) {
		// do select
		this.markSelected();
	}
	// execute event
	if(this.rootNode.config.eventListeners.labelClick) {
		this.rootNode.config.eventListeners.labelClick(this);
	}
}

/**
 * Function called when icon has been clicked
 * @private
 */
SS.treeNode.prototype.onIconClick = function() {
	// execute event
	if(this.rootNode.config.eventListeners.iconClick) {
		this.rootNode.config.eventListeners.iconClick(this);
	}
}

/**
 * Marks node as selected
 */
SS.treeNode.prototype.markSelected = function() {
	// if one of nodes is selected
	if(this.rootNode.selectedNode) {
		// check if clicked node was not selected before
		if(this.rootNode.selectedNode==this) {
			return;
		}
		// unhighlight it
		this.rootNode.selectedNode.nodeLabel.className = 'nodeLabel';
	}
	// set selected classname
	this.nodeLabel.className = 'nodeLabelSelected';
	// create link to selected node
	this.rootNode.selectedNode = this;
	// execute event
	if(this.rootNode.config.eventListeners.select) {
		this.rootNode.config.eventListeners.select(this);
	}
}



/**
 * Changes icon
 * @param sUrl {string} String with image url
 */
SS.treeNode.prototype.changeIcon = function(sUrl) {
	if(sUrl && sUrl!='') {
		if(this.nodeIcon.firstChild) {
			this.nodeIcon.firstChild.src = sUrl;
		} else {
			this.nodeIcon.innerHTML = '<IMG src="' + sUrl + '">';
		}
	}
}

/**
 * Expands node
 */
SS.treeNode.prototype.expand = function(onExpand) {
	var self = this;
	if(this.childrenInitialized) {
		if(this.children.length) {
			// set class name to expanded
			var regs = this.rowLabel.className.match(/(.+)(Expanded|Collapsed|Loading)$/);
			this.rowLabel.className = regs[1] + 'Expanded';
			// chage icon to expanded
			this.changeIcon(this.config.iconExpanded);
			// show rendered elements
			this.rowChildren.style.display = '';
			// mark node as expanded
			this.expanded = true;
			// execute event
			if(this.rootNode.config.eventListeners.expand) {
				this.rootNode.config.eventListeners.expand(this);
			}
			// Run callback
			if(onExpand) {
				onExpand(this);
			}
		}
	} else {
		// set class name to loading
		var regs = this.rowLabel.className.match(/(.+)(Expanded|Collapsed|Loading)$/);
		this.rowLabel.className = regs[1] + 'Loading';
		this.preload(function() {
			self.expand(onExpand);
		});
	}
}

/**
 * Collapse node
 */
SS.treeNode.prototype.collapse = function() {
	if(this.childrenInitialized) {
		if(this.children.length) {
			this.rowChildren.style.display = 'none';
			this.expanded = false;
			// set class name to collapsed
			var regs = this.rowLabel.className.match(/^(.+)(Expanded|Collapsed|Loading)$/);
			this.rowLabel.className = regs[1] + 'Collapsed';
			// chage icon to collapsed
			this.changeIcon(this.config.iconCollapsed);
			// execute event
			if(this.rootNode.config.eventListeners.collapse) {
				this.rootNode.config.eventListeners.collapse(this);
			}		
		}
	}
}

/**
 * Preload node children 
 * @return Returns false if node doesn't have source to preload or sourceType is not url type
 */
SS.treeNode.prototype.preload = function(onPreload) {
	var self = this;
	
	if(!SS.Transport) {
		alert('Preloading requires transport module to be loaded');
		return false;
	}
	
	// preload children
	new SS.Transport({
	   	url: this.source,
   		method: 'GET',
   		onLoad: function(oResponse) {
  	   		oResponse = oResponse.parseJSON();
			if(oResponse && oResponse.length) {
				for(var ii=0; ii<oResponse.length; ii++) {
					self.addChild(oResponse[ii]);
				}
				self.childrenInitialized = true;
				if(onPreload) {
					onPreload(self);
				}
			} else {
				alert('Incorrect JSON');
			}
   		},
		onError: function() {
			alert('Error');				
		}
	});	
}