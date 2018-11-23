import './viewEvent.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Events } from '/imports/api/events/events'
import { TranslationGroups } from '../../../api/translationGroups/translationGroups';
import { Comments } from '/imports/api/comments/comments'
import { flagEvent, toggleWatchEvents } from '/imports/api/events/methods'
import { notify } from '/imports/modules/notifier'

import { flagDialog } from '/imports/modules/flagDialog'


Template.viewEvent.onCreated(function () {
  this.autorun(() => {
    this.subscribe('events.item', FlowRouter.getParam('slug'))
    this.subscribe('translationGroups.itemSlug', FlowRouter.getParam('slug'));
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
  commentCount: function () {
    return Comments.find({
      parentId: this._id
    }).count()
	},
	commentSucccess: () => {
		return () => notify(TAPi18n.__('events.view.success'), 'success');
	},
	translations: () => {
		const group = TranslationGroups.findOne({});
		return group 
			? group.translations
				.filter(t => t.slug !== FlowRouter.getParam('slug'))
				.map(t => ({language: t.language, href: `/events/${t.slug}`}))
			: [];
	},
})

Template.viewEvent.events({
	'click .flag-event': (e, templateInstance) => {
		let event = Events.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}

		flagDialog.call(event, flagEvent, 'eventId')
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