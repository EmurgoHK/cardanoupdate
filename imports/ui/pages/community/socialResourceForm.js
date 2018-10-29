import './socialResourceForm.html'
import { Template } from 'meteor/templating'
import { addSocialResource, editSocialResource } from '/imports/api/socialResources/methods'
import { notify } from '/imports/modules/notifier'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { socialResources } from '/imports/api/socialResources/socialResources'
import { Tags } from '../../../api/tags/tags';

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
    
	this.newsTags = new ReactiveVar([]);

	this.autorun(() => {
		this.subscribe('tags')
	});
})


Template.socialResourceFormTemp.helpers({
    add: () => FlowRouter.current().route.name === 'editSocialResource' ? false : true,
    Resource: () => {return socialResources.findOne({ _id: FlowRouter.getParam('id') })},
    tags: () =>  Tags.find({}),
    tagsAsString: (tags) => tags === undefined || (tags !== undefined && tags.length > 0 && tags[0].id == undefined) ? [] : tags.map(t => t.name.toString().toUpperCase()),
    tagDisabled: (name, tags) => {
		if (tags !== undefined) { // this will only be true for edit mode
			let tag = tags.find(t => { return name === t.name ? t : undefined });
			let newsTags = Template.instance().newsTags.get();

			if (tag !== undefined) { // check if the tag exists
                if (newsTags.some(t => { return tag.id === t.id })) { // check if the tag has already been added to newsTags
                        newsTags.push({
                            id: tag.id,
                            name: tag.name
                        });
                        Template.instance().newsTags.set(newsTags);
                }
                return 'disabled';
			}
		}

		return '';
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

        $(`#${inputId}`).unbind('keypress')
    },

    'click .tag-button': (event, templateInstance) => {
		let name = ($(event.currentTarget).find('.tag-name')[0]).innerHTML;
		let tagString = $('#tagInput').val()

		tagString = (tagString === undefined || tagString === '') ? name : `${tagString},${name}`;
        
		$('#tagInput').val(tagString)
		$(event.currentTarget).attr('disabled', true);

		let newsTags = templateInstance.newsTags.get();
        if (newsTags.every(a => a.id !== event.currentTarget.id)) {
            newsTags.push({
                id: event.currentTarget.id,
                name: name.toUpperCase(),
            });
            templateInstance.newsTags.set(newsTags);
        }
	},

	'keyup #tagInput': function(event, templateInstance){
		let inputs = templateInstance.$(event.currentTarget).val().split(',').map(a => a.trim().toUpperCase());

		let topTags = templateInstance.$('.tag-name').toArray().map(t => t.innerHTML)
		let topIds = templateInstance.$('.tag-name').toArray().map(t => t.parentElement.id)

		let newsTags = [];
		inputs.forEach(input => {
			// Add the tag to the object
			if (topTags.includes(input)) {
				if (!newsTags.some(a => a.name === input)) {
					newsTags.push({
						id: topIds[topTags.indexOf(input)],
						name: input,
					});
				}
			}
		});
		
		topTags.forEach((tagName, ind) => { // We disable tag buttons that are included in the inputs, enable all others
			$(`#${topIds[ind]}`).attr('disabled', inputs.includes(tagName));
		});

		templateInstance.newsTags.set(newsTags)
	},

    'click .add-socialResource' (event, templateInstance) {
        event.preventDefault()
        

		let tags = $('#tagInput').val().split(',').map(e => e.trim()).filter(i => !!i)
		let newsTags = templateInstance.newsTags.get()

		// convert all tags to array of objects
		tags = tags.map(t => {
			let element = undefined

			if (newsTags.length > 0) element = newsTags.find(n => n.name === t.toUpperCase())
 			// add the element to the array if it not present
			if (element === undefined) {
				return { name: t.trim().toUpperCase()}
			}

			return element
        });

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
            tagsToSave,
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
