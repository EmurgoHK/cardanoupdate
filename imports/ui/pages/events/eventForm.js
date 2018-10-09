import './eventForm.html'
import './events.scss'
import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Events } from '/imports/api/events/events'
import { notify } from '/imports/modules/notifier'

import { newEvent, editEvent } from '/imports/api/events/methods'

const maxCharValue = (inputId) => {
  if (inputId === 'description') {
    return 1000
  }
  return 100
}

const geolocate = (autocomplete) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      const circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      })

      autocomplete.setBounds(circle.getBounds())
    })
  }
}

Template.eventForm.onCreated(function () {
  this.location = new ReactiveVar({})

  if (FlowRouter.current().route.name === 'editEvent') {
    this.autorun(() => {
      this.subscribe('events.item', FlowRouter.getParam('id'))

      let event = Events.findOne({
        _id: FlowRouter.getParam('id')
      })

      if (event) {
        this.location.set({
          place_id: event.placeId
        })
      }
    })
  }
})

Template.eventForm.onRendered(function() {
  this.autocomplete = new google.maps.places.Autocomplete($('#location').get(0), {
    types: ['geocode']
  })

  this.autocomplete.addListener('place_changed', () => this.location.set(this.autocomplete.getPlace()))
})


MDEditBeforeRender.description=function(next){
  next('description');
} //A hook before render, please don't forget next(id); !

Template.eventForm.helpers({
  add: () => FlowRouter.current().route.name === 'editEvent' ? false : true,
  event: () => Events.findOne({
    _id: FlowRouter.getParam('id')
  })
})

Template.eventForm.events({
  'focus #location': (event, templateInstance) => {
    event.preventDefault()

    geolocate(templateInstance.autocomplete)
  },
  'keyup .form-control'(event, _tpl) {
    event.preventDefault()

    let inputId = event.target.id
    let inputValue = event.target.value
    let inputMaxChars = maxCharValue(inputId) - parseInt(inputValue.length)
    let charsLeftText = `${inputMaxChars} characters left`

    $(`#${inputId}-chars`).text(charsLeftText)

    let specialCodes = [8, 46, 37, 39] // backspace, delete, left, right

    if (inputMaxChars <= 0) {
      $(`#${inputId}`).keypress((e) => {
        return !!~specialCodes.indexOf(e.keyCode)
      })
      return true
    }

    $(`#${inputId}`).unbind('keypress')
  },

  'submit #event_form'(event, _tpl) {
    event.preventDefault()

    let data = {
      headline: $('#headline').val(),
      description: MDEdit.description.value(),
      start_date: $('#start_date').val(),
      end_date : $('#end_date').val(),
      location: $('#location').val(),
      rsvp: $('#rsvp').val()
    }
    if (FlowRouter.current().route.name === 'editEvent') {
      editEvent.call({
        eventId : FlowRouter.getParam('id'),
        headline: $('#headline').val(),
        description: MDEdit.description.value(),
        start_date: $('#start_date').val(),
        end_date : $('#end_date').val(),
        location: $('#location').val(),
        rsvp: $('#rsvp').val(),
        placeId: _tpl.location.get().place_id || ''
      }, (err, _data) => {
        if (!err) {
          notify('Successfully edited.', 'success')
          FlowRouter.go('/events')
          return
        }

        if (err.details && err.details.length >= 1) {
          err.details.forEach(e => {
            $(`#${e.name}`).addClass('is-invalid')
            $(`#${e.name}Error`).show()
            $(`#${e.name}Error`).text(e.message)
          })
        }
      })

      return
    }

    newEvent.call({
      headline: $('#headline').val(),
      description: MDEdit.description.value(),
      start_date: $('#start_date').val(),
      end_date : $('#end_date').val(),
      location: $('#location').val(),
      rsvp: $('#rsvp').val(),
      placeId: _tpl.location.get().place_id || ''
    }, (err, data) => {
      if (!err) {
        notify('Successfully added.', 'success')
        FlowRouter.go('/events')
        return
      }

      if (err.details === undefined && err.reason) {
        notify(err.reason, 'error')
        console.log(err)
        return
      }

      if (err.details && err.details.length >= 1) {
        err.details.forEach(e => {
          $(`#${e.name}`).addClass('is-invalid')
          $(`#${e.name}Error`).show()
          $(`#${e.name}Error`).text(e.message)
        })
      }
    })
  }
})