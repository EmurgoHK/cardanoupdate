import './viewProject.html'
import '../comments/commentBody'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Projects } from '/imports/api/projects/projects'
import { Comments } from '/imports/api/comments/comments'

import { newComment } from '/imports/api/comments/methods' 
import { flagProject, proposeNewData } from '/imports/api/projects/methods'

import { notify } from '/imports/modules/notifier'

import { flagDialog } from '/imports/modules/flagDialog'

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
	author: () => Meteor.users.findOne({_id: Template.currentData().createdBy}),
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
	},
	tagName: (tag) => tag.name,
	tagUrl: (tag) => `/tags?search=${encodeURIComponent(tag.name)}`,
	commentSuccess: () => {
		return () => {
			notify('Successfully commented.', 'success');
		}
	},
})

Template.viewProject.events({
	'click .flag-project': (event, templateInstance) => {
		let project = Projects.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}

		flagDialog.call(project, flagProject, 'projectId')
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
