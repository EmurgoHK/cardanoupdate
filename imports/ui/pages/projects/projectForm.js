import './projectForm.html'
import './projects.scss'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Projects } from '/imports/api/projects/projects'
import { notify } from '/imports/modules/notifier'

import { Tags } from '/imports/api/tags/tags'

import { addProject, editProject, resolveProjectDataUpdate } from '/imports/api/projects/methods'
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
        this.autorun(() => {
            this.subscribe('users')

            let user = Meteor.users.findOne({_id : Meteor.userId()})

            console.log(user)
            // check if user is already hidden modal for instruction
            if(user && _.includes(user.hidden, 'addProject')) {
                Meteor.setTimeout(() => {
                    $('#projectInstruction').modal('hide')
                }, 100)
            } else if(user !== undefined) {
                Meteor.setTimeout(() => {
                    $('#projectInstruction').modal('show')
                }, 100)
            }
        })
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
	},
    changedItems: () => {
        let projects = Projects.find({
            'edits.status': 'open',
            _id: FlowRouter.getParam('id')
        }).fetch()

        return _.flatten(projects.map(i => i.edits.map(j => ({
            status: j.status,
            slug: i.slug,
            _id: i._id,
            editId: j._id,
            headline: i.headline,
            datapoint: j.datapoint,
            newData: j.newData,
            author: ((Meteor.users.findOne({
                _id: j.proposedBy
            }) || {}).profile || {}).name || 'No name',
            type: j.type || 'string',
            link: j.type === 'link',
            createdAt: j.createdAt
        })).filter(i => i.status === 'open')))
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

		// Deduplicating tags by name
		const tagsToSave = [];
		const addedTagNames = new Set();
		for (const tag of tags) {
			if (!addedTagNames.has(tag.name)) {
				addedTagNames.add(tag.name);
				tagsToSave.push(tag);
			}
		}

        if (FlowRouter.current().route.name === 'editProject') {
            editProject.call({
    			projectId: FlowRouter.getParam('id'),
	    		headline: $('#headline').val(),
	    		description: $('#description').val(),
                github_url: $('#github_url').val() || '',
                website: $('#website').val() || '',
                tags: tagsToSave,
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
            tags: tagsToSave,
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
    },
    'click #js-merge': function(event, templateInstance) {
        event.preventDefault()

        resolveProjectDataUpdate.call({
            projectId: this._id,
            editId: this.editId,
            decision: 'merge'
        }, (err, data) => {
            if (err) {
                notify(err.reason || err.message, 'error')
            } else {
                notify('Successfully merged.', 'success')
            }
        })
    },
    'click #js-reject': function(event, templateInstance) {
        event.preventDefault()

        resolveProjectDataUpdate.call({
            projectId: this._id,
            editId: this.editId,
            decision: 'reject'
        }, (err, data) => {
            if (err) {
                notify(err.reason || err.message, 'error')
            } else {
                notify('Successfully rejected.', 'success')
            }
        })
    }
})
