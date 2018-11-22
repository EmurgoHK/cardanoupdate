import './suspended.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { notify } from '/imports/modules/notifier'

import { applyForPardon } from '/imports/api/user/methods'

const getName = (type) => {
	const o = {
		news: TAPi18n.__('user.suspended.news'),
		comment: TAPi18n.__('user.suspended.comment')
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
				notify(TAPi18n.__(err.message || err.reason), 'error')
			} else {
				notify(TAPi18n.__('user.suspended.success'), 'success')
			}
		})
	}
})