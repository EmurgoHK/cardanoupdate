import { FlowRouter } from 'meteor/kadira:flow-router'
import { notify } from '/imports/modules/notifier'

import './login.html'

Template.login.events({
    'click #goToSignup': (event, templateInstance) => {
        event.preventDefault()
        FlowRouter.go('/signup')
    },
    'submit': (event, templateInstance) => {
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
    },
    'click #js-facebook': (event, templateInstance) => {
        event.preventDefault()

        Meteor.loginWithFacebook({}, (err) => {
            if (!err) {
                FlowRouter.go(window.last || '/')
            } else {
                notify(err.message, 'error')
            }
        })
    },
    'click #js-github': (event, templateInstance) => {
        event.preventDefault()

        Meteor.loginWithGithub({}, (err) => {
            if (!err) {
                FlowRouter.go(window.last || '/')
            } else {
                notify(err.message, 'error')
            }
        })
    },
    'click #js-google': (event, templateInstance) => {
        event.preventDefault()

        Meteor.loginWithGoogle({}, (err) => {
            if (!err) {
                FlowRouter.go(window.last || '/')
            } else {
                notify(err.message, 'error')
            }
        })
    }
})

// Password Reset
Template.passwordReset.events({
  'submit #resetPasswordForm' : (event, templateInstance) => {
    event.preventDefault()
    let forgotPasswordForm = templateInstance.$(event.currentTarget),
    email = forgotPasswordForm.find('#email').val().toLowerCase()
    if (email && email !== '') {
      Accounts.forgotPassword({ email: email }, function (err) {
        if (err) {
          notify(err.reason || err.message, 'error')
          return
        } else {
          notify('Please check your mail box for password reset link.', 'success')
        }
      });
    }
  }
})