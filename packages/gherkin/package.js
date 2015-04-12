Package.describe({
  name: 'gandev:gherkin',
  version: '0.1.0',
  summary: '',
  git: '',
  documentation: 'README.md'
});

Npm.depends({
  recast: '0.10.11',
  estraverse: '3.1.0'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use('mongo');

  api.addFiles('gherkin.js');

  api.export('GeneratedCucumberTestSteps');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('gherkin');
  api.addFiles('gherkin-tests.js');
});

Package.registerBuildPlugin({
  name: 'gherkin',
  use: ['underscore'],
  sources: ['gherkin-plugin.js'],
  npmDependencies: {
    recast: '0.10.11',
    estraverse: '3.1.0',
    gherkin: '2.12.2'
  }
});
