import './projectForm.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Projects } from '/imports/api/projects/projects'
import { notify } from '/imports/modules/notifier'

import { addProject, editProject } from '/imports/api/projects/methods'
import { ReactiveVar } from 'meteor/reactive-var';

const maxCharValue = (inputId) => {
    if (inputId === 'headline') { return 100 }
    return 500
}

Template.projectForm.onCreated(function() {
  this.SocialResources =  new ReactiveVar([]);

	if (FlowRouter.current().route.name === 'editProject') {
		this.autorun(() => {
			this.subscribe('projects.item', FlowRouter.getParam('id'))
		})
	}
})

Template.projectForm.helpers({
    add: () => FlowRouter.current().route.name === 'editProject' ? false : true,
    project: () => {
      let item = Projects.findOne({ _id: FlowRouter.getParam('id')});
      let projectResources = item&&item.SocialResources?item.SocialResources:[];
      Template.instance().SocialResources.set(projectResources); return item;
    },
    tagsAsString: (tags) => tags == undefined ? [] : tags.toString(),
    SocialResources: () =>Template.instance().SocialResources.get()
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
    'click .add-SocialResources' (event, _tpl) {
      _tpl.SocialResources.set([..._tpl.SocialResources.get(),{ResourceName:$('#ResourceName').val(),ResourceLink:$('#ResourceLink').val()}]);
      $('#ResourceName').val('')
      $('#ResourceLink').val('')
    },
    'click .remove-SocialResources' (event, _tpl) {
      let ind = event.currentTarget.dataset.index;
      _tpl.SocialResources.get().splice(ind,1);
      _tpl.SocialResources.set(_tpl.SocialResources.get());
    },
    'click .add-project' (event, _tpl) {
        event.preventDefault()
        let tags = $('#tagInput').val().split(',')
        if (FlowRouter.current().route.name === 'editProject') {
            editProject.call({
    			projectId: FlowRouter.getParam('id'),
	    		headline: $('#headline').val(),
	    		description: $('#description').val(),
                github_url: $('#github_url').val() || '',
                website: $('#website').val() || '',
                tags: tags,
                SocialResources:_tpl.SocialResources.get()
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
            github_url: $('#github_url').val() || '',
            website: $('#website').val() || '',
            tags: tags,
            SocialResources:_tpl.SocialResources.get()
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
