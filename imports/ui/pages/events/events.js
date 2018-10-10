import './events.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Events } from '/imports/api/events/events'
import { deleteEvent, flagEvent } from '/imports/api/events/methods'
import { notify } from '/imports/modules/notifier'
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
  }
})