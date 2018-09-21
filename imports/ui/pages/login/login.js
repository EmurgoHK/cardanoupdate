import { FlowRouter } from 'meteor/kadira:flow-router'
import { notify } from '/imports/modules/notifier'

import './login.html'

Template.login.events({
    'click #goToSignup' (event) {
        event.preventDefault()
        FlowRouter.go('/signup')
    },

    'submit' (event) {
        event.preventDefault()

        Meteor.loginWithPassword({ 
            email: event.target.email.value 
        }, event.target.password.value, (err) => {
            if (err) {
                notify(err.message, 'error')
                return
            }

            FlowRouter.go(window.last || '/')
        })
    }
})