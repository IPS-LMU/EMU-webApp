// An example configuration file.
exports.config = {
  // Do not start a Selenium Standalone sever - only run this using chrome.
  directConnect: true,
  // chromeDriver: './node_modules/webdriver-manager/selenium/chromedriver_2.46',

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
      //'args': ['--test-type', 'show-fps-counter=true', '--show-paint-rects']
      'args': ['--test-type', 'show-fps-counter=true']
    }

  },


  // baseUrl: 'http://localhost:9000/',
  // Spec patterns are relative to the current working directly when
  // protractor is called.
  specs: ['test/e2e/**/*.spec.js'],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }

};