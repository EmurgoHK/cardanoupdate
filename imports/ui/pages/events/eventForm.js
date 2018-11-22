import './eventForm.html'
import './events.scss'
import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Events } from '/imports/api/events/events'
import { notify } from '/imports/modules/notifier'
import daterangepicker from 'daterangepicker'
import SimpleMDE from 'simplemde'
import marked from 'marked';
import moment from 'moment-timezone'
import { newEvent, editEvent } from '/imports/api/events/methods'
import '../../../../node_modules/daterangepicker/daterangepicker.css';
import { insertImage } from '/imports/ui/shared/uploader/uploader'
import { insertVideo } from '/imports/ui/pages/learn/learnForm'
import { Config } from '/imports/api/config/config'

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

      if (autocomplete) {
        autocomplete.setBounds(circle.getBounds())
      }
    })
  }
}

const initLocationSearch = function() {
  this.autocomplete = new google.maps.places.Autocomplete($('#location').get(0), {
    types: ['geocode']
  })

  this.autocomplete.addListener('place_changed', () => {
    let place = this.autocomplete.getPlace()

    let lng = place.geometry.location.lng()
    let lat = place.geometry.location.lat()

    let timestamp = $('#event_duration').val().split(' - ')

    HTTP.get(`https://api.timezonedb.com/v2.1/get-time-zone?key=5S42VGHOV6HK&format=json&by=position&lat=${lat}&lng=${lng}&time=${new Date(timestamp[0] || timestamp[1] || Date.now()).getTime() / 1000}`, (err, data) => {
      this.timezone.set(data.data)
    })

    this.location.set(place)
  })

  this.loaded.set(true)
}

Template.eventForm.onCreated(function () {
  this.loaded = new ReactiveVar(false)

  this.autorun(() => {
    this.subscribe('config')

    let config = Config.findOne({
      _id: 'google-maps-api'
    })

    if (config && !this.loaded.get()) {
      $.getScript(`https://maps.googleapis.com/maps/api/js?key=${config.key}&libraries=places`).done(() => {
        if ($('#location').get(0) && !this.loaded.get()) { // initialize the location search if the page has rendered already
          initLocationSearch.call(this)
        }
      }).fail(() => {
        console.log('Invalid Google Maps API key!')
      })
    }
  })

  this.location = new ReactiveVar({})
  this.timezone = new ReactiveVar({})
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

        this.timezone.set(event.timezone)
      }
    })
  }
})

Template.eventForm.onRendered(function() {
  if (window.google && google && google.maps && !this.loaded.get()) { // initialize the location search if the script has loaded already
    initLocationSearch.call(this)
  }

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
    previewRender: (content) => marked(content, {sanitize: true}),
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
    let charsLeftText = `${inputMaxChars} ${TAPi18n.__('events.form.chars_left')}`

    $(`#${inputId}-chars`).text(charsLeftText)

    let specialCodes = [8, 46, 37, 39] // backspace, delete, left, right

    if (inputMaxChars <= 0) {
      $(`#${inputId}`).keypress((e) => {
        return !!~specialCodes.indexOf(e.keyCode)
      })
      return true
    }
    // Remove validation error, if exists
    $(`#${inputId}`).removeClass('is-invalid')
    $(`#${inputId}`).unbind('keypress')
  },

  'submit #event_form'(event, _tpl) {
    event.preventDefault()
    let event_duration = $('#event_duration').val()

    var captchaData = grecaptcha.getResponse();

    if (FlowRouter.current().route.name === 'editEvent') {
      editEvent.call({
        eventId : FlowRouter.getParam('id'),
        headline: $('#headline').val(),
        description: _tpl.mde.value(),
        start_date: moment.tz(event_duration.split(' - ')[0], 'DD/MM/YYYY hh:mm A', _tpl.timezone.get().zoneName).utc().format('YYYY-MM-DD[T]HH:mm'), // convert to mongo format, save in UTC
        end_date : moment.tz(event_duration.split(' - ')[1], 'DD/MM/YYYY hh:mm A', _tpl.timezone.get().zoneName).utc().format('YYYY-MM-DD[T]HH:mm'), // convert to mongo format, save in UTC
        location: $('#location').val(),
        rsvp: $('#rsvp').val(),
        captcha: captchaData,
        placeId: _tpl.location.get().place_id || '',
        timezone: {
          abbreviation: _tpl.timezone.get().abbreviation,
          zoneName: _tpl.timezone.get().zoneName,
          gmtOffset: _tpl.timezone.get().gmtOffset + '',
          dst: _tpl.timezone.get().dst
        }
      }, (err, _data) => {
        if (!err) {
          notify(TAPi18n.__('events.form.success_edit'), 'success')
          FlowRouter.go('/events')
          return
        }

        if (err.details && err.details.length >= 1) {
          err.details.forEach(e => {
            $(`#${e.name}`).addClass('is-invalid')
            $(`#${e.name}Error`).show()
            $(`#${e.name}Error`).text(TAPi18n.__(e.message))
          })
        }
      })

      return
    }

    newEvent.call({
      headline: $('#headline').val(),
      description: _tpl.mde.value(),
      start_date: moment.tz(event_duration.split(' - ')[0], 'DD/MM/YYYY hh:mm A', _tpl.timezone.get().zoneName).utc().format('YYYY-MM-DD[T]HH:mm'), // convert to mongo format, save in UTC
      end_date : moment.tz(event_duration.split(' - ')[1], 'DD/MM/YYYY hh:mm A', _tpl.timezone.get().zoneName).utc().format('YYYY-MM-DD[T]HH:mm'), // convert to mongo format, save in UTC
      location: $('#location').val(),
      rsvp: $('#rsvp').val(),
      captcha: captchaData,
      placeId: _tpl.location.get().place_id || '',
      timezone: {
        abbreviation: _tpl.timezone.get().abbreviation,
        zoneName: _tpl.timezone.get().zoneName,
        gmtOffset: _tpl.timezone.get().gmtOffset + '',
        dst: _tpl.timezone.get().dst
      }
    }, (err, data) => {
      if (!err) {
        notify(TAPi18n.__('events.form.success_add'), 'success')
        FlowRouter.go('/events')
        return
      }

      if (err.details === undefined && err.reason) {
        notify(TAPi18n.__(err.reason), 'error')
        console.log(err)
        return
      }

      if (err.details && err.details.length >= 1) {
        err.details.forEach(e => {
          $(`#${e.name}`).addClass('is-invalid')
          $(`#${e.name}Error`).show()
          $(`#${e.name}Error`).text(TAPi18n.__(e.message))
        })
      }
    })
  }
})
