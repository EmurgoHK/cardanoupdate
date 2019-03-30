import './body.html'
import './body.scss'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Session } from 'meteor/session'
import { notify } from '/imports/modules/notifier'
import { resendVerificationEmail } from '/imports/api/user/methods'

Template.main.helpers({
    breadcrumbs: () => {
        let bc = Session.get('breadcrumbs') || {}

        if (bc && bc.text) {
        	bc.text = TAPi18n.__(`breadcrumbs.${bc.text}`, {
      			postProcess: 'sprintf',
      			sprintf: [bc.name || '']
    		})

          let crumbs = bc.text.split('/')
          bc.urls = bc.urls || []
          bc.urls.push(FlowRouter.current().path)

          return crumbs.map((i, ind) => {
              if (bc.param !== undefined && i.trim() === bc.param)
                  i = FlowRouter.getParam(bc.param)

              if (i !== undefined) {
                  return {
                      text: i,
                      url: bc.urls[ind],
                      notLast: ind !== crumbs.length - 1
                  }
              }
          })
        }
    },

    showVerification: () => {
      if(Meteor.user()) {
        if(Meteor.user().emails[0].verified) {
          return false
        }
        return true
      }
      return false;
    },

    userEmail: () => {
      return Meteor.user().emails[0].address;
    }
})

Template.main.events({
  'click .resend_verification_email' (event) {
    event.preventDefault()
    resendVerificationEmail.call(Meteor.userId(), (err, res) => {
      if (!err) {
      notify('Verification link sent.', 'success')
        return
      }
      notify(err.reason, 'error')
    })
  },
  'click' (event) {
    if (!$('#searchHeader').val()) {
      if (!$(event.target).closest('#searchHeaderForm').length) {
        if ($('.header-search').hasClass('active')) $('.header-search').removeClass('active')
      }
    }
  }
})
