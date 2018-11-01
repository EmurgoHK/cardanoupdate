import './researchForm.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Research } from '/imports/api/research/research'
import { notify } from '/imports/modules/notifier'

import { newResearch, editResearch } from '/imports/api/research/methods'

import '/imports/ui/shared/uploader/uploader'
import { getFiles } from '/imports/ui/shared/uploader/uploader'

const maxCharValue = (inputId) => {
  if (inputId === 'headline') {
    return 90
  }
}

Template.researchForm.onCreated(function() {
	if (FlowRouter.current().route.name === 'editResearch') {
		this.autorun(() => {
			this.subscribe('research.item', FlowRouter.getParam('slug'))
		})
	}
})

Template.researchForm.helpers({
	research: () => Research.findOne({
		slug: FlowRouter.getParam('slug')
  	}),
  	add: () => !(FlowRouter.current().route.name === 'editResearch'),
  	pdf: () => {
  		if (FlowRouter.current().route.name === 'editResearch') {
  			let research = Research.findOne({
				slug: FlowRouter.getParam('slug')
  			}) || {}

  			if (research && research.pdf) {
  				return [research.pdf]
  			}

  			return []
  		}

  		return []
	}
})

Template.researchForm.events({
	'keyup .form-control': (event, templateInstance) => {
        event.preventDefault()

        let inputId = event.target.id
        let inputValue = event.target.value
        let inputMaxChars = maxCharValue(inputId) - parseInt(inputValue.length)
        let charsLeftText = `${inputMaxChars} characters left`

        $(`#${inputId}-chars`).text(charsLeftText)

        let specialCodes = [8, 46, 37, 39] // backspace, delete, left, right

        if (inputMaxChars <= 0) {
          	$(`#${inputId}`).keypress((e) => { return !!~specialCodes.indexOf(e.keyCode) })
          	return true
        }

        $(`#${inputId}`).unbind('keypress')
    },
    'click .new-research': function(event, templateInstance) {
		event.preventDefault()

    	if (FlowRouter.current().route.name === 'newResearch') {
	    	newResearch.call({
	    		headline: $('#headline').val(),
	    		abstract: $('#abstract').val(),
				pdf: getFiles()[0]
	    	}, (err, data) => {
	    		if (!err) {
	    			notify('Successfully added.', 'success')

	        		FlowRouter.go('/research')

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
    		let research = Research.findOne({
    			slug: FlowRouter.getParam('slug')
    		})

    		editResearch.call({
    			researchId: research._id,
	    		headline: $('#headline').val(),
	    		abstract: $('#abstract').val(),
				pdf: getFiles()[0]
	    	}, (err, data) => {
	    		if (!err) {
	    			notify('Successfully edited.', 'success')

	        		FlowRouter.go('/research')

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
