import Route from '@ember/routing/route';
import config from '../config/environment';
import { inject as service } from '@ember/service';
import steps from '../data';

export default Route.extend({
  tour: service(),
  disableScroll: true,
  defaults: {
    classes: 'shepherd-element shepherd-open shepherd-theme-arrows',
    scrollTo: true,
    showCancelLink: true
  },

  beforeModel() {
    const tour = this.get('tour');

    tour.set('autoStart', true);
    tour.set('defaults', this.get('defaults'));
    tour.set('disableScroll', this.get('disableScroll'));
    tour.set('modal', true);

    // We need to check env, and only set steps if not testing because otherwise tests are jacked
    if (config.environment !== 'test') {
      tour.set('confirmCancel', false);
      tour.set('steps', steps);
    }

    tour.set('requiredElements', [
      {
        selector: '.first-element',
        message: 'First element not found',
        title: 'Error'
      },
      {
        selector: '.install-element',
        message: 'Install element not found',
        title: 'Error'
      }
    ]);

    tour.on('cancel', () => {
      console.log('cancel');
    });
  },

  model() {
    return {
      links: [
        {
          href: 'https://github.com/shipshapecode/ember-shepherd',
          text: 'Docs',
          type: 'href'
        },
        {
          href: 'https://github.com/shipshapecode/ember-shepherd',
          text: 'GitHub',
          type: 'href'
        },
        {
          href: 'https://shipshape.io',
          text: 'Ship Shape',
          type: 'href'
        }
      ]
    };
  }
});
