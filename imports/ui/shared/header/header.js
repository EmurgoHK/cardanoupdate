import './header.html'
import './header.scss'
import { Notifications } from '/imports/api/notifications/notifications'
import { FlowRouter } from 'meteor/kadira:flow-router'

Template.header.onCreated(function () {
  this.autorun(() => {
    this.subscribe('notifications')
  })
})

Template.header.events({
  'click .sidebar-toggler'(event) {
    event.stopPropagation();
    $('body').toggleClass("sidebar-show")
  },

  'click #signOut'(event) {
    event.preventDefault()

    if (Meteor.userId()) {
      Meteor.logout()
    }
  },

  'click #js-new': (event, templateInstance) => {
    event.preventDefault()

    FlowRouter.go('/add')
  },
})

Template.header.helpers({
  notificationsCount: () => Notifications.find({
    userId: Meteor.userId(),
    read: false,
    $or: [{
      type: 'notification'
    }, {
      type: {
        $exists: false
      }
    }]
  }).count(),

  userId : () => Meteor.userId()
})