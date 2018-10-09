import './events.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Events } from '/imports/api/events/events'
import { deleteEvent } from '/imports/api/events/methods'
import swal from 'sweetalert2'

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
    return Events.find({}).fetch()
  },
  canEdit() {
    return this.createdBy === Meteor.userId()
  }
})

Template.events.events({
  'click #add-event': (event, _) => {
    event.preventDefault()
    FlowRouter.go('/events/new')
  },
  'click #js-remove': function (event, _) {
    event.preventDefault()

    swal({
      text: `Are you sure you want to remove this Event? This action is not reversible.`,
      type: 'warning',
      showCancelButton: true
    }).then(confirmed => {
      if (confirmed.value) {
        deleteEvent.call({
          eventId: this._id
        }, (err, data) => {
          if (err) {
            notify(err.reason || err.message, 'error')
          }
        })
      }
    })
  },
})