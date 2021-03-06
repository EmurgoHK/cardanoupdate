import './header.html'
import './header.scss'
import './loginModal/login'
import { Notifications } from '/imports/api/notifications/notifications'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Session } from 'meteor/session'
import { updateLanguage } from '/imports/api/user/methods'

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
  'submit #searchHeaderForm': (event, templateInstance) => {
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
  'click #btnSearch' (event) {
    if (!$('.header-search').hasClass('active')) {
      $('.header-search').addClass('active')
      $('#searchHeader').trigger('focus')
    } else {
      if ($('#searchHeader').val()) {
        $('#searchHeader').val('')
        $('#searchHeader').trigger('focus')
      } else $('.header-search').removeClass('active')
    }
  },
  "change #selectLanguage"(event) {
    if(Meteor.userId() == null){
      TAPi18n.setLanguage(event.target.value);
      return;
    }
    event.preventDefault()
    updateLanguage.call({
      uId: Meteor.userId(),
      language: event.target.value,
    }, (err, res) => {
      if (!err) {
        sessionStorage.setItem('uiLanguage', event.target.value);
        TAPi18n.setLanguage(event.target.value);
        return
      }

    })
  },
  "click .change-language"(event) {
    event.stopPropagation();
  }
})

Template.header.helpers({
  languages: () => {
    return Object.keys(TAPi18n.languages_names).map(key => {
      return {
        code: key,
        name: TAPi18n.languages_names[key][1],
        selected: key === TAPi18n.getLanguage()
      };
    });
  },
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
