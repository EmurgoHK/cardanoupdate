import { notify } from '/imports/modules/notifier'
import './login.html';
import './login.scss';

Template.loginModal.onRendered(function() {
      $(document).ready(function() {
        var script = document.createElement("script");
        script.type="text/javascript";
        script.src = "https://connect.facebook.net/en_GB/sdk.js#xfbml=1&autoLogAppEvents=1&version=v3.2&appId=270976420195901";
        $("#fb-root").append(script);
      });
});

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

    let redirectTo = null
    if (FlowRouter.getQueryParam('from')) redirectTo = FlowRouter.getQueryParam('from')
    else {
      if (FlowRouter.current() && FlowRouter.current().queryParams && FlowRouter.current().queryParams.from) redirectTo = FlowRouter.current().queryParams.from
    }

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
          if (redirectTo) FlowRouter.go(redirectTo)
        });
      } else {
        $('#loginModal').modal('hide');
        //
        $('body').removeClass('modal-open')
        $('.modal-backdrop').remove()
        //
        // FlowRouter.go(FlowRouter.getQueryParam('from') || window.last || '/');
        if (redirectTo) FlowRouter.go(redirectTo)
      }
      // console.log('Hiding Modal ... ')

    })
  },
  'click #js-facebook': (event, templateInstance) => {
    event.preventDefault()

    let redirectTo = null
    if (FlowRouter.getQueryParam('from')) redirectTo = FlowRouter.getQueryParam('from')
    else {
      if (FlowRouter.current() && FlowRouter.current().queryParams && FlowRouter.current().queryParams.from) redirectTo = FlowRouter.current().queryParams.from
    }

    Meteor.loginWithFacebook({}, (err) => {
      if (!err) {
        if (Meteor.user().profile && Meteor.user().profile.language) {
          sessionStorage.setItem('uiLanguage', Meteor.user().profile.language)
          TAPi18n.setLanguage(Meteor.user().profile.language).always(() => {
            // FlowRouter.go(FlowRouter.getQueryParam('from') || window.last || '/');
            if (redirectTo) FlowRouter.go(redirectTo)
          });
        } else {
          $('#loginModal').modal('hide');
          // FlowRouter.go(FlowRouter.getQueryParam('from') || window.last || '/');
          if (redirectTo) FlowRouter.go(redirectTo)
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
