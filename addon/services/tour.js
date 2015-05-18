import Ember from 'ember';

////////////////////////////////////////////////////////////////////////////////
//                             Utility Functions                              //
////////////////////////////////////////////////////////////////////////////////

/**
 * Checks the builtInButtons array for the step and adds a button with the correct action for the type
 * @param step The step to add the buttons to
 * @param shepherdStepOptions The options array to modify
 */
function addBuiltInButtons(step, shepherdStepOptions) {
  step.options.builtInButtons.forEach((button) => {
    if (button.type === 'next') {
      shepherdStepOptions.buttons.push({
        classes: button.classes,
        text: button.text,
        action: () => {
          this.trigger('next');
        }
      });
    } else if (button.type === 'back') {
      shepherdStepOptions.buttons.push({
        classes: button.classes,
        text: button.text,
        action: () => {
          this.trigger('back');
        }
      });
    } else if (button.type === 'cancel') {
      shepherdStepOptions.buttons.push({
        classes: button.classes,
        text: button.text,
        action: () => {
          this.trigger('cancel');
        }
      });
    }
  });
}

/**
 * Get the element from an option string
 *
 * @method getElementFromString
 * @param string element the string in the step configuration
 * @returns {Element} the element from the string
 */
function getElementFromString(element) {
  var attachTo = element.split(' ');
  attachTo.pop();
  var selector = attachTo.join(' ');
  return Ember.$(selector).get(0);
}

/**
 * Get the element from an option object
 *
 * @method getElementFromObject
 * @param Object attachTo
 * @returns {Element}
 */
function getElementFromObject(attachTo) {
  const op = attachTo.element;
  return Ember.$(op).get(0);
}

/**
 * Return the element for a step
 *
 * @method getElementForStep
 * @param step step the step to get an element for
 * @returns {Element} the element for this step
 */
function getElementForStep(step) {
  const attachTo = step.options.attachTo;
  const type = typeof attachTo;
  var element;
  switch (type) {
    case "string":
      element = getElementFromString(attachTo);
      break;
    default:
      element = getElementFromObject(attachTo);
      break;
  }
  return element;
}

/**
 * Taken from introjs https://github.com/usablica/intro.js/blob/master/intro.js#L1092-1124
 * Get an element position on the page
 * Thanks to `meouw`: http://stackoverflow.com/a/442474/375966
 *
 * @api private
 * @method getOffset
 * @param {Object} element
 * @returns {*} Element's position info
 */
function getElementPosition(element) {
  var elementPosition = {};

  //set width
  elementPosition.width = element.offsetWidth;

  //set height
  elementPosition.height = element.offsetHeight;

  //calculate element top and left
  var _x = 0;
  var _y = 0;
  while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
    _x += element.offsetLeft;
    _y += element.offsetTop;
    element = element.offsetParent;
  }
  //set top
  elementPosition.top = _y;
  //set left
  elementPosition.left = _x;

  return elementPosition;
}

/**
 * Creates an overlay element clone of the element you want to highlight and copies all the styles.
 * @param step The step object that points to the element to highlight
 */
function createHighlightOverlay(step) {
  Ember.$('#highlightOverlay').remove();
  var currentElement = getElementForStep(step);
  var elementPosition = getElementPosition(currentElement);
  var highlightElement = Ember.$(currentElement).clone();
  highlightElement.attr('id', 'highlightOverlay');
  Ember.$('body').append(highlightElement);
  var computedStyle = window.getComputedStyle(currentElement).cssText;
  highlightElement[0].style.cssText = computedStyle;
  //Style all internal elements as well
  var children = Ember.$(currentElement).children();
  var clonedChildren = highlightElement.children();
  for (var i = 0; i < children.length; i++) {
    clonedChildren[i].style.cssText = window.getComputedStyle(children[i]).cssText;
  }
  highlightElement.css('position', 'absolute');
  highlightElement.css('left', elementPosition.left);
  highlightElement.css('top', elementPosition.top);
  highlightElement.css('width', elementPosition.width);
  highlightElement.css('height', elementPosition.height);
  highlightElement.css('z-index', '10002');
}

