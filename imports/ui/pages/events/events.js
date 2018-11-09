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
  canEdit() {
    return this.createdBy === Meteor.userId()
  },
  
  resultArgs() {
      return {
          types: ['events'],
          searchTerm: undefined,
      }
  },
})

Template.events.events({
  'click #add-event': (event, _) => {
    event.preventDefault()
    FlowRouter.go('/events/new')
  },
})