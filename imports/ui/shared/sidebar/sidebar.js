import './sidebar.html'

Template.sidebar.events({
    'click .sidebar-minimizer': function() {
        $('body').toggleClass("sidebar-minimized")
    }
})
