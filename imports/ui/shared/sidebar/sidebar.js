import './sidebar.html'

import { FlowRouter } from 'meteor/kadira:flow-router'

Template.sidebar.helpers({
    activeClass: function(name) {
        FlowRouter.watchPathChange();
        return FlowRouter.current().route.name === name ? 'active' : '';
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
    }
})
