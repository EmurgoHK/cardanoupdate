import './socialResourceForm.html'
import { Template } from 'meteor/templating'
import { addSocialResource, editSocialResource } from '/imports/api/socialResources/methods'
import { notify } from '/imports/modules/notifier'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { socialResources } from '/imports/api/socialResources/socialResources'

const maxCharValue = (inputId) => {
    if (inputId === 'Name') { return 100 }

    return 500
}

Template.socialResourceFormTemp.onCreated(function() {
	if (FlowRouter.current().route.name === 'editSocialResource') {
		this.autorun(() => {
			this.subscribe('socialResources.item', FlowRouter.getParam('id'))
		})
	}
})


Template.socialResourceFormTemp.helpers({
    add: () => FlowRouter.current().route.name === 'editSocialResource' ? false : true,
    Resource: () => {return socialResources.findOne({ _id: FlowRouter.getParam('id') })},
})

Template.socialResourceFormTemp.events({
    'keyup .form-control' (event, _tpl) {
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

    'click .add-socialResource' (event, _tpl) {
        event.preventDefault()

        if (FlowRouter.current().route.name === 'editSocialResource') {
            editSocialResource.call({
    			projectId: FlowRouter.getParam('id'),
	    		Name: $('#Name').val(),
          Resource_url: $('#Resource_url').val() || '',
          description: $('#description').val(),
	    	}, (err, _data) => {
	    		if (!err) {
	    			notify('Successfully edited.', 'success')
	        		FlowRouter.go('/socialResources')
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

        addSocialResource.call({
            Name: $('#Name').val(),
            description: $('#description').val(),
            Resource_url: $('#Resource_url').val() || '',
        }, (err, data) => {
            if (!err) {
                notify('Successfully added.', 'success')
                FlowRouter.go('/socialResources')
                return
            }

            if (err.details === undefined && err.reason) {
                notify(err.reason, 'error')
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
