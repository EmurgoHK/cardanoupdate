import './suspended.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { notify } from '/imports/modules/notifier'

import { applyForPardon } from '/imports/api/user/methods'

const getName = (type) => {
	const o = {
		news: 'You have posted a news article that has been flagged and removed.',
		comment: 'You have posted a comment that has been flagged and removed.'
	}

	return o[type]
}

export { getName }

Template.suspended.helpers({
	isDenied: () => {
		let user = Meteor.users.findOne({
			_id: Meteor.userId()
		})

		return user && user.pardon && user.pardon.status === 'denied'
	},
	didApply: () => {
		let user = Meteor.users.findOne({
			_id: Meteor.userId()
		})

		return user && user.pardon && user.pardon.status === 'new'
	},
	badThings: () => {
		let user = Meteor.users.findOne({
			_id: Meteor.userId()
		})

		return user && user.strikes && user.strikes.sort((i1, i2) => i2.time - i1.time).map(i => ({
			date: moment(i.time).fromNow(),
			name: getName(i.type)
		}))
	}
})

Template.suspended.events({
	'click #js-apply': (event, templateInstance) => {
		event.preventDefault()

		applyForPardon.call({
			reason: $('#js-reason').val()
		}, (err, data) => {
			if (err) {
				notify(err.message || err.reason, 'error')
			} else {
				notify('Successfully applied.', 'success')
			}
		})
	}
})