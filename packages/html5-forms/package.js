Package.describe({
  name: 'html5-forms',
  version: '0.0.1',
  summary: '',
  git: '',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.1');
  
  api.use('underscore');
  api.use('templating', 'client');

  api.use('aldeed:simple-schema@1.3.2');

  api.addFiles(['html5-forms.html', 'html5-forms.js'], 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('html5-forms');
  api.addFiles('html5-forms-tests.js');
});
