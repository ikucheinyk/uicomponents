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
SS.calendar = function(objArgs) {
	this.config = objArgs;
	// if no eventlisteners
	if(!this.config.eventListeners) {
		this.config.eventListeners = [];
	}
	if(objArgs.container) {
		this.container = objArgs.container;
	}
	// Theme
	this.theme = this.config.theme ? this.config.theme : 'default';
	// Weekday the week start with
	this.weekStart = this.config.weekStart=='mon' ? 'mon' : 'sun';
 	// Parse current date
	if(this.config.todayDate && /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.test(this.config.todayDate)) {
		var aMatches = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(this.config.todayDate);
		this.todayDate = new Date();
		this.todayDate.setFullYear(aMatches[1],aMatches[2]-1,aMatches[3]);
	} else {
		this.todayDate = new Date();
	}
	// Parse current date
	if(this.config.currentDate && /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.test(this.config.currentDate)) {
		var aMatches = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(this.config.currentDate);
		this.currentDate = new Date();
		this.currentDate.setFullYear(aMatches[1],aMatches[2]-1,aMatches[3]);
	} else {
		this.currentDate = new Date();
	}
	// The month that should be displayed
	this.displayMonth = new Date();
	this.displayMonth.setFullYear(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
	var self = this;
	// register instance in objects array
	if(!SS.objects) SS.objects = [];
	this.objectId = SS.objects.length;
	SS.objects.push(this);

	this.init();
}

/**
 * Short weekdays
 */
SS.calendar.prototype.weekDaysShort = [
	'Su','Mo','Tu','We','Th','Fr','Sa'
];

/**
 * Short weekdays
 */
SS.calendar.prototype.months = [
	'January','February','March','April','May','June','July','August','September','October','November','December'
];


/**
 * Initialize
 */
SS.calendar.prototype.init = function() {
	var oViewDates = this.getViewDates(this.displayMonth);
	this.render(oViewDates, this.todayDate, this.currentDate);
}

/**
 * Calculates range of dates for the month view
 *
 * @private
 * @param sDate {string} Date sting in format YYYY-MM-DD
 * @return oViewDates {object} 4 date objexts (monthStart, monthEnd, viewStart, viewEnd)
 */
SS.calendar.prototype.getViewDates = function(dDisplayMonth) {
	if(!(dDisplayMonth instanceof Date)) {
		return;
	}
	// Current date
	var oCurDate = new Date();
	oCurDate.setFullYear(dDisplayMonth.getFullYear(),dDisplayMonth.getMonth(),dDisplayMonth.getDate());
	// Month start
	var dMonthStart = new Date();
	dMonthStart.setFullYear(dDisplayMonth.getFullYear(),dDisplayMonth.getMonth(),1);
	dMonthStart.setHours(0,0,0);
	// Month end
	var dMonthEnd = new Date();
	dMonthEnd.setFullYear(dDisplayMonth.getFullYear(),dDisplayMonth.getMonth(),1);
	dMonthEnd.setHours(23,59,59);
	dMonthEnd.setMonth(dMonthEnd.getMonth() + 1); // 1 month forward
	dMonthEnd.setDate(dMonthEnd.getDate() - 1); // 1 day back
	// View start
	var dViewStart = new Date();
	dViewStart.setFullYear(dDisplayMonth.getFullYear(),dDisplayMonth.getMonth(),1);
	dViewStart.setHours(0,0,0);
	var iWeekDay = dViewStart.getDay(); // Get current weekday number
	dViewStart.setDate(dViewStart.getDate() - (this.weekStart=='mon' ? iWeekDay-1 : iWeekDay)); // Get the first day of the first week in the view (can be previous month day)
	// View end
	var dViewEnd = new Date();
	dViewEnd.setFullYear(dMonthEnd.getFullYear(), dMonthEnd.getMonth(), dMonthEnd.getDate());
	dViewEnd.setHours(23,59,59);
	var iWeekDay = dViewEnd.getDay(); // Get current weekday number
	dViewEnd.setDate(dViewEnd.getDate() + (this.weekStart=='mon' ? 6-iWeekDay+1 : 6-iWeekDay)); // Get the first day of the first week in the view (can be previous month day)
	return {
		curDate: oCurDate,
		monthStart: dMonthStart,
		monthEnd: dMonthEnd,
		viewStart: dViewStart,
		viewEnd: dViewEnd
	}
}

/**
 * Render calendar
 *
 * <pre>
 * Arguments format:
 * {
 *   monthStart: [date] First day of the month
 *   monthEnd: [date] Last day of the month
 *   viewStart: [date] The first day of the week that contains first day of the month
 *   viewEnd: [date] The last day of the week that contains last day of the month
 * }
 * </pre>
 *
 * @private
 * @param {object} oArg Arguments
 */
SS.calendar.prototype.render = function(oViewDates) {
	var self = this;
	var elTable, elHead, elRow, elCell, iWeekDay;

	var dWeek = new Date();
	var dWeekEnd = new Date();
	var dDay = new Date();

	// Create calendar table
	elTable = document.createElement('table')
	elTable.className = 'SSCalendar_' + this.theme;
	
	// Buttons head section
	elHead = document.createElement('thead');
	elRow = document.createElement('tr');
	
	// Previous button
	elCell = document.createElement('td');
	elCell.className = 'previous';
	elCell.innerHTML = '<div></div>';
	SS.Utils.addEvent(elCell, 'mouseover', function(oEvent) {
		SS.Utils.addClass(this, 'hover');
	}, false);
	SS.Utils.addEvent(elCell, 'mouseout', function(oEvent) {
		SS.Utils.removeClass(this, 'hover')
	}, false);
	SS.Utils.addEvent(elCell, 'mousedown', function(oEvent) {
		SS.Utils.addClass(this, 'down');
	}, false);
	SS.Utils.addEvent(elCell, 'mouseup', function(oEvent) {
		SS.Utils.removeClass(this, 'down');
	}, false);
	SS.Utils.addEvent(elCell, 'click', function(oEvent) {
		self.prevMonth();
	}, false);
	elRow.appendChild(elCell);

	// Title
	elCell = document.createElement('td');
	elCell.className = 'title';
	elCell.setAttribute('colspan', 5);
	elCell.innerHTML = '<div>' + this.months[oViewDates.curDate.getMonth()] + ' ' + oViewDates.curDate.getFullYear() + '</div>';
	elRow.appendChild(elCell);
	
	// Next button
	elCell = document.createElement('td');
	elCell.className = 'next';
	elCell.innerHTML = '<div></div>';
	SS.Utils.addEvent(elCell, 'mouseover', function(oEvent) {
		SS.Utils.addClass(this, 'hover');
	}, false);
	SS.Utils.addEvent(elCell, 'mouseout', function(oEvent) {
		SS.Utils.removeClass(this, 'hover')
	}, false);
	SS.Utils.addEvent(elCell, 'mousedown', function(oEvent) {
		SS.Utils.addClass(this, 'down');
	}, false);
	SS.Utils.addEvent(elCell, 'mouseup', function(oEvent) {
		SS.Utils.removeClass(this, 'down');
	}, false);
	SS.Utils.addEvent(elCell, 'click', function(oEvent) {
		self.nextMonth();
	}, false);
	elRow.appendChild(elCell);
	elHead.appendChild(elRow);
	elTable.appendChild(elHead);

	// Weekdays head section
	elHead = document.createElement('thead');
	elHead.className = 'weekdays';
	elRow = document.createElement('tr');
	elCell = document.createElement('td');
	if(this.weekStart=='mon') {
		for(iWeekDay=1; iWeekDay<7; iWeekDay++) {
			elCell = document.createElement('td');
			elCell.className = 'weekday';
			elCell.innerHTML = this.weekDaysShort[iWeekDay];
			elRow.appendChild(elCell);
		}
		elCell = document.createElement('td');
		elCell.className = 'weekday';
		elCell.innerHTML = this.weekDaysShort[0];
		elRow.appendChild(elCell);
	} else {
		for(iWeekDay=0; iWeekDay<7; iWeekDay++) {
			elCell = document.createElement('td');
			elCell.className = 'weekday';
			elCell.innerHTML = this.weekDaysShort[iWeekDay];
			elRow.appendChild(elCell);
		}
	}
	elHead.appendChild(elRow);
	elTable.appendChild(elHead);

	// Table body section
	var elBody = document.createElement('tbody');


	for(dWeek.setFullYear(oViewDates.viewStart.getFullYear(),oViewDates.viewStart.getMonth(),oViewDates.viewStart.getDate()); dWeek<=oViewDates.viewEnd; dWeek.setDate(dWeek.getDate() + 7)) {
		dWeekEnd.setFullYear(dWeek.getFullYear(), dWeek.getMonth(), dWeek.getDate());
		dWeekEnd.setDate(dWeekEnd.getDate() + 7)
		dWeekEnd.setHours(0,0,0);
		dDay.setHours(0,0,0);
		elRow = document.createElement('tr');

		for(dDay.setFullYear(dWeek.getFullYear(),dWeek.getMonth(),dWeek.getDate()); dDay<dWeekEnd; dDay.setDate(dDay.getDate() + 1)) {
			elCell = document.createElement('td');
			SS.Utils.addClass(elCell, 'day');
			if(this.displayMonth.getMonth()==dDay.getMonth()) {
				SS.Utils.addClass(elCell, 'inside');
			} else {
				SS.Utils.addClass(elCell, 'outside');
			}
			if(this.currentDate.getDate()==dDay.getDate() && this.currentDate.getMonth()==dDay.getMonth() && this.currentDate.getYear()==dDay.getYear()) {
				SS.Utils.addClass(elCell, 'current');
			}
			if(this.todayDate.getDate()==dDay.getDate() && this.todayDate.getMonth()==dDay.getMonth() && this.todayDate.getYear()==dDay.getYear()) {
				SS.Utils.addClass(elCell, 'today');
			}
			SS.Utils.addEvent(elCell, 'mouseover', function(oEvent) {
				SS.Utils.addClass(this, 'hover');
			}, false);
			SS.Utils.addEvent(elCell, 'mouseout', function(oEvent) {
				SS.Utils.removeClass(this, 'hover')
			}, false);
			SS.Utils.addEvent(elCell, 'mousedown', function(oEvent) {
				SS.Utils.addClass(this, 'down');
			}, false);
			SS.Utils.addEvent(elCell, 'mouseup', function(oEvent) {
				SS.Utils.removeClass(this, 'down');
			}, false);
			SS.Utils.addEvent(elCell, 'click', function(oEvent) {
				self.dayClick(oEvent, dDay.getFullYear(), dDay.getMonth(), dDay.getDate());
			}, false);
			elCell.innerHTML = '<div>' + dDay.getDate() + '</div>';
			elRow.appendChild(elCell);
		}
		elBody.appendChild(elRow);
	}
	elTable.appendChild(elBody);
	this.container.innerHTML = '';
	this.container.appendChild(elTable);
	return;

	var sHtml = '';
	sHtml+= '<table cellpadding="0" cellspacing="0" class="SSCalendar_' + this.theme + '">';
	// Display calendar title (month and year)
	sHtml+= '<thead>';
	sHtml+= '<tr>';
	sHtml+= '<td class="previous" onmouseover="SS.Utils.addClass(this, \'hover\')" onmouseout="SS.Utils.removeClass(this, \'hover\')" onmousedown="SS.Utils.addClass(this, \'down\')" onmouseup="SS.Utils.removeClass(this, \'down\')" onclick="SS.objects[' + this.objectId + '].prevMonth()"><div></div></td>';
	sHtml+= '<td colspan="5" class="title"><div>' + this.months[oViewDates.curDate.getMonth()] + ' ' + oViewDates.curDate.getFullYear() + '</div></td>';
	sHtml+= '<td class="next" onmouseover="SS.Utils.addClass(this, \'hover\')" onmouseout="SS.Utils.removeClass(this, \'hover\')" onmousedown="SS.Utils.addClass(this, \'down\')" onmouseup="SS.Utils.removeClass(this, \'down\')" onclick="SS.objects[' + this.objectId + '].nextMonth()"><div></div></td>';
	sHtml+= '</tr>';
	sHtml+= '</thead>';
	// Display weekdays
	sHtml+= '<thead class="weekdays">';
	sHtml+= '<tr>';
	if(this.weekStart=='mon') {
		for(var iWeekDay=1; iWeekDay<7; iWeekDay++) {
			sHtml+= '<td class="weekday">';
			sHtml+= this.weekDaysShort[iWeekDay];
			sHtml+= '</td>';
		}
		sHtml+= '<td class="weekday">';
		sHtml+= this.weekDaysShort[0];
		sHtml+= '</td>';
	} else {
		for(var iWeekDay=0; iWeekDay<7; iWeekDay++) {
			sHtml+= '<td class="weekday">';
			sHtml+= this.weekDaysShort[iWeekDay];
			sHtml+= '</td>';
		}
	}
	sHtml+= '</tr>';
	sHtml+= '</thead>';
	sHtml+= '<tbody>';
	var className = '';
	for(dWeek.setFullYear(oViewDates.viewStart.getFullYear(),oViewDates.viewStart.getMonth(),oViewDates.viewStart.getDate()); dWeek<=oViewDates.viewEnd; dWeek.setDate(dWeek.getDate() + 7)) {
		sHtml+= '<tr>';
		dWeekEnd.setFullYear(dWeek.getFullYear(), dWeek.getMonth(), dWeek.getDate());
		dWeekEnd.setDate(dWeekEnd.getDate() + 7)
		dWeekEnd.setHours(0,0,0);
		dDay.setHours(0,0,0);
		for(dDay.setFullYear(dWeek.getFullYear(),dWeek.getMonth(),dWeek.getDate()); dDay<dWeekEnd; dDay.setDate(dDay.getDate() + 1)) {
			sHtml+= '<td ';
			if(this.displayMonth.getMonth()==dDay.getMonth()) {
				className = 'day inside';
			} else {
				className = 'day outside';
			}
			if(this.currentDate.getDate()==dDay.getDate() && this.currentDate.getMonth()==dDay.getMonth() && this.currentDate.getYear()==dDay.getYear()) {
				className+= ' current';
			}
			if(this.todayDate.getDate()==dDay.getDate() && this.todayDate.getMonth()==dDay.getMonth() && this.todayDate.getYear()==dDay.getYear()) {
				className+= ' today';
			}
			sHtml+= 'class="' + className + '"';
			sHtml+= 'onmousedown="SS.Utils.addClass(this, \'down\')" '
			sHtml+= 'onmouseup="SS.Utils.removeClass(this, \'down\')" '
			sHtml+= 'onmouseover="SS.Utils.addClass(this, \'hover\')" '
			sHtml+= 'onmouseout="SS.Utils.removeClass(this, \'hover\')" '
			sHtml+= 'onclick="SS.objects[' + this.objectId + '].dayClick(' + dDay.getFullYear() + ',' + dDay.getMonth() + ',' + dDay.getDate() + ', this)"><div>';
			sHtml+= dDay.getDate();
			sHtml+= '</div></td>';
		}
		sHtml+= '</tr>';
	}
	sHtml+= '</tbody>';
	sHtml+= '</table>';
	this.container.innerHTML = sHtml;
}

/**
 * Shifr 1 month back
 *
 * @public
 */
SS.calendar.prototype.prevMonth = function() {
	// Encrease month
	this.displayMonth.setMonth(this.displayMonth.getMonth()-1);
	var oViewDates = this.getViewDates(this.displayMonth);
	this.render(oViewDates, this.todayDate, this.currentDate);
}

/**
 * Shifr 1 month front
 *
 * @public
 */
SS.calendar.prototype.nextMonth = function() {
	// Encrease month
	this.displayMonth.setMonth(this.displayMonth.getMonth()+1);
	var oViewDates = this.getViewDates(this.displayMonth);
	this.render(oViewDates, this.todayDate, this.currentDate);
}

/**
 * Day click
 *
 * @private
 * @param iYear {integer} Year
 * @param iMonth {integer} Month
 * @param iDay {integer} Day
 */
SS.calendar.prototype.dayClick = function(oEvent, iYear, iMonth, iDay) {
	// Set current date
	this.currentDate.setFullYear(iYear, iMonth, iDay);
	console.log(iYear, iMonth, iDay);
	// redraw calendar
	var oViewDates = this.getViewDates(this.displayMonth);
	this.render(oViewDates, this.todayDate, this.currentDate);
	if(this.config.eventListeners.dayClick) {
		this.config.eventListeners.dayClick(oEvent, this.currentDate);
	}
}