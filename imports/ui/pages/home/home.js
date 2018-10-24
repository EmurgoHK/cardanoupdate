import './home.html'
import './home.scss'

import { Template } from 'meteor/templating'
import { Projects } from '/imports/api/projects/projects'
import { Events } from '/imports/api/events/events'
import { Research } from '/imports/api/research/research'
import { socialResources } from '/imports/api/socialResources/socialResources'
import { UsersStats } from '/imports/api/user/usersStats'
import moment from 'moment'

import swal from 'sweetalert2'

Template.home.onCreated(function () {
  this.autorun(() => {
    this.subscribe('research')
    this.subscribe('socialResources')
    this.subscribe('projects')
    this.subscribe('events')
    this.subscribe('news')
    this.subscribe('users')
    this.subscribe('comments')
    this.subscribe('usersStats')
  })
})

Template.home.helpers({
  // Research Helpers
  researchCount(){
    let research = Research.find({}).count()
    if(research){
      return true
    }
    return false
  },

  research(){
    return Research.find({}, {limit : 5})
  },
  // socialResources Helpers
  socialResourcesCount(){
    let project = socialResources.find({}).count()
    if(project){
      return true
    }
    return false
  },

  socialResources(){
    return socialResources.find({}, {limit : 5})
  },

  // Project Helpers
  projectCount(){
    let project = Projects.find({}).count()
    if(project){
      return true
    }
    return false
  },

  // Return only latest 5 projects
  projects(){
    return Projects.find({}, {limit : 5})
  },

  // Events
  eventCount(){
    let event = Events.find({}).count()
    if(event){
      return true
    }
    return false
  },

  events(){
    // Return only latest 5 active events
    return Events.find({
      start_date : {
        $gte : moment().toISOString()
      }
    }, {limit : 5})
  },

  eventLabel() {
    let now = moment()
    if (moment(this.start_date) > now && moment(this.end_date) > now){
      return 'upcoming-event'
    } else if ( moment(this.start_date) <= now && now <= moment(this.end_date)) {
      return 'ongoing-event'
    } else {
      return 'past-event'
    }
  },

  // User Stats
  signedUp: () => (UsersStats.findOne({
    _id: 'lastMonth'
  }) || {}).created || 0,

  commentsLastMonth: () => (UsersStats.findOne({
    _id: 'lastMonthComments'
  }) || {}).created || 0,

  onlineUsers() {
    let connectionUsers = ((UsersStats.findOne("connected") || {}).userIds || []).length;
    return connectionUsers ? connectionUsers : 0;
  },

  totalUsers: () => Meteor.users.find({}).count() || 0,
})

Template.home.events({

  'click #add-new' (event, _tpl) {
    $('#newModal').modal('show')
  },
  'click .projectWarning' (event, _tpl) {
    console.log('HELLO')
      event.preventDefault()
      swal({
          title: 'Missing source repository',
          text: "This project does't contain any link to the source repository",
          type: 'warning',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Okay'
      })
  },
  'click .flag-research' : function(event, templateInstance) {
    event.preventDefault()
    swal({
        title: 'Why are you flagging this?',
        input: 'text',
        showCancelButton: true,
        inputValidator: (value) => {
            return !value && 'You need to write a valid reason!'
        }
    }).then(data => {
        if (data.value) {
            flagResearch.call({
                researchId: this._id,
                reason: data.value
            }, (err, data) => {
                if (err) {
                    notify(err.reason || err.message, 'error')
                } else {
                    notify('Successfully flagged. Moderators will decide what to do next.', 'success')
                }
            })
        }
    })
  },
  'click .flag-project' : function (event, templateInstance){
    event.preventDefault()
    swal({
      title: 'Why are you flagging this?',
      input: 'text',
      showCancelButton: true,
      inputValidator: (value) => {
        return !value && 'You need to write a valid reason!'
      }
    }).then(data => {
      if (data.value) {
        flagProject.call({
          projectId: this._id,
          reason: data.value
        }, (err, data) => {
          if (err) {
            notify(err.reason || err.message, 'error')
          } else {
            notify('Successfully flagged. Moderators will decide what to do next.', 'success')
          }
        })
      }
    })
  },
  'click .flag-event' : function (event, templateInstance){
    event.preventDefault()
    swal({
      title: 'Why are you flagging this?',
      input: 'text',
      showCancelButton: true,
      inputValidator: (value) => {
        return !value && 'You need to write a valid reason!'
      }
    }).then(data => {
      if (data.value) {
        flagEvent.call({
          eventId: this._id,
          reason: data.value
        }, (err, data) => {
          if (err) {
            notify(err.reason || err.message, 'error')
          } else {
            notify('Successfully flagged. Moderators will decide what to do next.', 'success')
          }
        })
      }
    })
  },
    'click .new-link': function(event, temlateInstance) {
        if ($(event.currentTarget).attr('href')) {
            return
        }


        let data = $(event.currentTarget).attr('class').includes('github') ? 'github' : 'website'

        swal({
            text: `Website is not available. If you know this information, please contribute below:`,
            type: 'warning',
            showCancelButton: true,
            input: 'text'
        }).then(val => {
            if (val.value) {
                proposeNewData.call({
                    projectId: this._id,
                    datapoint: data,
                    newData: val.value,
                    type: 'link'
                }, (err, data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                    } else {
                        notify('Successfully contributed.', 'success')
                    }
                })
            }
        })
    },
})
