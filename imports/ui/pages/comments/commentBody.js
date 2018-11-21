import './commentBody.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Comments } from '/imports/api/comments/comments'

import { newComment, editComment, removeComment, flagComment } from '/imports/api/comments/methods'

import { notify } from '/imports/modules/notifier'

import swal from 'sweetalert2'

Template.commentBody.onCreated(function() {
	this.edits = new ReactiveDict()
	this.replies = new ReactiveDict()

	this.message = new ReactiveVar('')

	this.showReplies = new ReactiveVar(false);
})

Template.commentBody.helpers({
	origId: () => Template.instance().data._id,
	type: () => Template.instance().data.type,
	user: () => Meteor.users.findOne({ _id: Template.currentData().createdBy}),
    canEditComment: function() {
    	return this.createdBy === Meteor.userId()
    },
    editMode: function() {
    	return Template.instance().edits.get(this._id)
    },
    replyMode: function() {
    	return Template.instance().replies.get(this._id)
    },
	commentInvalidMessage: () => Template.instance().message.get(),
	newIdent: () => Template.instance().data.ident + 10,
	formIdent: () => Template.instance().data.ident - 5,
	ident: () => Template.instance().data.ident,
	childComments: function() {
		return Comments.find({
			parentId: this._id
		}, {
			sort: {
				createdAt: -1
			}
		})
	},
	childCommentCount: function() {
		return Comments.find({
			parentId: this._id
		}, {
			sort: {
				createdAt: -1
			}
		}).count();
	},
	showReplies: () => Template.instance().showReplies.get(),
	replySuccess: () => {
		const templateInstance = Template.instance();
		const data = Template.currentData();
		return () => {
			notify(TAPi18n.__('comments.success'), 'success');
			templateInstance.showReplies.set(true);
			templateInstance.replies.set(data._id, false);
		}
	},
	replyCancel: () => {
		const templateInstance = Template.instance();
		const data = Template.currentData();
		return () => {
			templateInstance.replies.set(data._id, false);
		}
	},
	editSuccess: () => {
		const templateInstance = Template.instance();
		const data = Template.currentData();
		
		return () => {
			notify(TAPi18n.__('comments.success_edit'), 'success');
			templateInstance.edits.set(data._id, false);
		}
	},
	editCancel: () => {
		const templateInstance = Template.instance();
		const data = Template.currentData();
		
		return () => templateInstance.edits.set(data._id, false);
	},
})

Template.commentBody.events({
	'click .flag-comment': function(event, templateInstance) {
		event.preventDefault()
		event.stopImmediatePropagation()

		swal({
		  	title: TAPi18n.__('comments.flag_reason'),
		  	input: 'text',
		  	showCancelButton: true,
		  	inputValidator: (value) => {
		    	return !value && TAPi18n.__('comments.invalid_reason')
		  	}
		}).then(data => {
			if (data.value) {
				flagComment.call({
					commentId: this._id,
					reason: data.value
				}, (err, data) => {
					if (err) {
						notify(err.reason || err.message, 'error')
					} else {
						notify(TAPi18n.__('comments.success_flag'), 'success')
					}
				})
			}
		})
	},
	'click .reply': function(event, templateInstance) {
		event.preventDefault()
		event.stopImmediatePropagation()

		templateInstance.replies.set(this._id, true)
	},
	'click .edit-mode': function(event, templateInstance) {
		event.preventDefault()
		event.stopImmediatePropagation()

		templateInstance.edits.set(this._id, true)
	},
	'click .delete-comment': function(event, templateInstance) {
		event.preventDefault()
		event.stopImmediatePropagation()

		swal({
            text: TAPi18n.__('comments.remove_question'),
            type: 'warning',
            showCancelButton: true
        }).then(confirmed => {
            if (confirmed.value) {
                removeComment.call({
                    commentId: this._id
                }, (err, data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                    }
                })
            }
        })
	},
	'click .showReplies': (event, templateInstance) => {
		event.preventDefault();

		// Check if the button was clicked for this comment and not in a child
		if (templateInstance.data.comment._id === event.target.getAttribute('data-id'))
			templateInstance.showReplies.set(true);
	},
	'click .hideReplies': (event, templateInstance) => {
		event.preventDefault();

		// Check if the button was clicked for this comment and not in a child
		if (templateInstance.data.comment._id === event.target.getAttribute('data-id'))
			templateInstance.showReplies.set(false);
	},
})
