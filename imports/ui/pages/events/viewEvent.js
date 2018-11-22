import './viewEvent.html'
import '../comments/commentBody'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Events } from '/imports/api/events/events'
import { Comments } from '/imports/api/comments/comments'
import { newComment } from '/imports/api/comments/methods'
import { flagEvent, toggleWatchEvents } from '/imports/api/events/methods'
import { notify } from '/imports/modules/notifier'

import { flagDialog } from '/imports/modules/flagDialog'

import swal from 'sweetalert2'

Template.viewEvent.onCreated(function () {
  this.autorun(() => {
    this.subscribe('events.item', FlowRouter.getParam('slug'))
    this.subscribe('users')

    let event = Events.findOne({
      slug: FlowRouter.getParam('slug')
    })

    if (event) {
      this.subscribe('comments.item', event._id)
    }
  })

  this.message = new ReactiveVar('')
})

Template.viewEvent.helpers({
  isOwner : function() {
    if(this.createdBy === Meteor.userId()){
      return true
    }
    return false
  },
  watching: function() {
		return ~(this.subscribers || []).indexOf(Meteor.userId())
	},
  event: () => Events.findOne({
    slug: FlowRouter.getParam('slug')
  }),
  author: () =>Meteor.users.findOne({_id: Template.currentData().createdBy}),
  comments: () => {
    let event = Events.findOne({
    slug: FlowRouter.getParam('slug')
  }) || {}

    return Comments.find({
      parentId: event._id
    }, {sort: {createdAt: -1}})
  },
commentInvalidMessage: () => Template.instance().message.get(),
commentCount: function () {
  return Comments.find({
    parentId: this._id
  }).count()
}
})

Template.viewEvent.events({
	'click .flag-event': (e, templateInstance) => {
		let event = Events.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}

		flagDialog.call(event, flagEvent, 'eventId')
	},
	'click .new-comment': (e, templateInstance) => {
		e.preventDefault()
		let event = Events.findOne({
			slug: FlowRouter.getParam('slug')
		})

		newComment.call({
			parentId: event._id,
			text: $('#comments').val(),
      newsId: event._id,
      postType : 'event'
		}, (err, data) => {
      $('#comments').val('')
			if (!err) {
				notify(TAPi18n.__('events.view.success'), 'success')
				templateInstance.message.set('')
			} else {
				templateInstance.message.set(TAPi18n.__(err.reason || err.message))
			}
		})
	},
	'click .watch-event': function(e, templateInstance) {
		e.preventDefault()

		toggleWatchEvents.call({
			eventId: this._id
		}, (err, data) => {
			if (err) {
        notify(TAPi18n.__(err.reason || err.message), 'error')
      }
		})
	}
})