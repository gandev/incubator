(function () {

  'use strict';

  module.exports = function () {
    // Use normal require here, cucumber is NOT run in a Meteor context (by design)
    var url = require('url');

    this.Given(/^I am on the home page$/, function (callback) {
      this.ddp.call('reset', [], callback);
    });

    this.When(/^I navigate to "([^"]*)"$/, function (relativePath, callback) {
      // process.env.HOST always points to the mirror
      this.browser.
        url(url.resolve(process.env.HOST, relativePath)).
        call(callback);
    });

    this.Then(/^I should see the title of "([^"]*)"$/, function (expectedTitle, callback) {
      // you can use chai-as-promised, see here: https://github.com/domenic/chai-as-promised/
      this.browser.
        getTitle().should.become(expectedTitle).and.notify(callback);
    });

    this.When(/^I submit the empty form$/, function (callback) {
      this.browser.submitForm('#myForm').call(callback);
    });

    // this.Then (/^I should get no "([^"]*)" validation errors "([^"]*)"$/, function (arg1, arg2, callback) {
    //   callback();
    // });
    this.Then(/^I should get validation errors$/, function (callback) {
      "generated";
      this.browser.isExisting('.alert').should.become(true).and.notify(callback);

      //this.browser.getText('.alert').should.become('something went terribly wrong').and.notify(callback);
    });

    this.Then (/^I "([^"]*)" get validation errors$/, function(arg1, callback) {
      //"generated";
      callback();
    });
  };

})();
