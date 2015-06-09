Template.blazeDatepicker.created = function() { 
   var self = this;
   
   var now = moment();
   self.dateSelected = new ReactiveVar({date: now.date(), month: now.month(), year: now.year()});
   
   self.monthSelected = new ReactiveVar({month: now.month(), year: now.year()});
};

Template.blazeDatepicker.helpers({
  isCurrentDate: function () {
    var dateSelected = Template.instance().dateSelected.get();
    return this.date === dateSelected.date && this.month === dateSelected.month && this.year === dateSelected.year;
  },
  currentMonth: function() {
    return moment(Template.instance().monthSelected.get()).format('MMMM');
  },
  currentYear: function () {
    return moment(Template.instance().monthSelected.get()).format('YYYY');
  },
  daysShort: function () {
    return moment.weekdaysShort();
  },
  daysInRows: function () {
    var currentMonth = moment(Template.instance().monthSelected.get());
    
    var endOfLastMonth = currentMonth.clone().subtract(1, 'months').endOf('month');
    
    var startOfMonth = currentMonth.clone().startOf('month');
    var endOfMonth = currentMonth.clone().endOf('month');
    
    var startOfNextMonth = currentMonth.clone().add(1, 'months').startOf('month');
    
    var rows = [];
    var currentRow = [];
    var currentWeek = startOfMonth.week();
    
    if(startOfMonth.day() > 0) {
      var endDate = endOfLastMonth.date();
      for(var i = endOfLastMonth.subtract(startOfMonth.day(), 'days').date(); i < endDate; i++) {
        currentRow.push({date: i, month: endOfLastMonth.month(), year: endOfLastMonth.year()});
      }
    }
    
    var startMonth = startOfMonth.month();
    while(startOfMonth.month() === startMonth) {
      currentRow.push({date: startOfMonth.date(), month: startOfMonth.month(), year: startOfMonth.year(), isCurrentMonth: true});
      
      startOfMonth.add(1, 'days');
      
      if(currentWeek !== startOfMonth.week()) {
        currentWeek = startOfMonth.week();
        rows.push(currentRow);
        currentRow = [];
      }
    }
    
    if(currentRow.length > 0) {
      while(currentRow.length < 7) {
        currentRow.push({date: startOfNextMonth.date(), month: startOfNextMonth.month(), year: startOfNextMonth.year()});
        
        startOfNextMonth.add(1, 'days');
      }
      
      rows.push(currentRow);
    }
    
    return rows;
  }
});

Template.blazeDatepicker.events({ 
  'click .picker-months .months-back': function(evt, tmpl) {
    var lastMonth = moment(tmpl.monthSelected.get()).subtract(1, 'months');
    
    tmpl.monthSelected.set({month: lastMonth.month(), year: lastMonth.year()});
  },
  'click .picker-months .months-forward': function (evt, tmpl) {
    var nextMonth = moment(tmpl.monthSelected.get()).add(1, 'months');
    
    tmpl.monthSelected.set({month: nextMonth.month(), year: nextMonth.year()});
  },
  'click .picker-days .day-select': function (evt, tmpl) {
    tmpl.dateSelected.set(this);
  },
  'click .picker-controls .select-today': function (evt, tmpl) {
    var now = moment();
    tmpl.dateSelected.set({date: now.date(), month: now.month(), year: now.year()});
  }
});