/**
 * Increases the z-index of the element, to pop it out above the overlay and highlight it
 * @param step The step object that attaches to the element
 */
function popoutElement(step) {
  Ember.$('.shepherd-modal').removeClass('shepherd-modal');
  var currentElement = getElementForStep(step);
  Ember.$(currentElement).addClass('shepherd-modal');
  if (step.options.highlightClass) {
    Ember.$(currentElement).addClass(step.options.highlightClass);
  }
}

/**
 * Exchanges the given attachment configuration for the object equivalent with
 * the DOM element passed in directly.
 *
 * Allows for use of pseudoselectors, because it uses jQuery's selector engine
 * instead of the built-in one
 *
 * @param {Object} attachTo The given "attachTo" configuration
 * @return {Object} The optimized configuration
 */
function exchangeForAttachmentConfig(attachTo) {
  const type = typeof attachTo;
  var config = {
    element: null,
    on: null
  };
  switch(type) {
    case "string": {
      config.element = getElementFromString(attachTo);
      const configArray = attachTo.split(' ');
      config.on = configArray[configArray.length - 1];
      break;
    }
    case "object": {
      config.element = getElementFromObject(attachTo);
      config.on = attachTo.on;
      break;
    }
    default:
      config = null;
  }
  return config;
}


////////////////////////////////////////////////////////////////////////////////
//                              Tour Service                                  //
////////////////////////////////////////////////////////////////////////////////

