import './events.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Events } from '/imports/api/events/events'
import moment from 'moment'

const CHUNK_SIZE = 3

Template.events.onCreated(function () {
  this.sort = new ReactiveVar('date-desc')

  this.autorun(() => {
    this.subscribe('events')
  })
})

Template.events.helpers({
  chunkSize() {
    return CHUNK_SIZE + 1
  },
  events() {
    let events = Array.from(Events.find({}).fetch())

    let pastEvents = events.filter(e =>  (moment(e.start_date).diff(moment.now())) < 0 )
    
    let upcomingEvents = events.filter(e =>  (moment(e.start_date).diff(moment.now())) > 0 )

    events = upcomingEvents.concat(pastEvents);
    return events
  },
  canEdit() {
    return this.createdBy === Meteor.userId()
  },
})

Template.events.events({
  'click #add-event': (event, _) => {
    event.preventDefault()
    FlowRouter.go('/events/new')
  },
})