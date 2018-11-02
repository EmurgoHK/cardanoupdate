import './researchForm.html'
import './researchForm.scss';

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
	this.links = new ReactiveVar([]);
	if (FlowRouter.current().route.name === 'editResearch') {
		this.autorun(() => {
			this.subscribe('research.item', FlowRouter.getParam('slug'), () => {
				const research = Research.findOne({slug: FlowRouter.getParam('slug')});

				if (research && research.links) {
					this.links.set(research.links.concat(this.links.get()));
				}
			})
		});
	}
});

Template.researchForm.helpers({
	links: () => Template.instance().links.get(),
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
	'keyup #abstract, keyup #headline': (event, templateInstance) => {
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
        // Remove validation error, if exists
        $(`#${inputId}`).removeClass('is-invalid')
        $(`#${inputId}`).unbind('keypress')
    },
    'click .new-research': function(event, templateInstance) {
		event.preventDefault()

    	if (FlowRouter.current().route.name === 'newResearch') {
	    	newResearch.call({
	    		headline: $('#headline').val(),
	    		abstract: $('#abstract').val(),
					pdf: getFiles()[0],
					links: templateInstance.links.get(),
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
					pdf: getFiles()[0],
					links: templateInstance.links.get(),
	    	}, (err, data) => {
	    		if (!err) {
	    			notify('Successfully edited.', 'success')

	        		FlowRouter.go('/research')

	        		return
	      		}

		      	if (err.details && err.details.length >= 1) {
		        	err.details.forEach(e => {
									console.log(e);
		          		$(`#${e.name.replace(/\./g, '_')}`).addClass('is-invalid')
		          		$(`#${e.name.replace(/\./g, '_')}Error`).show()
		          		$(`#${e.name.replace(/\./g, '_')}Error`).text(e.message)
		        	})
		      	}
	    	})
    	}
		},

	'keyup .form-control.linkUrl': function(event, templateInstance) {
		const links = templateInstance.links.get();
		const index = Number.parseInt(event.currentTarget.dataset["index"]);
		links[index].url = event.currentTarget.value;
		templateInstance.links.set(links);
	},
	'keyup .form-control.linkDisplayName': function(event, templateInstance) {
		const links = templateInstance.links.get();
		const index = Number.parseInt(event.currentTarget.dataset["index"]);
		links[index].displayName = event.currentTarget.value;
		templateInstance.links.set(links);
	},
	'click #add-link': function(event, templateInstance) {
		event.preventDefault()

		const links = templateInstance.links.get();
		links.push({url: '', displayName: ''});
		templateInstance.links.set(links);
	},
	'click .remove-link': function(event, templateInstance) {
		event.preventDefault()
		
		const links = templateInstance.links.get();
		const index = Number.parseInt(event.currentTarget.dataset["index"]);
		links.splice(index, 1);
		templateInstance.links.set(links);
	}
})
