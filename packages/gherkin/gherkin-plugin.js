var LexerHandler = function(alreadyDefinedSteps, callback) {
  this.alreadyDefinedSteps = alreadyDefinedSteps;
  this.newStepsCallback = callback;
  this.scenarios = [];
  this.currentScenario = -1;
};

_.extend(LexerHandler.prototype, {
  getEventHandlers: function getEventHandlers() {
      return {
        background:       this.handleBackground(),
        comment:          this.handleComment(),
        doc_string:       this.handleDocString(),
        eof:              this.handleEof(),
        feature:          this.handleFeature(),
        row:              this.handleDataTableRow(),
        scenario:         this.handleScenario(),
        step:             this.handleStep(),
        tag:              this.handleTag(),
        scenario_outline: this.handleScenarioOutline(),
        examples:         this.handleExamples()
      };
    },

    handleBackground: function () {
      var self = this;

      return function handleBackground(keyword, name, description, line) {
        console.log('background', arguments);
      };
    },

    handleComment: function () {
      var self = this;

      return function handleComment() {
        console.log('comment', arguments);
      };
    },

    handleDocString: function () {
      var self = this;

      return function handleDocString(contentType, string, line) {
        console.log('docString', arguments);
      };
    },

    handleEof: function () {
      var self = this;

      return function handleEof() {
        var newSteps = [];
        _.each(self.scenarios, function (steps) {
          _.each(steps, function (step) {
            var isDefined = false;
            _.each(self.alreadyDefinedSteps, function (stepRegex) {
              if(stepRegex.test(step.name)) {
                isDefined = true;
              }
            });

            if(!isDefined) {
              newSteps.push(step);
            }
          });
        });

        self.newStepsCallback(newSteps);
      };
    },

    handleFeature: function () {
      var self = this;

      return function handleFeature(keyword, name, description, line) {
        self.feature = {
          keyword: keyword,
          name: name,
          description: description
        };
      };
    },

    handleDataTableRow: function () {
      var self = this;

      return function handleDataTableRow(cells, line) {
        console.log('dataTableRow', arguments);
      };
    },

    handleScenario: function () {
      var self = this;

      return function handleScenario(keyword, name, description, line) {
        self.currentScenario++;
      };
    },

    handleStep: function () {
      var self = this;

      return function handleStep(keyword, name, line) {
        if(!self.scenarios[self.currentScenario]) {
          self.scenarios[self.currentScenario] = [];
        }

        self.scenarios[self.currentScenario].push({
          keyword: keyword,
          name: name
        });
      };
    },

    handleTag: function () {
      var self = this;

      return function handleTag(tag, line) {
        console.log('tag', arguments);
      };
    },

    handleScenarioOutline: function () {
      var self = this;

      return function handleScenarioOutline(keyword, name, description, line) {
        console.log('scenarioOutline', arguments);
      };
    },

    handleExamples: function () {
      var self = this;

      return function handleExamples(keyword, name, description, line) {
        console.log('examples', arguments);
      };
    }
});

Plugin.registerSourceHandler('gherkin', function (compileStep) {
  var fs = Npm.require('fs');
  var path = Npm.require('path');
  var recast = Npm.require('recast');
  var estraverse = Npm.require('estraverse');
  var gherkin = Npm.require('gherkin');

  var input = compileStep.read().toString();
  var featureIdentifier = compileStep.inputPath.match(/\/(.*)\.gherkin/)[1];

  var featuresFolder = path.join(process.cwd(), 'tests', 'cucumber', 'features');
  var stepDefinitionsFolder = path.join(featuresFolder, 'step_definitions');

  // sync feature file
  fs.writeFileSync(path.join(featuresFolder, featureIdentifier + '.feature'), input);

  // check current step definitions
  var stepsDefinition = fs.readFileSync(path.join(stepDefinitionsFolder, featureIdentifier + '_steps.js'));
  var ast = recast.parse(stepsDefinition);

  var alreadyDefinedSteps = [];
  estraverse.traverse(ast, {
    enter: function (node, parent) {
      if(node.type === 'CallExpression' && node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'ThisExpression') {

        var isGherkin = _.contains(['Given', 'When', 'Then'], node.callee.property.name);
        if(isGherkin) {
          alreadyDefinedSteps.push(node.arguments[0].value);
        }
      }
    },
    fallback: 'iteration'
  });

  // process current gherkin file
  var newSteps = [];

  var astBuilder = recast.types.builders;

  var Lexer = gherkin.Lexer('en');
  var lexerHandler = new LexerHandler(alreadyDefinedSteps, function (newSteps) {
    _.each(newSteps, function (step) {
      var argsCount = step.name.match(/\"[^"]*\"/g) ? step.name.match(/\"[^"]*\"/g).length: 0;
      var stepName = step.name.replace(/\"[^"]*\"/g, '"([^"]*)"');

      var params = [];
      for(var i = 0; i < argsCount; i++) {
        params.push(astBuilder.identifier('arg' + (i + 1)));
      }
      params.push(astBuilder.identifier('callback'));

      var stepAst = astBuilder.expressionStatement(
        astBuilder.callExpression(
          astBuilder.memberExpression(astBuilder.thisExpression(), astBuilder.identifier(step.keyword)),
          [
            astBuilder.literal(new RegExp("^" + stepName + "$")),
            astBuilder.functionExpression(
              null,
              params,
              astBuilder.blockStatement(
              [
                astBuilder.expressionStatement(
                  astBuilder.literal('generated')),
                astBuilder.expressionStatement(
                  astBuilder.callExpression(
                    astBuilder.memberExpression(
                      astBuilder.identifier('callback'),
                      astBuilder.identifier('fail')), []))
              ]))
          ])
      );

      estraverse.traverse(ast, {
        enter: function (node, parent) {
          if(node.type === 'FunctionExpression' && parent.type === 'AssignmentExpression' &&
            parent.left.object.name === 'module') {

            node.body.body.push(stepAst);
          }
        },
        fallback: 'iteration'
      });

      //console.log(recast.print(stepAst));

      var newStepsDefinition = recast.print(ast).code;
      fs.writeFileSync(path.join(stepDefinitionsFolder, featureIdentifier + '_steps.js'), newStepsDefinition);
    });
  });

  var lexer = new Lexer(lexerHandler.getEventHandlers());
  lexer.scan(input);
});
