import './socialResourceForm.html'
import { Template } from 'meteor/templating'
import { addSocialResource, editSocialResource } from '/imports/api/socialResources/methods'
import { notify } from '/imports/modules/notifier'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { socialResources } from '/imports/api/socialResources/socialResources'
import { Tags } from '../../../api/tags/tags';

const maxCharValue = (inputId) => {
    if (inputId === 'Name') { return 25 }

    return 500
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

          if (tag != undefined) { // check if the tag exists in the top 10 tags
              if (newsTags.find(t => { return tag.id === t.id }) == undefined) { // check if the tag has already been added to newsTags
                  newsTags.push({
                      id: tag.id,
                      name: tag.name
                 });

                 Template.instance().newsTags.set(newsTags);
              }

              return 'disabled';
          }
          return '';
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

		newsTags.push({
			id: event.currentTarget.id,
			name: name.toUpperCase()
		})
		templateInstance.newsTags.set(newsTags)
	},

	'keyup #tagInput': function(event, templateInstance){
		let inputs = $(event.currentTarget).val().split(',');
		let topTags = $('.tag-name').toArray().map(t => t.innerHTML);
		let topIds = $('.tag-name').toArray().map(t => t.parentElement.id);

		$('.tag-button').attr('disabled', false);

		let newsTags = [];
		inputs.forEach(input => {
			// Add the tag to the object
			input = input.trim();
			if (topTags.includes(input.toUpperCase())) {
				let addedTag = {
					id: topIds[topTags.indexOf(input.toUpperCase())],
					name: input.toUpperCase(),
				};
				$(`#${addedTag.id}`).attr('disabled', true);
				newsTags.push(addedTag);
			}
		});

		templateInstance.newsTags.set(newsTags);
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
        })

        if (FlowRouter.current().route.name === 'editSocialResource') {
            editSocialResource.call({
    			projectId: FlowRouter.getParam('id'),
	    		Name: $('#Name').val(),
                Resource_url: $('#Resource_url').val() || '',
                description: $('#description').val(),
                tags: tags,
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
            tags,
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
