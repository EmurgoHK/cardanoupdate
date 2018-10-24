import './viewLearn.html'
import '../comments/commentBody'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Learn } from '/imports/api/learn/learn'
import { Comments } from '/imports/api/comments/comments'

import { newComment } from '/imports/api/comments/methods' 
import { flagLearningItem } from '/imports/api/learn/methods'

import { notify } from '/imports/modules/notifier'

import swal from 'sweetalert2'

Template.viewLearn.onCreated(function() {
	this.autorun(() => {
		this.subscribe('learn.item', FlowRouter.getParam('slug'))
		this.subscribe('users')

		let learn = Learn.findOne({
			slug: FlowRouter.getParam('slug')
		})

		if (learn) {
			this.subscribe('comments.item', learn._id)
		}
	})

	this.message = new ReactiveVar('')
})

Template.viewLearn.helpers({
  	isOwner: function() {
    	return this.createdBy === Meteor.userId()
  	},
	learn: () => Learn.findOne({
		slug: FlowRouter.getParam('slug')
	}),
	author: function() {
        return ((Meteor.users.findOne({
            _id: this.createdBy
        }) || {}).profile || {}).name || 'No name'
    },
    comments: () => {
    	let learn = Learn.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}

    	return Comments.find({
        	parentId: learn._id
    	}, {
    		sort: {
    			createdAt: -1
    		}
    	})
    },
	commentInvalidMessage: () => Template.instance().message.get(),
	commentCount: function () {
		return Comments.find({
		  	newsId: this._id
		}).count()
	},
	tagName: (tag) => tag.name || tag
})

Template.viewLearn.events({
	'click .flag-learn': (event, templateInstance) => {
		let learn = Learn.findOne({
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
				flagLearningItem.call({
					learnId: learn._id,
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
	'click .new-comment': (event, templateInstance) => {
		event.preventDefault()

		let learn = Learn.findOne({
			slug: FlowRouter.getParam('slug')
		})

		newComment.call({
			parentId: learn._id,
			text: $('#comments').val(),
			newsId: learn._id
		}, (err, data) => {
      		$('#comments').val('')
			
			if (!err) {
				notify('Successfully commented.', 'success')
				templateInstance.message.set('')
			} else {
				templateInstance.message.set(err.reason || err.message)
			}
		})
	}
})
