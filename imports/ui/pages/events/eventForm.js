import './eventForm.html'
import './events.scss'
import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Events } from '/imports/api/events/events'
import { notify } from '/imports/modules/notifier'
import daterangepicker from 'daterangepicker'
import SimpleMDE from 'simplemde'
import moment from 'moment'
import { newEvent, editEvent } from '/imports/api/events/methods'
import '../../../../node_modules/daterangepicker/daterangepicker.css';
import { insertImage } from '/imports/ui/shared/uploader/uploader'
import { insertVideo } from '/imports/ui/pages/learn/learnForm'

const maxCharValue = (inputId) => {
  if (inputId === 'description') {
    return 1000
  }
  if (inputId === 'headline') {
    return 90
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
  Meteor.setTimeout(() => {
    $('input#event_duration').daterangepicker({
      timePicker: true,
      startDate: moment().startOf('hour'),
      endDate: moment().startOf('hour').add(32, 'hour'),
      locale: {
        format: 'DD/MM/YYYY hh:mm A'
      }
    })
  })
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

  this.mde = new SimpleMDE({
    element: $("#description")[0],
    toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'clean-block', 'link', {
      name: 'insertImage',
      action: insertImage,
      className: 'fa fa-picture-o',
      title: 'Insert image',
    }, {
      name: 'insertVideo',
      action: insertVideo,
      className: 'fa fa-file-video-o',
      title: 'Insert YouTube video'
    }, '|', 'preview', 'side-by-side', 'fullscreen', '|', 'guide'],
  })

  window.mde = this.mde

  this.autorun(() => {
    let event = Events.findOne({
      _id: FlowRouter.getParam('id')
    })

    if (event) {
      this.mde.value(event.description)
    }
  })
})

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
  'focus #end_date'(event, _tpl) {
     if($('#start_date').val() && !$('#end_date').val()){$('#end_date').val($('#start_date').val())}
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
    let event_duration = $('#event_duration').val()
    let data = {
      headline: $('#headline').val(),
      description: _tpl.mde.value(),
      start_date: event_duration.split(' - ')[0],
      end_date : event_duration.split(' - ')[1],
      location: $('#location').val(),
      rsvp: $('#rsvp').val()
    }

    if (FlowRouter.current().route.name === 'editEvent') {
      editEvent.call({
        eventId : FlowRouter.getParam('id'),
        headline: $('#headline').val(),
        description: _tpl.mde.value(),
        start_date: moment(event_duration.split(' - ')[0], 'DD/MM/YYYY hh:mm A').format('YYYY-MM-DD[T]HH:mm'), // convert to mongo format
        end_date : moment(event_duration.split(' - ')[1], 'DD/MM/YYYY hh:mm A').format('YYYY-MM-DD[T]HH:mm'), // convert to mongo format
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
      description: _tpl.mde.value(),
      start_date: moment(event_duration.split(' - ')[0], 'DD/MM/YYYY hh:mm A').format('YYYY-MM-DD[T]HH:mm'), // convert to mongo format
      end_date : moment(event_duration.split(' - ')[0], 'DD/MM/YYYY hh:mm A').format('YYYY-MM-DD[T]HH:mm'), // convert to mongo format
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
