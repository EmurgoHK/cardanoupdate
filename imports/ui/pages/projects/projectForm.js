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

import 'select2'

const maxCharValue = (inputId) => {
  if (inputId === 'headline') { return 90 }
}

Template.projectForm.onCreated(function() {
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

Template.projectForm.onRendered(function() {
    this.autorun(() => {
        let tags = (Projects.findOne({
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

Template.projectForm.helpers({
    add: () => FlowRouter.current().route.name === 'editProject' ? false : true,
    project: () => Projects.findOne({ _id: FlowRouter.getParam('id') }),
    tags: () => { 

        let tags = Array.from(Tags.find({
            name: {
                $not: new RegExp('built-(for|on)-cardano', 'i') // dont include these tags
            }
        }))

        tags = _.uniqBy(tags, 'name');
        return tags
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
    'click .add-project' (event, _tpl) {
        event.preventDefault()

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
		const tagsToSave = []
		const addedTagNames = new Set()

		for (const tag of tags) {
			if (!addedTagNames.has(tag.name)) {
				addedTagNames.add(tag.name)

				tagsToSave.push(tag)
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
