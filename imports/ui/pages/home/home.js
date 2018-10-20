import './home.html'
import './home.scss'

import { Template } from 'meteor/templating'
import { Projects } from '/imports/api/projects/projects'
import { Events } from '/imports/api/events/events'
import { Research } from '/imports/api/research/research'
import { socialResources } from '/imports/api/socialResources/socialResources'
import { UsersStats } from '/imports/api/user/usersStats'
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
        $lte : moment().toISOString()
      }
    }, {limit : 5})
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
  
})