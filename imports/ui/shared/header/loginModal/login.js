import { notify } from '/imports/modules/notifier'
import './login.html';
import './login.scss';

Template.loginModal.events({
  'hidden.bs.modal #loginModal' (event, template) {
    $('#loginModalForm')[0].reset()
    $('#sinupModalForm')[0].reset()
    $('#resetPasswordForm')[0].reset()
    
    FlowRouter.setQueryParams({from: null})
  }
})

Template.loginForm.events({
  'click #goToSignup': (event, templateInstance) => {
    event.preventDefault()
    $('#loginModal a[href="#pills-signup"]').tab('show');
  },
  'click #goToResetPassword': (event, templateInstance) => {
    event.preventDefault()
    $('#loginModal a[href="#pills-password"]').tab('show');
  },

  'submit #loginModalForm': (event, templateInstance) => {
    event.preventDefault()

    Meteor.loginWithPassword({
      email: event.target.loginEmail.value
    }, event.target.loginPassword.value, (err) => {
      if (err) {
        notify(TAPi18n.__(err.message), 'error')
        return
      }
      if (Meteor.user().profile && Meteor.user().profile.language) {
        sessionStorage.setItem('uiLanguage', Meteor.user().profile.language)
        TAPi18n.setLanguage(Meteor.user().profile.language).always(() => {
          $('#loginModal').modal('hide');
          //
          $('body').removeClass('modal-open')
          $('.modal-backdrop').remove()
          //
          // FlowRouter.go(FlowRouter.getQueryParam('from') || window.last || '/');
          if (FlowRouter.getQueryParam('from')) FlowRouter.go(FlowRouter.getQueryParam('from'))
        });
      } else {
        $('#loginModal').modal('hide');
        //
        $('body').removeClass('modal-open')
        $('.modal-backdrop').remove()
        //
        // FlowRouter.go(FlowRouter.getQueryParam('from') || window.last || '/');
        if (FlowRouter.getQueryParam('from')) FlowRouter.go(FlowRouter.getQueryParam('from'))
      }
      // console.log('Hiding Modal ... ')

    })
  },
  'click #js-facebook': (event, templateInstance) => {
    event.preventDefault()

    Meteor.loginWithFacebook({}, (err) => {
      if (!err) {
        if (Meteor.user().profile && Meteor.user().profile.language) {
          sessionStorage.setItem('uiLanguage', Meteor.user().profile.language)
          TAPi18n.setLanguage(Meteor.user().profile.language).always(() => {
            // FlowRouter.go(FlowRouter.getQueryParam('from') || window.last || '/');
            if (FlowRouter.getQueryParam('from')) FlowRouter.go(FlowRouter.getQueryParam('from'))
          });
        } else {
          $('#loginModal').modal('hide');
          // FlowRouter.go(FlowRouter.getQueryParam('from') || window.last || '/');
          if (FlowRouter.getQueryParam('from')) FlowRouter.go(FlowRouter.getQueryParam('from'))
        }
      } else {
        notify(TAPi18n.__(err.message), 'error')
      }
    })
  },
})

Template.signupForm.events({
  'click #goToLogin'(event) {
    event.preventDefault()
    $('#loginModal a[href="#pills-login"]').tab('show');
  },

  'submit #sinupModalForm'(event) {
    event.preventDefault()
    let target = event.target
    if (target.signupEmail.value !== '' && target.signupPassword.value !== '') {
      if (target.confirmPassword.value === target.signupPassword.value) {
        Accounts.createUser({
          email: target.signupEmail.value,
          password: target.signupPassword.value,
          profile: {
            name: target.name.value,
            language: sessionStorage.getItem('uiLanguage') || "en",
          }
        }, (err) => {
          if (err) {
            notify(TAPi18n.__(err.message), 'error')
            return
          } else {
            FlowRouter.go(window.last || '/')
            $('#sinupModalForm')[0].reset()
            $('#loginModal').modal('hide');
            //
            $('body').removeClass('modal-open')
            $('.modal-backdrop').remove()
            //
            return
          }
        })
        return
      } else {
        notify(TAPi18n.__('signup.confirm_error'), 'error')
        return
      }
    } else {
      notify(TAPi18n.__('signup.required'), 'error')
    }
  }
})

Template.passwordForm.events({
  'click #goBackToLogin'(event) {
    event.preventDefault()
    $('#loginModal a[href="#pills-login"]').tab('show');
  },

  'submit #resetPasswordForm' : (event, templateInstance) => {
    event.preventDefault()
    let forgotPasswordForm = templateInstance.$(event.currentTarget),
    email = forgotPasswordForm.find('#passwordEmail').val().toLowerCase()
    if (email && email !== '') {
      Accounts.forgotPassword({ email: email }, function (err) {
        if (err) {
          notify(TAPi18n.__(err.reason || err.message), 'error')
          return
        } else {
          $('#loginModal').modal('hide');
          $('#resetPasswordForm')[0].reset()
          notify(TAPi18n.__('login.check'), 'success')
        }
      });
    }
  }
})
