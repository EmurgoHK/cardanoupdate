import './eventForm.html'
import './events.scss'
import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Events } from '/imports/api/events/events'
import { TranslationGroups } from '../../../api/translationGroups/translationGroups';
import { notify } from '/imports/modules/notifier'
import daterangepicker from 'daterangepicker'
import SimpleMDE from 'simplemde'
import marked from 'marked';
import moment from 'moment-timezone'
import { newEvent, editEvent } from '/imports/api/events/methods'
import '../../../../node_modules/daterangepicker/daterangepicker.css';
import { insertImageModal } from '../../shared/mdeModals/insertImageModal';
import { insertVideoModal } from '../../shared/mdeModals/insertVideoModal';

const maxCharValue = (inputId) => {
  if (inputId === 'description') {
    return 1000
  }
  if (inputId === 'headline') {
    return 90
  }
  return 100
}

let startDate = new ReactiveVar()
let endDate = new ReactiveVar()

Template.eventForm.onCreated(function () {
  this.loaded = new ReactiveVar(false)
  this.startDate = new ReactiveVar()
  this.endDate = new ReactiveVar()
  
  this.subscribe('embeddedImages');
})

Template.eventForm.onRendered(function() {
  this.autorun(() => {
    const event = Events.findOne({
      _id: FlowRouter.getParam('id')
    });

    const start = event ? moment(event.start_date) : moment().startOf('hour');
    const end = event ? moment(event.end_date) : moment().startOf('hour').add(32, 'hour');

    $('input#event_duration').daterangepicker({
      timePicker: true,
      startDate: start,
      endDate: end,
      locale: {
        format: 'DD/MM/YYYY hh:mm A'
      }
    }, function(start, end, label) {
      startDate.set(start._d)
      endDate.set(end._d)
    })
  })
  
  this.mde = new SimpleMDE({
    element: $("#description")[0],
    toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'clean-block', 'link', {
      name: 'insertImage',
      action: insertImageModal,
      className: 'fa fa-picture-o',
      title: 'Insert image',
    }, {
      name: 'insertVideo',
      action: insertVideoModal,
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
  isNew: () => (FlowRouter.current().route.name.startsWith('new')),
  isEdit: () => (FlowRouter.current().route.name.startsWith('edit')),
  isTranslate: () => FlowRouter.current().route.name.startsWith('translate'),
  
  event: () => Events.findOne({
    _id: FlowRouter.getParam('id')
  }),

  languages: () => {
    const group = TranslationGroups.findOne({});
    const isTranslate =  FlowRouter.current().route.name.startsWith('translate');
    return Object.keys(TAPi18n.languages_names).map(key => {
      const hasTranslation = group ? group.translations.some(t => t.language === key) : key === 'en';
      return {
        code: key,
        name: TAPi18n.languages_names[key][1],
        selected: !hasTranslation && key === TAPi18n.getLanguage(),
        disabled: isTranslate && hasTranslation,
      };
    });
	},
})

Template.eventForm.events({
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
    var captchaData = grecaptcha.getResponse();

    if (FlowRouter.current().route.name === 'editEvent') {
      editEvent.call({
        eventId : FlowRouter.getParam('id'),
        headline: $('#headline').val(),
        description: _tpl.mde.value(),
        start_date: startDate.get(),
        end_date : endDate.get(),
        location: $('#location').val(),
        rsvp: $('#rsvp').val(),
        captcha: captchaData
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

    const original = FlowRouter.current().route.name.startsWith('translate') ? FlowRouter.getParam('id') : undefined;
    newEvent.call({
      headline: $('#headline').val(),
      description: _tpl.mde.value(),
      start_date: startDate.get(),
      end_date : endDate.get(),
      location: $('#location').val(),
      rsvp: $('#rsvp').val(),
      captcha: captchaData,
      language: $('#language').val(),
      original,
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
