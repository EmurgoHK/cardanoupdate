import './viewResearch.html'
import '../comments/commentBody'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Research } from '/imports/api/research/research'
import { Comments } from '/imports/api/comments/comments'

import { newComment } from '/imports/api/comments/methods' 
import { flagResarch } from '/imports/api/research/methods'

import { notify } from '/imports/modules/notifier'

import swal from 'sweetalert2'

Template.viewResearch.onCreated(function() {
	this.autorun(() => {
		this.subscribe('research.item', FlowRouter.getParam('slug'))
		this.subscribe('users')

		let research = Research.findOne({
			slug: FlowRouter.getParam('slug')
		})

		if (research) {
			this.subscribe('comments.item', research._id)
		}
	})

	this.message = new ReactiveVar('')
})

Template.viewResearch.helpers({
  	isOwner: function() {
    	return this.createdBy === Meteor.userId()
  	},
	research: () => Research.findOne({
		slug: FlowRouter.getParam('slug')
	}),
	author: function() {
        return ((Meteor.users.findOne({
            _id: this.createdBy
        }) || {}).profile || {}).name || 'No name'
    },
    comments: () => {
    	let research = Research.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}

    	return Comments.find({
        	parentId: research._id
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
	}
})

Template.viewResearch.events({
	'click .flag-research': (event, templateInstance) => {
		let research = Research.findOne({
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
				flagResarch.call({
					researchId: research._id,
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

		let research = Research.findOne({
			slug: FlowRouter.getParam('slug')
		})

		newComment.call({
			parentId: research._id,
			text: $('#comments').val(),
			newsId: research._id
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
