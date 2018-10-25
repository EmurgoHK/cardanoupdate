import './flaggedItems.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { News } from '/imports/api/news/news'
import { Comments } from '/imports/api/comments/comments'
import { Projects } from '/imports/api/projects/projects'
import { Warnings } from '/imports/api/warnings/warnings'
import { Events } from '/imports/api/events/events'
import { Research } from '/imports/api/research/research'
import { Learn } from '/imports/api/learn/learn'
import { notify } from '/imports/modules/notifier'

import { resolveWarningFlags } from '/imports/api/warnings/methods'
import { resolveNewsFlags } from '/imports/api/news/methods'
import { resolveCommentFlags } from '/imports/api/comments/methods'
import { resolveProjectFlags } from '/imports/api/projects/methods'
import { resolveEventFlags } from '/imports/api/events/methods'
import { resolveResearchFlags } from '/imports/api/research/methods'
import { resolveLearningItemFlags } from '/imports/api/learn/methods'

import swal from 'sweetalert2'

Template.flaggedItems.onCreated(function() {
	this.autorun(() => {
		this.subscribe('comments.flagged')
		this.subscribe('news')
		this.subscribe('users')
		this.subscribe('projects')
		this.subscribe('warnings')
    	this.subscribe('events')
    	this.subscribe('research')
    	this.subscribe('learn')
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

		let projects = Projects.find({
			'flags.0': {
				$exists: true
			}
		}).fetch()

		let warnings = Warnings.find({
			'flags.0': {
				$exists: true
			}
		}).fetch()

	    let events = Events.find({
	      'flags.0': {
					$exists: true
				}
	    }).fetch()

	    let research = Research.find({
			'flags.0': {
				$exists: true
			}
		}).fetch()

		let learn = Learn.find({
			'flags.0': {
				$exists: true
			}
		}).fetch()

		return _.union(research, events, comments, news, projects, learn, warnings).map(i => ({
			_id: i._id,
			link: i.content ? `/learn/${i.slug}` : (i.pdf ? `/research/${i.slug}` : (i.location ? `/events/${i.slug}` : (i.summary ? `/warnings/${i.slug}` : (i.description ? `/projects/${i.slug}` : '')))),
			text: i.title ? i.title : (i.headline ? i.headline : i.text),
			reasons: i.flags.map(j => ({
				reason: j.reason,
				author: ((Meteor.users.findOne({
					_id: j.flaggedBy
				}) || {}).profile || {}).name || 'No name'
			})),
			times: `${i.flags.length} ${i.flags.length === 1 ? 'time' : 'times'}`,
      		isEvent: !!i.location,
      		isWarning: !!i.summary,
			isProject: !!i.description,
			isResearch: !!i.pdf,
			isLearn: !!i.content
		}))
	}
})

Template.flaggedItems.events({
	'click #js-ignore': function(event, templateInstance) {
		event.preventDefault()

		swal({
			title: 'Are you sure?',
            text: `Content will be ignored and no longer marked as flagged`,
            type: 'warning',
            showCancelButton: true
        }).then(confirmed => {
            if (confirmed.value) {
            	if (this.isLearn) {
            		resolveLearningItemFlags.call({
						learnId: this._id,
						decision: 'ignore'
					}, (err, data) => {
						if (err) {
							notify(err.reason || err.message, 'error')
						} else {
							notify('Successfully ignored.', 'success')
						}
					})
                } else if (this.isEvent) {
					resolveEventFlags.call({
							  eventId: this._id,
							  decision: 'ignore'
						  }, (err, data) => {
							  if (err) {
								  notify(err.reason || err.message, 'error')
							  } else {
								  notify('Successfully ignored.', 'success')
							  }
						  })
				} else if (this.isWarning) {
					resolveWarningFlags.call({
						projectId: this._id,
						decision: 'ignore'
					}, (err, data) => {
						if (err) {
							notify(err.reason || err.message, 'error')
						} else {
							notify('Successfully ignored.', 'success')
						}
					})
				} else if (this.isProject) {
					resolveProjectFlags.call({
						projectId: this._id,
						decision: 'ignore'
					}, (err, data) => {
						if (err) {
							notify(err.reason || err.message, 'error')
						} else {
							notify('Successfully ignored.', 'success')
						}
					})
				} else if (this.isResearch) {
					resolveResearchFlags.call({
						researchId: this._id,
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
			}
		})
	},
	'click #js-remove': function(event, templateInstance) {
		event.preventDefault()
		swal({
			title: 'Are you sure?',
            text: `Deleting this Red flag will delete the flagged content. This action is not reversible.`,
            type: 'error',
            showCancelButton: true
        }).then(confirmed => {
            if (confirmed.value) {
            	if (this.isLearn) {
            		resolveLearningItemFlags.call({
						learnId: this._id,
						decision: 'remove'
					}, (err, data) => {
						if (err) {
							notify(err.reason || err.message, 'error')
						} else {
							notify('Successfully removed.', 'success')
						}
					})
                } else if (this.isEvent) {
					resolveEventFlags.call({
							  eventId: this._id,
							  decision: 'remove'
						  }, (err, data) => {
							  if (err) {
								  notify(err.reason || err.message, 'error')
							  } else {
								  notify('Successfully removed.', 'success')
							  }
						  })
				} else if (this.isWarning) {
					resolveWarningFlags.call({
						projectId: this._id,
						decision: 'remove'
					}, (err, data) => {
						if (err) {
							notify(err.reason || err.message, 'error')
						} else {
							notify('Successfully removed.', 'success')
						}
					})
				} else if (this.isProject) {
					resolveProjectFlags.call({
						projectId: this._id,
						decision: 'remove'
					}, (err, data) => {
						if (err) {
							notify(err.reason || err.message, 'error')
						} else {
							notify('Successfully removed.', 'success')
						}
					})
				} else if (this.isResearch) {
					resolveResearchFlags.call({
						researchId: this._id,
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
	}
})