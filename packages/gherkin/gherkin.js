if(Meteor.isClient) {
  GeneratedCucumberTestSteps = new Meteor.Collection('GeneratedCucumberTestSteps');

  Meteor.subscribe('GeneratedCucumberTestSteps');
}

if(Meteor.isServer) {
  GeneratedCucumberTestSteps = new Meteor.Collection('GeneratedCucumberTestSteps', {connection: null});

  Meteor.publish('GeneratedCucumberTestSteps', function () {
    return GeneratedCucumberTestSteps.find();
  });

  Meteor.methods({
    replaceStepContent: function() {
      //TODO
    }
  });

  var fs = Npm.require('fs');
  var path = Npm.require('path');
  var recast = Npm.require('recast');
  var estraverse = Npm.require('estraverse');

  var readdir = Meteor.wrapAsync(fs.readdir);
  var readFile = Meteor.wrapAsync(fs.readFile);

  Meteor.startup(function() {
    var featuresFolder = path.join(process.env.PWD, 'tests', 'cucumber', 'features');
    var stepDefinitionsFolder = path.join(featuresFolder, 'step_definitions');

    var stepDefinitionFiles = readdir(stepDefinitionsFolder);

    _.each(stepDefinitionFiles, function (fileName) {
      var absoluteFilePath = path.join(stepDefinitionsFolder, fileName);
      var fileContent = readFile(absoluteFilePath);

      var fileAst = recast.parse(fileContent);

      estraverse.traverse(fileAst, {
        enter: function (node, parent) {
          if(node.type === 'CallExpression' && node.callee.type === 'MemberExpression' &&
            node.callee.object.type === 'ThisExpression') {

            var isGherkin = _.contains(['Given', 'When', 'Then', 'And', 'But'], node.callee.property.name);
            if(isGherkin && node.arguments[1].body.body[0].expression.value === 'generated') {
              GeneratedCucumberTestSteps.insert({
                file: absoluteFilePath,
                step: node.arguments[0].raw,
                ast: node.arguments[1]
              });
            }
          }
        },
        fallback: 'iteration'
      });
    });
  });
}
