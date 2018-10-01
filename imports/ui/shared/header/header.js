import './header.html'
import './header.scss'
import { Notifications } from '/imports/api/notifications/notifications'

Template.header.onCreated(function () {
  this.autorun(() => {
    this.subscribe('notifications')
  })
})

Template.header.events({
  'click .sidebar-toggler'(event) {
    event.preventDefault()
    $('body').toggleClass("sidebar-lg-show")
  },

  'click #signOut'(event) {
    event.preventDefault()

    if (Meteor.userId()) {
      Meteor.logout()
    }
  }
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