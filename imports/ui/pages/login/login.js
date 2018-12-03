import { FlowRouter } from 'meteor/kadira:flow-router'
import { notify } from '/imports/modules/notifier'

import './login.html'

Template.login.onRendered(function () {
  $('body').removeClass('modal-open')
  $('.modal-backdrop.fade').remove()
})

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
                notify(TAPi18n.__(err.message), 'error')
                return
            }

            if (Meteor.user().profile && Meteor.user().profile.language) {
                sessionStorage.setItem('uiLanguage', Meteor.user().profile.language)
                TAPi18n.setLanguage(Meteor.user().profile.language).always( () => {
                    FlowRouter.go(FlowRouter.getQueryParam('from') || window.last || '/');
                });
            } else {
                FlowRouter.go(FlowRouter.getQueryParam('from') || window.last || '/');
            }
        })
    },
    'click #js-facebook': (event, templateInstance) => {
        event.preventDefault()

        Meteor.loginWithFacebook({}, (err) => {
            if (!err) {
                if (Meteor.user().profile && Meteor.user().profile.language) {
                    sessionStorage.setItem('uiLanguage', Meteor.user().profile.language)
                    TAPi18n.setLanguage(Meteor.user().profile.language).always( () => {
                        FlowRouter.go(FlowRouter.getQueryParam('from') || window.last || '/');
                    });
                } else {
                    FlowRouter.go(FlowRouter.getQueryParam('from') || window.last || '/');
                }
            } else {
                notify(TAPi18n.__(err.message), 'error')
            }
        })
    },
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
          notify(TAPi18n.__(err.reason || err.message), 'error')
          return
        } else {
          notify(TAPi18n.__('login.check'), 'success')
        }
      });
    }
  }
})
