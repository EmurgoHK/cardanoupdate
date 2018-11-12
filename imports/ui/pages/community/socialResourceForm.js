import './socialResourceForm.html'
import { Template } from 'meteor/templating'
import { addSocialResource, editSocialResource } from '/imports/api/socialResources/methods'
import { notify } from '/imports/modules/notifier'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { socialResources } from '/imports/api/socialResources/socialResources'
import { Tags } from '../../../api/tags/tags';

import _ from 'lodash'

const maxCharValue = (inputId) => {
    if (inputId === 'Name') { return 90 }

    return 260
}

Template.socialResourceFormTemp.onCreated(function() {
	if (FlowRouter.current().route.name === 'editSocialResource') {
		this.autorun(() => {
			this.subscribe('socialResources.item', FlowRouter.getParam('id'))
		})
    }
    
	this.autorun(() => {
		this.subscribe('tags')
	});
})

Template.socialResourceFormTemp.onRendered(function() {
    this.autorun(() => {
        let tags = (socialResources.findOne({
            _id: FlowRouter.getParam('id')
        }) || {}).tags || []

        $('#tags').val(tags.map(i => i.name))
        $('#tags').trigger('change')
    })

    $('#tags').select2({
        tags: true,
        tokenSeparators: [' ', ','],
        allowClear: true,
        placeholder: 'Add a tags separated by comma(,) e.g. crypto,wallet'
    })
})


Template.socialResourceFormTemp.helpers({
    add: () => FlowRouter.current().route.name === 'editSocialResource' ? false : true,
    Resource: () => {return socialResources.findOne({ _id: FlowRouter.getParam('id') })},
    tags: () => { 

        let tags = Array.from(Tags.find({
            name: {
                $not: new RegExp('built-(for|on)-cardano', 'i') // dont include these tags
            }
        }))

        tags = _.uniqBy(tags, 'name');
        return tags
    }
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
        // Remove validation error, if exists
        $(`#${inputId}`).removeClass('is-invalid')
        $(`#${inputId}`).unbind('keypress')
    },
    'click .add-socialResource' (event, templateInstance) {
        event.preventDefault()
        
        var captchaData = grecaptcha.getResponse();

		let tags = $('#tags').val()

		// convert all tags to array of objects
		tags = tags.map(t => {
			let element = Tags.findOne({
                name: t.trim().toUpperCase()
            })

 			// add the element to the array if it not present
			if (!element) {
				return {
                    id: '',
                    name: t.trim().toUpperCase()
                }
			}

			return {
                id: element._id,
                name: element.name
            }
        })

		// Deduplicating tags by name
		const tagsToSave = [];
		const addedTagNames = new Set();
		for (const tag of tags) {
			if (!addedTagNames.has(tag.name)) {
				addedTagNames.add(tag.name);
				tagsToSave.push(tag);
			}
		}

        if (FlowRouter.current().route.name === 'editSocialResource') {
            editSocialResource.call({
    			projectId: FlowRouter.getParam('id'),
	    		Name: $('#Name').val(),
                Resource_url: $('#Resource_url').val() || '',
                description: $('#description').val(),
                captcha: captchaData,
                tags: tagsToSave,
	    	}, (err, _data) => {
	    		if (!err) {
	    			notify('Successfully edited.', 'success')
	        		FlowRouter.go('/community')
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
            captcha: captchaData,
            tags: tagsToSave,
        }, (err, data) => {
            if (!err) {
                notify('Successfully added.', 'success')
                FlowRouter.go('/community')
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
