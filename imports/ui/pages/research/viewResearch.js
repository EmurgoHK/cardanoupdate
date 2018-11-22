import './viewResearch.html'
import '../comments/commentBody'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Research } from '/imports/api/research/research'
import { Comments } from '/imports/api/comments/comments'

import { newComment } from '/imports/api/comments/methods' 
import { flagResearch } from '/imports/api/research/methods'

import { notify } from '/imports/modules/notifier'
import { flagDialog } from '/imports/modules/flagDialog'

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
	author: () => Meteor.users.findOne({_id: Template.currentData().createdBy}),
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

		flagDialog.call(research, flagResearch, 'researchId')
	},
	'click .new-comment': (event, templateInstance) => {
		event.preventDefault()

		let research = Research.findOne({
			slug: FlowRouter.getParam('slug')
		})

		newComment.call({
			parentId: research._id,
			text: $('#comments').val(),
      newsId: research._id,
      postType : 'research'
		}, (err, data) => {
      		$('#comments').val('')
			
			if (!err) {
				notify(TAPi18n.__('research.view.success'), 'success')
				templateInstance.message.set('')
			} else {
				templateInstance.message.set(TAPi18n.__(err.reason || err.message))
			}
		})
	}
})
