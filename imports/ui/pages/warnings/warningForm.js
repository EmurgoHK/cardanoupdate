import './warningForm.html'
import './warnings.scss'
 import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
 import { Warnings } from '/imports/api/warnings/warnings'
import { notify } from '/imports/modules/notifier'
 import { Tags } from '/imports/api/tags/tags'
 import { addWarning, editWarning } from '/imports/api/warnings/methods'
import { hideInstructionModal } from '/imports/api/user/methods'
import _ from 'lodash'
 const maxCharValue = (inputId) => {
    if (inputId === 'headline') { return 90 } 
     return 260
}
 Template.warningForm.onCreated(function() {
	this.newsTags = new ReactiveVar([]);
    
	if (FlowRouter.current().route.name === 'editWarning') {
		this.autorun(() => {
			this.subscribe('warnings.item', FlowRouter.getParam('id'))
             let warning = Warnings.findOne({
                _id: FlowRouter.getParam('id')
            })
             // preselect the correct type if it's on the warning edit page
            if (warning) {
                $('[name=type]').val([(warning.tags.filter(i => /built-(on|for)-cardano/i.test(i.name))[0] || {}).name])
            }
		})
	} else {
    let user = Meteor.users.findOne({_id : Meteor.userId()})
    // check if user is already hidden modal for instruction
    if(user && _.includes(user.hidden, 'addWarning')) {
      Meteor.setTimeout(() => {
        $('#projectInstruction').modal('hide')
      }, 100)
    } else {
      Meteor.setTimeout(() => {
        $('#projectInstruction').modal('show')
      }, 100)
    }
  }
  this.subscribe('tags')
  
})
 Template.warningForm.helpers({
    add: () => FlowRouter.current().route.name === 'editWarning' ? false : true,
    warning: () => Warnings.findOne({ _id: FlowRouter.getParam('id') }),
    tags: () =>  Tags.find({
        name: {
            $not: new RegExp('built-(for|on)-cardano', 'i') // dont include these tags 
        }
    }),
    tagsAsString: (tags) => tags == undefined || (tags !=undefined && tags.length > 0 && tags[0].id == undefined) ? [] : tags.filter(i => !/built-(for|on)-cardano/i.test(i.name)).map(t => { return t.name.toString().toUpperCase() }),
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
 Template.warningForm.events({
    'click input[name="type"]': (event, templateInstance) => {
        // show the explanation for two possible choices
        $('.typeExp').show()
    },
  // Hide Instruction Modal
  'click .foreverHideModal' (event) {
    event.preventDefault()
    $('#projectInstruction').modal('hide')
    hideInstructionModal.call({modalId : 'addWarning'}, (err, res) => {
      if (!err) {
      notify('Successfully updated.', 'success')
        return
      } 
      notify('Error while updating information :: '+err.reason, 'error')
    })
  },
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
		
        if (newsTags.every(a => a.id !== event.currentTarget.id)) { // check if the tag has already been added to newsTags
            newsTags.push({
                id: event.currentTarget.id,
                name: name.toUpperCase()
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

		templateInstance.newsTags.set(newsTags);
	},
    'click .add-warning' (event, _tpl) {
        event.preventDefault()
         let tags = $('#tagInput').val().split(',').map(e => e.trim()).filter(i => !!i)
		let newsTags = _tpl.newsTags.get();
        
        console.log('here')
		// convert all tags to array of objects
		tags = tags.map(t => {
			let element = undefined
			
			if (newsTags.length > 0) element = newsTags.find(n => n.name === t.toUpperCase())
 			// add the element to the array if it not present
			if (element === undefined) {
				return { id: '', name: t.trim().toUpperCase()}
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
        
        if (FlowRouter.current().route.name === 'editWarning') {
            editWarning.call({
    			projectId: FlowRouter.getParam('id'),
	    		headline: $('#headline').val(),
	    		summary: $('#description').val(),
                github_url: $('#github_url').val() || '',
                website: $('#website').val() || '',
                tags: tagsToSave,
                type: $('input[name="type"]:checked').val()
	    	}, (err, _data) => {
	    		if (!err) {
	    			notify('Successfully edited.', 'success')
	        		FlowRouter.go('/warnings')
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
         addWarning.call({
            headline: $('#headline').val(),
            summary: $('#description').val(),
            github_url: $('#github_url').val() || '',
            website: $('#website').val() || '',
            tags: tagsToSave,
            type: $('input[name="type"]:checked').val()
        }, (err, data) => {
            if (!err) {
                notify('Successfully added.', 'success')
                FlowRouter.go('/warnings')
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
                    e.message = e.message.split(' ')[0] == 'Summary' ? `Description is required` : e.message;
                    $(`#${e.name}Error`).text(e.message)
                })
            }
        })
    }
}) 