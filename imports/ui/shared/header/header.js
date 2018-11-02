import './header.html'
import './header.scss'
import { Notifications } from '/imports/api/notifications/notifications'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Session } from 'meteor/session'

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
   'click #searchButton, submit': (event, templateInstance) => {
       event.preventDefault();

       let q = $('#searchHeader').val();

       if(q){
        history.replaceState(null, '', `/home/?q=${q}`)
       }
       FlowRouter.go('/search')

       
       let queryParam = { q: q }
       let path = FlowRouter.path('/search', {}, queryParam)
       Session.set('searchQuery', queryParam)

       FlowRouter.go(path)

   },
     'click .backdrop': (event, templateInstance) => {
    event.preventDefault()
    //open search modal when clicked
    $(".searchModal").fadeOut();
    $(".backdrop").fadeOut();
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