// if (Meteor.isClient) {
//   LLL = new Mongo.Collection(null);
//
//   Template.ttt.helpers({
//     lll: function() {
//       return LLL.find();
//     }
//   });
//
//   Template.ttt.rendered = function() {
//     this.find('div')._uihooks = {
//       removeElement: function() {
//         console.log("remove");
//       }
//     };
//   };
// }
//
// if (Meteor.isServer) {
//   Meteor.startup(function() {
//     // code to run on server at startup
//   });
// }
//
// Meteor.methods({
//   'doit': function() {
//     console.log('doit');
//   }
// });

Router.route('/', function () {
  this.render('h5form');
});
