import './home.html'
import './home.scss'

import { Template } from 'meteor/templating'
import { Projects } from '/imports/api/projects/projects'
import { Warnings } from '/imports/api/warnings/warnings';
import { Events } from '/imports/api/events/events'
import { Research } from '/imports/api/research/research'
import { Learn } from '/imports/api/learn/learn'
import { socialResources } from '/imports/api/socialResources/socialResources'
import { UsersStats } from '/imports/api/user/usersStats'
import { Stats } from '/imports/api/stats/stats'
import moment from 'moment'

import { flagResearch } from '/imports/api/research/methods'
import { flagProject, proposeNewData } from '/imports/api/projects/methods'
import { flagWarning } from '/imports/api/warnings/methods'
import { flagEvent } from '/imports/api/events/methods'
import { flagLearningItem } from '/imports/api/learn/methods'

import { flagDialog } from '/imports/modules/flagDialog'
import { notify } from '/imports/modules/notifier'

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
    this.subscribe('warnings')
    this.subscribe('learn')
    this.subscribe('stats')
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
    return Research.find({}, {limit : 6})
  },
  // Learn Helpers
  learnCount: () => !!Learn.find({}).count(),
  learn: () => Learn.find({}, {limit : 6}),
  // socialResources Helpers
  socialResourcesCount(){
    let project = socialResources.find({}).count()
    if(project){
      return true
    }
    return false
  },

  socialResources(){
    return socialResources.find({}, {limit : 6})
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
    return Projects.find({}, {limit : 6})
  },

  // Warning Helpers
  warningCount(){
    let warning = Warnings.find({}).count()
     if(warning){
      return true
    }
    return false
  },
   // Return only latest 5 warnings
  warnings(){
    return Warnings.find({}, {limit : 6})
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
    }, {limit : 6})
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

    commentsLastMonth: () => (Stats.findOne({
        _id: 'last-month'
    }) || {}).count || 0,

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
    
    flagDialog.call(this, flagResearch, 'researchId')
  },
  'click .flag-learn' : function(event, templateInstance) {
    event.preventDefault()
    
    flagDialog.call(this, flagLearningItem, 'learnId')
  },
  'click .flag-project' : function(event, templateInstance) {
    event.preventDefault()
    
    flagDialog.call(this, flagProject, 'projectId')
  },
  'click .flag-event' : function(event, templateInstance) {
    event.preventDefault()
    
    flagDialog.call(this, flagEvent, 'eventId')
  },
  'click .flag-warning' : function (event, templateInstance){
    event.preventDefault()
    
    flagDialog.call(this, flagWarning, 'eventId')
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
