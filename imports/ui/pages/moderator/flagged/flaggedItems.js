import './flaggedItems.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { News } from '/imports/api/news/news'
import { Comments } from '/imports/api/comments/comments'
import { notify } from '/imports/modules/notifier'

import { resolveNewsFlags } from '/imports/api/news/methods'
import { resolveCommentFlags } from '/imports/api/comments/methods'

import swal from 'sweetalert2'

Template.flaggedItems.onCreated(function() {
	this.autorun(() => {
		this.subscribe('comments.flagged')
		this.subscribe('news')
		this.subscribe('users')
	})
})

Template.flaggedItems.helpers({
	flaggedItems: () => {
		let comments = Comments.find({
			'flags.0': {
				$exists: true
			}
		}).fetch()

		let news = News.find({
			'flags.0': {
				$exists: true
			}
		}).fetch()

		return _.union(comments, news).map(i => ({
			_id: i._id,
			link: i.slug ? `/news/${i.slug}` : `/news/${(News.findOne({_id: i.parentId}) || {}).slug}`,
			text: i.headline ? i.headline : i.text,
			reasons: i.flags.map(j => ({
				reason: j.reason,
				author: (Meteor.users.findOne({
					_id: j.flaggedBy
				}) || {}).username
			})),
			times: `${i.flags.length} ${i.flags.length === 1 ? 'time' : 'times'}`,
			isNews: !!i.slug
		}))
	}
})

Template.flaggedItems.events({
	'click #js-ignore': function(event, templateInstance) {
		event.preventDefault()

		if (this.isNews) {
			resolveNewsFlags.call({
				newsId: this._id,
				decision: 'ignore'
			}, (err, data) => {
				if (err) {
					notify(err.reason || err.message, 'error')
				} else {
					notify('Successfully ignored.', 'success')
				}
			})
		} else {
			resolveCommentFlags.call({
				commentId: this._id,
				decision: 'ignore'
			}, (err, data) => {
				if (err) {
					notify(err.reason || err.message, 'error')
				} else {
					notify('Successfully ignored.', 'success')
				}
			})
		}
	},
	'click #js-remove': function(event, templateInstance) {
		event.preventDefault()

		if (this.isNews) {
			resolveNewsFlags.call({
				newsId: this._id,
				decision: 'remove'
			}, (err, data) => {
				if (err) {
					notify(err.reason || err.message, 'error')
				} else {
					notify('Successfully removed.', 'success')
				}
			})
		} else {
			resolveCommentFlags.call({
				commentId: this._id,
				decision: 'remove'
			}, (err, data) => {
				if (err) {
					notify(err.reason || err.message, 'error')
				} else {
					notify('Successfully removed.', 'success')
				}
			})
		}
	}
})