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
})
