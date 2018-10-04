import './projectForm.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Projects } from '/imports/api/projects/projects'
import { notify } from '/imports/modules/notifier'

import { addProject, editProject } from '/imports/api/projects/methods'

const maxCharValue = (inputId) => {
    if (inputId === 'headline') { return 100 } 

    return 500
}

Template.projectForm.onCreated(function() {
	if (FlowRouter.current().route.name === 'editProject') {
		this.autorun(() => {
			this.subscribe('projects.item', FlowRouter.getParam('id'))
		})
	}
})

Template.projectForm.helpers({
    add: () => FlowRouter.current().route.name === 'editProject' ? false : true,
    project: () => Projects.findOne({ _id: FlowRouter.getParam('id') })
})

Template.projectForm.events({
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

    'click .add-project' (event, _tpl) {
        event.preventDefault()

        if (FlowRouter.current().route.name === 'editProject') {
            editProject.call({
    			projectId: FlowRouter.getParam('id'),
	    		headline: $('#headline').val(),
	    		description: $('#description').val(),
                github_url: $('#github_url').val(),
                website: $('#website').val() || ''
	    	}, (err, _data) => {
	    		if (!err) {
	    			notify('Successfully edited.', 'success')
	        		FlowRouter.go('/projects')
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

        addProject.call({
            headline: $('#headline').val(),
            description: $('#description').val(),
            github_url: $('#github_url').val(),
            website: $('#website').val() || ''
        }, (err, data) => {
            if (!err) {
                notify('Successfully added.', 'success')
                FlowRouter.go('/projects')
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