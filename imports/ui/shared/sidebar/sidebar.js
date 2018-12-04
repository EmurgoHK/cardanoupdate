import './sidebar.html'

import { FlowRouter } from 'meteor/kadira:flow-router'

Template.sidebar.helpers({
    activeClass: function(name) {
        FlowRouter.watchPathChange();
        return FlowRouter.current().route.name === name ? 'active' : '';
    },
    languages: () => {
      return _.union(Object.keys(TAPi18n.languages_names).map(key => {
        return {
          code: key,
          name: TAPi18n.languages_names[key][1],
          selected: key === TAPi18n.getLanguage()
        };
      }), [{
        code: 'new',
        name: TAPi18n.__('shared.add_language')
      }]);
    }
});

Template.sidebar.events({
    'click .sidebar-minimizer': function() {
      $('body').toggleClass("sidebar-minimized")
      // $('body').toggleClass("sidebar-show")
    },
    'click .nav-item': function() {
    	//only close the side bar when the screen size is less that 400pixel e.g. mobile devices
      if ($(window).width() < 400) {
        $('body').removeClass("sidebar-lg-show")
      }
    },
    'click .nav-dropdown-toggle' (event, template) {
      event.preventDefault()
      $(event.currentTarget).closest('.nav-dropdown').toggleClass('open')
    },
    "change #selectLanguage"(event) {
      event.preventDefault();
      if (event.target.value === 'new') {
        FlowRouter.go('/translations')
      } else {
        TAPi18n.setLanguage(event.target.value);
      }
    }
})
