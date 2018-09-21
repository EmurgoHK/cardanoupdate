import './header.html'

Template.header.events({
    'click .sidebar-toggler' (event) {
        event.preventDefault()
        $('body').toggleClass("sidebar-lg-show")
    },

    'click #signOut' (event) {
        event.preventDefault()

        if (Meteor.userId()) { 
            Meteor.logout() 
        }
    }
})