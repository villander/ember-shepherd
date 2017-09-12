'use strict';

define('dummy/tests/acceptance/ember-shepherd-test', ['qunit', 'dummy/tests/helpers/module-for-acceptance'], function (_qunit, _moduleForAcceptance) {
  'use strict';

  var $ = Ember.$;


  var container = void 0,
      tour = void 0;

  function patchClick(sel, container) {
    find(sel, container)[0].click();
  }

  (0, _moduleForAcceptance.default)('Tour functionality tests', {
    beforeEach: function beforeEach() {
      container = this.application.__container__;
      tour = container.lookup('service:tour');
      tour.set('autoStart', false);
      tour.set('modal', false);
    },
    afterEach: function afterEach() {
      // Remove all Shepherd stuff, to start fresh each time.
      find('.shepherd-active', 'body').removeClass('shepherd-active');
      find('[class^=shepherd]', 'body').remove();
      find('[id^=shepherd]', 'body').remove();
      tour.cleanup();
    }
  });

  (0, _qunit.test)('Shows cancel link', function (assert) {
    visit('/');
    click('.toggleHelpModal');
    andThen(function () {
      var cancelLink = find('.shepherd-cancel-link', 'body');
      assert.ok(cancelLink);
    });
  });

  (0, _qunit.test)('Hides cancel link', function (assert) {
    var defaults = {
      classes: 'shepherd-element shepherd-open shepherd-theme-arrows test-defaults',
      showCancelLink: false
    };

    var steps = [{
      id: 'test-highlight',
      options: {
        attachTo: '.first-element bottom',
        builtInButtons: [{
          classes: 'shepherd-button-secondary cancel-button',
          text: 'Exit',
          type: 'cancel'
        }, {
          classes: 'shepherd-button-primary next-button',
          text: 'Next',
          type: 'next'
        }],
        showCancelLink: false,
        classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
        copyStyles: false,
        highlightClass: 'highlight',
        title: 'Welcome to Ember-Shepherd!',
        text: ['Testing highlight']
      }
    }];

    visit('/');

    andThen(function () {
      tour.cancel();
      tour.set('defaults', defaults);
      tour.set('steps', steps);
      tour.set('autoStart', false);
      click('.toggleHelpModal');
      andThen(function () {
        assert.equal(find('.shepherd-open a.shepherd-cancel-link', 'body').length, 0);
      });
    });
  });

  (0, _qunit.test)('Cancel link cancels the tour', function (assert) {
    visit('/');
    click('.toggleHelpModal');

    andThen(function () {
      assert.equal(find('.shepherd-active', 'html').length, 1, 'Body has class of shepherd-active, when shepherd becomes active');
      patchClick('.shepherd-content a.shepherd-cancel-link', 'body');
      andThen(function () {
        assert.equal(find('.shepherd-active', 'html').length, 0, 'Body does not have class of shepherd-active, when shepherd becomes inactive');
      });
    });
  });

  (0, _qunit.test)('Modal page contents', function (assert) {
    assert.expect(3);

    visit('/');

    click('.toggleHelpModal');

    andThen(function () {
      assert.equal(find('.shepherd-active', 'html').length, 1, 'Body gets class of shepherd-active, when shepherd becomes active');
      assert.equal(find('.shepherd-enabled', 'body').length, 2, 'attachTo element and tour have shepherd-enabled class');
      assert.equal(find('#shepherdOverlay', 'body').length, 1, '#shepherdOverlay exists, since modal');
    });
  });

  (0, _qunit.test)('Non-modal page contents', function (assert) {
    assert.expect(3);

    visit('/');
    andThen(function () {
      tour.cancel();

      click('.toggleHelpNonmodal');

      andThen(function () {
        assert.equal(find('body.shepherd-active', 'html').length, 1, 'Body gets class of shepherd-active, when shepherd becomes active');
        assert.equal(find('.shepherd-enabled', 'body').length, 2, 'attachTo element and tour get shepherd-enabled class');
        assert.equal(find('#shepherdOverlay', 'body').length, 0, '#shepherdOverlay should not exist, since non-modal');
      });
    });
  });

  (0, _qunit.test)('Tour next, back, and cancel builtInButtons work', function (assert) {
    assert.expect(3);

    visit('/');

    click('.toggleHelpModal');

    andThen(function () {
      patchClick('.shepherd-content a:contains(Next)', 'body');
      assert.equal(find('.back-button', '.shepherd-enabled', 'body').length, 1, 'Ensure that the back button appears');
      patchClick('.shepherd-content a:contains(Back)', 'body');
      assert.equal(find('.back-button', '.shepherd-enabled', 'body').length, 0, 'Ensure that the back button disappears');
      patchClick('.shepherd-content a:contains(Exit)', 'body');
      assert.equal(find('[class^=shepherd-button]:visible', 'body').length, 0, 'Ensure that all buttons are gone, after exit');
    });
  });

  (0, _qunit.test)('Highlight applied', function (assert) {
    assert.expect(2);

    var steps = [{
      id: 'test-highlight',
      options: {
        attachTo: '.first-element bottom',
        builtInButtons: [{
          classes: 'shepherd-button-secondary cancel-button',
          text: 'Exit',
          type: 'cancel'
        }, {
          classes: 'shepherd-button-primary next-button',
          text: 'Next',
          type: 'next'
        }],
        classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
        copyStyles: false,
        highlightClass: 'highlight',
        title: 'Welcome to Ember-Shepherd!',
        text: ['Testing highlight']
      }
    }];

    visit('/');

    andThen(function () {
      tour.set('steps', steps);
      tour.set('modal', true);
      click('.toggleHelpModal');

      andThen(function () {
        assert.equal(find('.highlight', 'body').length, 1, 'currentElement highlighted');
        patchClick('.shepherd-content a:contains(Exit)', 'body');
        assert.equal(find('.highlight', 'body').length, 0, 'highlightClass removed on cancel');
      });
    });
  });

  (0, _qunit.test)('Highlight applied when `tour.modal == false`', function (assert) {
    assert.expect(2);

    var steps = [{
      id: 'test-highlight',
      options: {
        attachTo: '.first-element bottom',
        builtInButtons: [{
          classes: 'shepherd-button-secondary cancel-button',
          text: 'Exit',
          type: 'cancel'
        }, {
          classes: 'shepherd-button-primary next-button',
          text: 'Next',
          type: 'next'
        }],
        classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
        copyStyles: false,
        highlightClass: 'highlight',
        title: 'Welcome to Ember-Shepherd!',
        text: ['Testing highlight']
      }
    }];

    visit('/');

    andThen(function () {
      tour.set('steps', steps);
      click('.toggleHelpNonmodal');

      andThen(function () {
        assert.equal(find('.highlight', 'body').length, 1, 'currentElement highlighted');
        patchClick('.shepherd-content a:contains(Exit)', 'body');
        assert.equal(find('.highlight', 'body').length, 0, 'highlightClass removed on cancel');
      });
    });
  });

  (0, _qunit.test)('Defaults applied', function (assert) {
    assert.expect(1);

    var defaults = {
      classes: 'shepherd-element shepherd-open shepherd-theme-arrows test-defaults',
      scrollTo: false,
      showCancelLink: true
    };

    var steps = [{
      id: 'test-defaults-classes',
      options: {
        attachTo: '.first-element bottom',
        builtInButtons: [{
          classes: 'shepherd-button-secondary cancel-button',
          text: 'Exit',
          type: 'cancel'
        }, {
          classes: 'shepherd-button-primary next-button',
          text: 'Next',
          type: 'next'
        }],
        copyStyles: false,
        highlightClass: 'highlight',
        title: 'Welcome to Ember-Shepherd!',
        text: ['Testing defaults']
      }
    }];

    visit('/');
    andThen(function () {
      tour.set('defaults', defaults);
      tour.set('steps', steps);
      click('.toggleHelpModal');

      andThen(function () {
        assert.equal(find('.test-defaults', 'body').length, 1, 'defaults class applied');
        patchClick('.shepherd-content a:contains(Exit)', 'body');
      });
    });
  });

  (0, _qunit.test)('configuration works with attachTo object when element is a simple string', function (assert) {
    assert.expect(1);

    // Override default behavior
    var steps = [{
      id: 'test-highlight',
      options: {
        attachTo: {
          element: '.first-element',
          on: 'bottom'
        },
        builtInButtons: [{
          classes: 'shepherd-button-secondary cancel-button',
          text: 'Exit',
          type: 'cancel'
        }, {
          classes: 'shepherd-button-primary next-button',
          text: 'Next',
          type: 'next'
        }],
        classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
        copyStyles: false,
        highlightClass: 'highlight',
        title: 'Welcome to Ember-Shepherd!',
        text: ['Testing highlight']
      }
    }];

    tour.set('steps', steps);

    visit('/');
    click('.toggleHelpModal');
    andThen(function () {
      assert.ok(find('.shepherd-step', 'body').length, 'tour is visible');
    });
  });

  (0, _qunit.test)('configuration works with attachTo object when element is dom element', function (assert) {
    assert.expect(1);

    // Override default behavior
    var steps = [{
      id: 'test-highlight',
      options: {
        attachTo: {
          element: $('.medium-8:first')[0],
          on: 'bottom'
        },
        builtInButtons: [{
          classes: 'shepherd-button-secondary cancel-button',
          text: 'Exit',
          type: 'cancel'
        }, {
          classes: 'shepherd-button-primary next-button',
          text: 'Next',
          type: 'next'
        }],
        classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
        copyStyles: false,
        highlightClass: 'highlight',
        title: 'Welcome to Ember-Shepherd!',
        text: ['Testing highlight']
      }
    }];

    tour.set('steps', steps);

    visit('/');
    click('.toggleHelpModal');
    andThen(function () {
      assert.ok(find('.shepherd-step', 'body').length, 'tour is visible');
    });
  });

  (0, _qunit.test)('buttons work when type is not specified and passed action is triggered', function (assert) {
    assert.expect(4);
    var buttonActionCalled = false;

    var steps = [{
      id: 'test-highlight',
      options: {
        attachTo: {
          element: $('.medium-8:first')[0],
          on: 'bottom'
        },
        builtInButtons: [{
          classes: 'shepherd-button-secondary button-one',
          text: 'button one'
        }, {
          classes: 'shepherd-button-secondary button-two',
          text: 'button two',
          action: function action() {
            return buttonActionCalled = true;
          }
        }, {
          classes: 'shepherd-button-secondary button-three',
          text: 'button three',
          action: function action() {}
        }],
        classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
        copyStyles: false,
        highlightClass: 'highlight',
        title: 'Welcome to Ember-Shepherd!',
        text: ['Testing highlight']
      }
    }];

    visit('/');

    andThen(function () {
      tour.set('steps', steps);

      click('.toggleHelpModal');

      andThen(function () {
        assert.ok(find('.button-one', 'body').length, 'tour button one is visible');
        assert.ok(find('.button-two', 'body').length, 'tour button two is visible');
        assert.ok(find('.button-three', 'body').length, 'tour button three is visible');
        patchClick('.button-two', 'body');
      });

      andThen(function () {
        assert.ok(buttonActionCalled, 'button action triggered');
      });
    });
  });

  (0, _qunit.test)('`pointer-events` is set to `auto` for any step element on clean up', function (assert) {
    assert.expect(4);
    visit('/');

    click('.toggleHelpModal');

    // Go through a step of the tour...
    andThen(function () {
      patchClick('.next-button', '[data-id="intro"]');
    });

    // Check the target elements have pointer-events = 'none'
    andThen(function () {
      // Get the 2 shepherd-target's
      find('.shepherd-target').map(function (key, elem) {
        assert.equal(elem.style.pointerEvents, 'none');
      });

      // Exit the tour
      patchClick('.cancel-button', '[data-id="installation"]');
    });

    // Check all the target elements now have pointer-events = 'auto'
    andThen(function () {
      // Get the 2 shepherd-target's again
      find('.shepherd-target').map(function (key, elem) {
        assert.equal(elem.style.pointerEvents, 'auto');
      });
    });
  });

  (0, _qunit.test)('scrollTo works with disableScroll on', function (assert) {
    assert.expect(2);
    // Setup controller tour settings
    tour.set('disableScroll', true);
    tour.set('scrollTo', true);

    // Visit route
    visit('/');

    $('#ember-testing-container').scrollTop(0);

    assert.equal($('#ember-testing-container').scrollTop(), 0, 'Scroll is initially 0');

    click('.toggleHelpModal');

    andThen(function () {
      patchClick('.shepherd-content a:contains(Next)', 'body');
      andThen(function () {
        patchClick('.shepherd-content a:contains(Next)', 'body');
      });
      andThen(function () {
        assert.ok($('#ember-testing-container').scrollTop() > 0, 'Scrolled down correctly');
      });
    });
  });

  (0, _qunit.test)('scrollTo works with a custom scrollToHandler', function (assert) {
    assert.expect(2);
    // Override default behavior
    var steps = [{
      id: 'intro',
      options: {
        attachTo: '.first-element bottom',
        builtInButtons: [{
          classes: 'shepherd-button-secondary cancel-button',
          text: 'Exit',
          type: 'cancel'
        }, {
          classes: 'shepherd-button-primary next-button',
          text: 'Next',
          type: 'next'
        }],
        classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
        copyStyles: false,
        title: 'Welcome to Ember Shepherd!',
        text: ['A field that has rested gives a bountiful crop.'],
        scrollTo: true,
        scrollToHandler: function scrollToHandler() {
          return $('#ember-testing-container').scrollTop(120);
        }
      }
    }];

    // Visit route
    visit('/');

    andThen(function () {
      tour.set('steps', steps);

      $('#ember-testing-container').scrollTop(0);
      assert.equal($('#ember-testing-container').scrollTop(), 0, 'Scroll is initially 0');

      click('.toggleHelpModal');

      andThen(function () {
        patchClick('.shepherd-content a:contains(Next)', 'body');
        assert.ok($('#ember-testing-container').scrollTop() === 120, 'Scrolled correctly');
      });
    });
  });

  (0, _qunit.test)('scrollTo works without a custom scrollToHandler', function (assert) {
    assert.expect(2);
    // Setup controller tour settings
    tour.set('scrollTo', true);

    // Visit route
    visit('/');

    $('#ember-testing-container').scrollTop(0);

    assert.equal($('#ember-testing-container').scrollTop(), 0, 'Scroll is initially 0');

    click('.toggleHelpModal');

    andThen(function () {
      patchClick('.shepherd-content a:contains(Next)', 'body');
      andThen(function () {
        assert.ok($('#ember-testing-container').scrollTop() > 0, 'Scrolled correctly');
      });
    });
  });
});
define('dummy/tests/app.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | app');

  QUnit.test('app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'app.js should pass ESLint\n\n');
  });

  QUnit.test('controllers/application.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'controllers/application.js should pass ESLint\n\n');
  });

  QUnit.test('resolver.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'resolver.js should pass ESLint\n\n');
  });

  QUnit.test('router.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'router.js should pass ESLint\n\n');
  });

  QUnit.test('routes/application.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/application.js should pass ESLint\n\n');
  });
});
define('dummy/tests/helpers/destroy-app', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = destroyApp;
  var run = Ember.run;
  function destroyApp(application) {
    run(application, 'destroy');
  }
});
define('dummy/tests/helpers/module-for-acceptance', ['exports', 'qunit', 'dummy/tests/helpers/start-app', 'dummy/tests/helpers/destroy-app'], function (exports, _qunit, _startApp, _destroyApp) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    (0, _qunit.module)(name, {
      beforeEach: function beforeEach() {
        this.application = (0, _startApp.default)();

        if (options.beforeEach) {
          return options.beforeEach.apply(this, arguments);
        }
      },
      afterEach: function afterEach() {
        var _this = this;

        var afterEach = options.afterEach && options.afterEach.apply(this, arguments);
        return resolve(afterEach).then(function () {
          return (0, _destroyApp.default)(_this.application);
        });
      }
    });
  };

  var resolve = Ember.RSVP.resolve;
});
define('dummy/tests/helpers/resolver', ['exports', 'dummy/resolver', 'dummy/config/environment'], function (exports, _resolver, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var resolver = _resolver.default.create();

  resolver.namespace = {
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix
  };

  exports.default = resolver;
});
define('dummy/tests/helpers/start-app', ['exports', 'dummy/app', 'dummy/config/environment'], function (exports, _app, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = startApp;
  var merge = Ember.merge;
  var run = Ember.run;
  function startApp(attrs) {
    var attributes = merge({}, _environment.default.APP);
    attributes = merge(attributes, attrs); // use defaults, but you can override;

    return run(function () {
      var application = _app.default.create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
      return application;
    });
  }
});
define('dummy/tests/styles/app.stylelint-test', [], function () {
  'use strict';

  QUnit.module(' Style Lint ');
  QUnit.test('styles/app.scss should pass style lint', function (assert) {
    assert.expect(1);
    assert.ok(true, '');
  });
});
define('dummy/tests/styles/fonts.stylelint-test', [], function () {
  'use strict';

  QUnit.module(' Style Lint ');
  QUnit.test('styles/fonts.scss should pass style lint', function (assert) {
    assert.expect(1);
    assert.ok(true, '');
  });
});
define('dummy/tests/styles/prism-ghcolors.stylelint-test', [], function () {
  'use strict';

  QUnit.module(' Style Lint ');
  QUnit.test('styles/prism-ghcolors.scss should pass style lint', function (assert) {
    assert.expect(1);
    assert.ok(true, '');
  });
});
define('dummy/tests/templates.template.lint-test', [], function () {
  'use strict';

  QUnit.module('TemplateLint');

  QUnit.test('dummy/templates/application.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'dummy/templates/application.hbs should pass TemplateLint.\n\n');
  });
});
define('dummy/tests/test-helper', ['dummy/tests/helpers/resolver', 'ember-qunit', 'ember-cli-qunit'], function (_resolver, _emberQunit, _emberCliQunit) {
  'use strict';

  (0, _emberQunit.setResolver)(_resolver.default);
  (0, _emberCliQunit.start)();
});
define('dummy/tests/tests.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | tests');

  QUnit.test('acceptance/ember-shepherd-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'acceptance/ember-shepherd-test.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/destroy-app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/destroy-app.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/module-for-acceptance.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/module-for-acceptance.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/resolver.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/resolver.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/start-app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/start-app.js should pass ESLint\n\n');
  });

  QUnit.test('test-helper.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass ESLint\n\n');
  });

  QUnit.test('unit/services/tour-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/services/tour-test.js should pass ESLint\n\n');
  });
});
define('dummy/tests/unit/services/tour-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  var EmberObject = Ember.Object;
  var run = Ember.run;


  var steps = [{
    id: 'intro',
    options: {
      attachTo: '.test-element bottom',
      builtInButtons: [{
        classes: 'shepherd-button-secondary',
        text: 'Exit',
        type: 'cancel'
      }, {
        classes: 'shepherd-button-primary',
        text: 'Next',
        type: 'next'
      }],
      classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
      copyStyles: false,
      title: 'Welcome to Ember-Shepherd!',
      text: ['Test text'],
      scrollTo: true,
      scrollToHandler: function scrollToHandler() {
        return 'custom scrollToHandler';
      }
    }
  }];

  (0, _emberQunit.moduleFor)('service:tour', 'Unit | Service | tour', {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  });

  (0, _emberQunit.test)('it starts the tour when the `start` event is triggered', function (assert) {
    assert.expect(1);

    var mockTourObject = EmberObject.extend({
      start: function start() {
        assert.ok(true, 'The tour was started');
      }
    }).create();

    var service = this.subject({
      steps: steps
    });

    service.set('tourObject', mockTourObject);

    run(function () {
      service.start();
    });
  });

  (0, _emberQunit.test)('it allows another object to bind to events', function (assert) {
    assert.expect(1);

    var mockTourObject = EmberObject.extend({
      next: function next() {}
    }).create();

    var service = this.subject({
      steps: steps
    });

    service.set('tourObject', mockTourObject);

    service.on('next', function () {
      assert.ok(true);
    });

    run(function () {
      service.next();
    });
  });

  (0, _emberQunit.test)('it passes through a custom scrollToHandler option', function (assert) {
    assert.expect(1);

    var mockTourObject = EmberObject.extend({
      start: function start() {
        assert.equal(steps[0].options.scrollToHandler(), 'custom scrollToHandler', 'The handler was passed through as an option on the step');
      }
    }).create();

    var service = this.subject({
      steps: steps
    });

    service.set('tourObject', mockTourObject);

    run(function () {
      service.start();
    });
  });
});
require('dummy/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;
//# sourceMappingURL=tests.map
