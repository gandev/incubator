SimpleSchema.debug = true;

Template.registerHelper('isValid', function (formId) {
  return false;
});

Template.hForm.events({
  'submit form': function(evt, tmpl) {
    evt.preventDefault();

    if(!this.id || !this.schema) {
      throw new Error('hForm needs schema and id attributes!');
    }

    var data = tmpl.$(evt.target).serializeArray();
    var doc = {};
    _.each(data, function (value) {
      doc[value.name] = value.value;
    });

    var schema = window[this.schema];

    if(!(schema instanceof SimpleSchema)) {
      throw new Error('hForm schema needs to be a valid schema in global scope!');
    }

    var schemaContext = schema.namedContext(this.id);

    console.log(schemaContext.validate(doc), new MongoObject(doc), doc);
  }
});

Template.hInput.helpers({
  isType: function(type) {
    return this.type === type;
  },
  isSelected: function (value) {
    return this === value ? 'selected': '';
  }
});
