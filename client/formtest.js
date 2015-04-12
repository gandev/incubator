Template.body.helpers({
  testOptions: function() {
    return [
      'test',
      'rest'
    ];
  }
});

MySchema = new SimpleSchema({
  test1: {
    type: Number
  },
  test2: {
    type: String
  }
});
