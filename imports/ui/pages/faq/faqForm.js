import './faqForm.html'
import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Faq } from '/imports/api/faq/faq'
import { notify } from '/imports/modules/notifier'

import { newFaqItem, editFaqItem } from '/imports/api/faq/methods'

const maxCharValue = (inputId) => {
  if (inputId === 'question') {
    return 90
  } else {
    return 260
  }
}

Template.faqForm.onCreated(function() {
	if (FlowRouter.current().route.name === 'editFaq') {
		this.autorun(() => {
			this.subscribe('faq.item', FlowRouter.getParam('slug'))
		})
	}
})

Template.faqForm.helpers({
	faq: () => Faq.findOne({
		slug: FlowRouter.getParam('slug')
  }),
	add: () => !(FlowRouter.current().route.name === 'editFaq'),
})

Template.faqForm.events({
	'keyup .form-control': (event, templateInstance) => {
    event.preventDefault()
    let inputId = event.target.id
    let inputValue = event.target.value
    let inputMaxChars = maxCharValue(inputId) - parseInt(inputValue.length)
    let charsLeftText = `${inputMaxChars} ${TAPi18n.__('faq.chars_left')}`
    $(`#${inputId}-chars`).text(charsLeftText)
    let specialCodes = [8, 46, 37, 39] // backspace, delete, left, right
    if (inputMaxChars <= 0) {
      $(`#${inputId}`).keypress((e) => { return !!~specialCodes.indexOf(e.keyCode) })
      return true
    }
    // Remove validation error, if exists
    $(`#${inputId}`).removeClass('is-invalid')
    $(`#${inputId}`).unbind('keypress')
  },

  'click .new-faq': function(event, templateInstance) {
		event.preventDefault()
    	if (FlowRouter.current().route.name === 'newFaq') {
	    	newFaqItem.call({
          question: $('#question').val(),
          answer : $('#answer').val(),
	    	}, (err, data) => {
	    		if (!err) {
	    			notify(TAPi18n.__('faq.success_add'), 'success')
	        		FlowRouter.go('/faqs')
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
    	} else {
    		let faq = Faq.findOne({
    			_id: FlowRouter.getParam('id')
        })
    		editFaqItem.call({
    			faqId: faq._id,
          question: $('#question').val(),
          answer : $('#answer').val(),
	    	}, (err, data) => {
	    		if (!err) {
	    			notify(TAPi18n.__('faq.success_edit'), 'success')
	        		FlowRouter.go('/faqs')
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
    }
})