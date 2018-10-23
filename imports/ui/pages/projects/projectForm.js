import './projectForm.html'
import './projects.scss'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Projects } from '/imports/api/projects/projects'
import { notify } from '/imports/modules/notifier'

import { Tags } from '/imports/api/tags/tags'

import { addProject, editProject } from '/imports/api/projects/methods'
import { hideInstructionModal } from '/imports/api/user/methods'
import _ from 'lodash'

const maxCharValue = (inputId) => {
    if (inputId === 'headline') { return 25 }

    return 500
}

Template.projectForm.onCreated(function() {
	this.newsTags = new ReactiveVar([]);

	if (FlowRouter.current().route.name === 'editProject') {
		this.autorun(() => {
			this.subscribe('projects.item', FlowRouter.getParam('id'))

            let project = Projects.findOne({
                _id: FlowRouter.getParam('id')
            })

            // preselect the correct type if it's on the project edit page
            if (project) {
                $('[name=type]').val([(project.tags.filter(i => /built-(on|for)-cardano/i.test(i.name))[0] || {}).name])
            }
		})
	} else {
    let user = Meteor.users.findOne({_id : Meteor.userId()})
    // check if user is already hidden modal for instruction
    if(user && _.includes(user.hidden, 'addProject')) {
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

Template.projectForm.helpers({
    add: () => FlowRouter.current().route.name === 'editProject' ? false : true,
    project: () => Projects.findOne({ _id: FlowRouter.getParam('id') }),
    tags: () =>  Tags.find({
        name: {
            $not: new RegExp('built-(for|on)-cardano', 'i') // dont include these tags
        }
    }),
    tagsAsString: (tags) => tags == undefined || (tags !=undefined && tags.length > 0 && tags[0].id == undefined) ? [] : tags.filter(i => !/built-(for|on)-cardano/i.test(i.name)).map(t => { return t.name.toString().toUpperCase() }),
    tagDisabled: (name, tags) => {

      if (tags != undefined) { // this will only be true for edit mode
          let tag = tags.find(t => { return name == t.name ? t : undefined });
          let newsTags = Template.instance().newsTags.get();

          if (tag != undefined) { // check if the tag exists in the top 10 tags

              if (newsTags.find(t => { return tag.id == t.id }) == undefined) { // check if the tag has already been added to newsTags

                  newsTags.push({
                      id: tag.id,
                      name: tag.name
                 })

                 Template.instance().newsTags.set(newsTags)
              }

              return 'disabled'
          }
          return ''
      }

      return ''
    }
})

Template.projectForm.events({
    'click input[name="type"]': (event, templateInstance) => {
        // show the explanation for two possible choices
        $('.typeExp').show()
    },
  // Hide Instruction Modal
  'click .foreverHideModal' (event) {
    event.preventDefault()
    $('#projectInstruction').modal('hide')
    hideInstructionModal.call({modalId : 'addProject'}, (err, res) => {
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

		newsTags.push({
			id: event.currentTarget.id,
			name: name.toUpperCase()
		})
		templateInstance.newsTags.set(newsTags)
	},
	'keyup #tagInput': function(event, templateInstance){
		let inputs = $(event.currentTarget).val().split(',')
		let topTags = $('.tag-name').toArray().map(t => t.innerHTML)
		let topIds = $('.tag-name').toArray().map(t => t.parentElement.id)

		$('.tag-button').attr('disabled', false);

		let newsTags = [];
		inputs.forEach(input => {
			// Add the tag to the object
			input = input.trim();
			if (topTags.includes(input.toUpperCase())) {
				let addedTag = {
					id: topIds[topTags.indexOf(input.toUpperCase())],
					name: input.toUpperCase()
				}
				$(`#${addedTag.id}`).attr('disabled', true);
				newsTags.push(addedTag)
			}
		})

		templateInstance.newsTags.set(newsTags)
	},
    'click .add-project' (event, _tpl) {
        event.preventDefault()

        let tags = $('#tagInput').val().split(',').map(e => e.trim()).filter(i => !!i)
		let newsTags = _tpl.newsTags.get();

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

        if (FlowRouter.current().route.name === 'editProject') {
            editProject.call({
    			projectId: FlowRouter.getParam('id'),
	    		headline: $('#headline').val(),
	    		description: $('#description').val(),
                github_url: $('#github_url').val() || '',
                website: $('#website').val() || '',
                tags: tags,
                type: $('input[name="type"]:checked').val()
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
            type: $('input[name="type"]:checked').val()
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
