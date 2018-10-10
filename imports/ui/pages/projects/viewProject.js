import './viewProject.html'
import '../comments/commentBody'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Projects } from '/imports/api/projects/projects'
import { Comments } from '/imports/api/comments/comments'

import { newComment } from '/imports/api/comments/methods' 
import { flagProject } from '/imports/api/projects/methods'

import { notify } from '/imports/modules/notifier'

import swal from 'sweetalert2'

Template.viewProject.onCreated(function() {
	this.autorun(() => {
		this.subscribe('projects.item', FlowRouter.getParam('slug'))
		this.subscribe('users')

		let project = Projects.findOne({
			slug: FlowRouter.getParam('slug')
		})

		if (project) {
			this.subscribe('comments.item', project._id)
		}
	})

	this.coolMessage = new ReactiveVar('')
	this.flagMessage = new ReactiveVar('')
})

Template.viewProject.helpers({
  isOwner : function() {
    if(this.createdBy === Meteor.userId()){
      return true
    }
    return false
  },
	project: () => Projects.findOne({
		slug: FlowRouter.getParam('slug')
	}),
	author: function() {
        return ((Meteor.users.findOne({
            _id: this.createdBy
        }) || {}).profile || {}).name || 'No name'
    },
    coolStuff: () => {
    	let project = Projects.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}

    	return Comments.find({
        	parentId: project._id,
        	type: 'coolstuff'
    	}, {
    		sort: {
    			createdAt: -1
    		}
    	})
    },
    redFlags: () => {
    	let project = Projects.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}

    	return Comments.find({
        	parentId: project._id,
        	type: 'redflag'
    	}, {
    		sort: {
    			createdAt: -1
    		}
    	})
    },
	coolInvalidMessage: () => Template.instance().coolMessage.get(),
	flagInvalidMessage: () => Template.instance().flagMessage.get(),
	coolCount: function () {
		return Comments.find({
		  	newsId: this._id,
		  	type: 'coolstuff'
		}).count()
	},
	flagCount: function () {
		return Comments.find({
		  	newsId: this._id,
		  	type: 'redflag'
		}).count()
	}
})

Template.viewProject.events({
	'click .flag-project': (event, templateInstance) => {
		let project = Projects.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}

		swal({
		  	title: 'Why are you flagging this?',
		  	input: 'text',
		  	showCancelButton: true,
		  	inputValidator: (value) => {
		    	return !value && 'You need to write a valid reason!'
		  	}
		}).then(data => {
			if (data.value) {
				flagProject.call({
					projectId: project._id,
					reason: data.value
				}, (err, data) => {
					if (err) {
						notify(err.reason || err.message, 'error')
					} else {
						notify('Successfully flagged. Moderators will decide what to do next.', 'success')
					}
				})
			}
		})
	},
	'click .new-cool, click .new-flag': (event, templateInstance) => {
		event.preventDefault()
		let project = Projects.findOne({
			slug: FlowRouter.getParam('slug')
		})

		let cool = $(event.currentTarget).attr('class').includes('cool')

		newComment.call({
			parentId: project._id,
			text: $(`#${cool ? 'cool' : 'flag'}-comment`).val(),
			newsId: project._id,
			type: cool ? 'coolstuff' : 'redflag'
		}, (err, data) => {
      		$(`#${cool ? 'cool' : 'flag'}-comment`).val('')

			if (!err) {
				notify('Successfully commented.', 'success')
				templateInstance[`${cool ? 'cool' : 'flag'}Message`].set('')
			} else {
				templateInstance[`${cool ? 'cool' : 'flag'}Message`].set(err.reason || err.message)
			}
		})
	},
	'click .github': function(event, temlateInstance) {
        if ($(event.currentTarget).attr('href')) {
            return
        }

        swal({
            text: `GitHub repo is not available. If you know this information, please contribute below:`,
            type: 'warning',
            showCancelButton: true,
            input: 'text'
        }).then(val => {
            if (val.value) {
                proposeNewData.call({
                    projectId: this._id,
                    datapoint: 'github_url',
                    newData: val.value,
                    type: 'link'
                }, (err, data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                    } else {
                        notify('Successfully contributed.', 'success')
                    }
                })
            }
        })
    },
    'click .website': function(event, temlateInstance) {
        if ($(event.currentTarget).attr('href')) {
            return
        }

        swal({
            text: `Website is not available. If you know this information, please contribute below:`,
            type: 'warning',
            showCancelButton: true,
            input: 'text'
        }).then(val => {
            if (val.value) {
                proposeNewData.call({
                    projectId: this._id,
                    datapoint: 'website',
                    newData: val.value,
                    type: 'link'
                }, (err, data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                    } else {
                        notify('Successfully contributed.', 'success')
                    }
                })
            }
        })
    },
    'click .projectWarning' (event, _tpl) {
        event.preventDefault()
        console.log('here')
        swal({
            title: 'Missing source repository',
            text: "This project does't contain any link to the source repository",
            type: 'warning',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Okay'
        })
    }
})
