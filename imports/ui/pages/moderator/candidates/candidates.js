import './candidates.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { notify } from '/imports/modules/notifier'

import { promoteUser } from '/imports/api/user/methods'

import swal from 'sweetalert2'

Template.candidates.onCreated(function() {
	this.autorun(() => {
		this.subscribe('users')
	})
})

Template.candidates.helpers({
	candidates: () => {
		return Meteor.users.find({
			'mod.candidate': true,
			moderator: {
				$ne: true
			}
		}).fetch().map(i => ({
			profile: i.profile,
			_id: i._id,
			rating: i.mod.data.rating,
			rank: i.mod.data.rank,
			totalInput: i.mod.data.totalInput
		})).sort((i1, i2) => i1.rank - i2.rank)
	},
	fixed: val => val.toFixed(2)
})

Template.candidates.events({
	'click #js-promote': function(event, templateInstance) {
		event.preventDefault()

		promoteUser.call({
			userId: this._id
		}, (err, data) => {
			if (err) {
				notify(err.reason || err.message, 'error')
			} else {
				notify('Successfully promoted.', 'success')
			}
		})
	}
})