export default Ember.Service.extend(Ember.Evented, {

  // Get current path
  _applicationController: null,
  currentPath: Ember.computed.oneWay('_applicationController.currentPath'),

  // Configuration Options
  defaults: {},
  disableScroll: false,
  modal: false,
  requiredElements: Ember.A([]),
  steps: Ember.A([]),

  // Iterate over steps
  _iteratorStep: 0,
  _nextStep: function() {
    const index = this.get('_iteratorStep');
    const step = this.get('steps').objectAt(index);
    const toReturn = [step, index] || null;
    this.set('_iteratorStep', index + 1);
    return toReturn;
  },

  // Handle errors
  errorTitle: null,
  messageForUser: null,

  // Is the tour currently running?
  isActive: false,

  // Create a tour object based on the current configuration
  _tourObject: function() {
    const steps = this.get('steps');

    // Return nothing if there are no steps
    if (Ember.isEmpty(steps)) {
      return;
    }

    // Create a new tour object with defaults
    var tour = new Shepherd.Tour({
      defaults: this.get('defaults')
    });

    // Check for the required elements and set up the steps on the tour
    if (!this._requiredElementsPresent()) {
      tour.addStep('error', {
        buttons: [{
          text: 'Exit',
          action: tour.cancel
        }],
        classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
        copyStyles: false,
        title: this.get('errorTitle'),
        text: [this.get('messageForUser')]
      });
    }

    // Set up tour event bindings
    tour.on('start', () => {
      if (this.get('modal')) {
        Ember.$('body').append('<div id="shepherdOverlay"> </div>');
      }
      if (this.get('disableScroll')) {
        Ember.$(window).disablescroll();
      }
      const [step, index] = this._nextStep();
      if (tour.addStep && Ember.isPresent(step) && this._requiredElementsPresent()) {
        this._addStepToTour(tour, step, index);
        getElementForStep(step).style.pointerEvents = 'auto';
      }
      this.set('isActive', true);
    });
    tour.on('complete', () => {
      this._cleanupModalLeftovers();
      if (this.get('disableScroll')) {
        Ember.$(window).disablescroll('undo');
      }
      this.set('_iteratorStep', 0);
      this.trigger('complete');
      this.notifyPropertyChange('_tourObject');
    });
    tour.on('cancel', () => {
      this._cleanupModalLeftovers();
      if (this.get('disableScroll')) {
        Ember.$(window).disablescroll('undo');
      }
      this.set('_iteratorStep', 0);
      this.set('isActive', false);
      this.notifyPropertyChange('_tourObject');
    });

    // Return the created tour object
    return tour;
  }.property('steps', 'default', 'requiredElements'),

  /**
   * Set up events
   */
  init: function() {
    // Set up event bindings
    this.on('start', () => {
      Ember.run.scheduleOnce('afterRender', this, function() {
        this.get('_tourObject').start();
      });
    });
    this.on('cancel', () => {
      this.get('_tourObject').cancel();
    });
    this.on('next', () => {
      // Add the step to the tour and transition to it
      const tour = this.get('_tourObject');
      const [step, index] = this._nextStep();
      if (Ember.isPresent(step) && this._requiredElementsPresent()) {
        this._addStepToTour(tour, step, index);
        getElementForStep(step).style.pointerEvents = 'auto';
        tour.next();
      } else {
        this.trigger('cancel');
      }
    });
    this.on('back', () => {
      //Re-enable clicking on the element
      this._getElementForCurrentStep().style.pointerEvents = 'auto';
      const stepIndex = this.get('_iteratorStep');
      this.set('_iteratorStep', stepIndex - 2);
      this.trigger('next');
    });
  },

  /**
   * Adds a step to the tour object
   */
  _addStepToTour: function(tour, step, index) {
    var shepherdStepOptions = {buttons: []};
    for (var option in step.options) {
      if (option === 'builtInButtons') {
        addBuiltInButtons.call(this, step, shepherdStepOptions);
      } else if (option === 'attachTo') {
        shepherdStepOptions[option] = exchangeForAttachmentConfig(step.options[option]);
      } else {
        shepherdStepOptions[option] = step.options[option];
      }
    }
    tour.addStep(step.id, shepherdStepOptions);

    // Step up events for the current step
    var currentStep = tour.steps[index];
    currentStep.on('before-show', () => {
      if (this.get('modal')) {
        getElementForStep(currentStep).style.pointerEvents = 'none';
        if (currentStep.options.copyStyles) {
          createHighlightOverlay(currentStep);
        } else {
          popoutElement(currentStep);
        }
      }
    });
    currentStep.on('hide', () => {
      //Remove element copy, if it was cloned
      var currentElement = getElementForStep(currentStep);
      if (currentStep.options.highlightClass) {
        Ember.$(currentElement).removeClass(currentStep.options.highlightClass);
      }
      Ember.$('#highlightOverlay').remove();
    });
  },

  _cleanupModalLeftovers: function() {
    if (this.get('modal')) {
      if (this.get('_tourObject') &&
        this.get('_tourObject').getCurrentStep() &&
        this.get('_tourObject').getCurrentStep().options.attachTo &&
        this._getElementForCurrentStep()) {
        this._getElementForCurrentStep().style.pointerEvents = 'auto';
      }
      Ember.run('afterRender', function() {
        Ember.$('#shepherdOverlay').remove();
        Ember.$('#highlightOverlay').remove();
        Ember.$('.shepherd-modal').removeClass('shepherd-modal');
      });
    }
  },

  /**
   * Observes the array of requiredElements, which are the elements that must be present at the start of the tour,
   * and determines if they exist, and are visible, if either is false, it will stop the tour from executing.
   */
  _requiredElementsPresent: function() {
    var allElementsPresent = true;
    const requiredElements = this.get('requiredElements');
    if (Ember.isPresent(requiredElements)) {
      requiredElements.forEach((element) => {
        if (allElementsPresent && (!Ember.$(element.selector)[0] || !Ember.$(element.selector).is(':visible'))) {
          allElementsPresent = false;
          this.set('errorTitle', element.title);
          this.set('messageForUser', element.message);
        }
      });
    }
    return allElementsPresent;
  },

  /**
   * Return the element for the current step
   *
   * @method _getElementForCurrentStep
   * @returns {Element} the element for the current step
   */
  _getElementForCurrentStep: function() {
    var currentStep = this.get('_tourObject').getCurrentStep();
    return getElementForStep(currentStep);
  }

});
