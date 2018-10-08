import './changes.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Projects } from '/imports/api/projects/projects'
import { notify } from '/imports/modules/notifier'

import { resolveProjectDataUpdate } from '/imports/api/projects/methods'

import swal from 'sweetalert2'

Template.changes.onCreated(function() {
	this.autorun(() => {
		this.subscribe('projects')
		this.subscribe('users')
	})
})

Template.changes.helpers({
	changedItems: () => {
		let projects = Projects.find({
			'edits.status': 'open'
		}).fetch()

		return _.flatten(projects.map(i => i.edits.map(j => ({
			status: j.status,
			slug: i.slug,
			_id: i._id,
			editId: j._id,
			headline: i.headline,
			datapoint: j.datapoint,
			newData: j.newData,
			author: ((Meteor.users.findOne({
				_id: j.proposedBy
			}) || {}).profile || {}).name || 'No name',
			type: j.type || 'string',
			link: j.type === 'link',
			createdAt: j.createdAt
		})).filter(i => i.status === 'open')))
	}
})

Template.changes.events({
	'click #js-merge': function(event, templateInstance) {
		event.preventDefault()

		resolveProjectDataUpdate.call({
			projectId: this._id,
			editId: this.editId,
			decision: 'merge'
		}, (err, data) => {
			if (err) {
				notify(err.reason || err.message, 'error')
			} else {
				notify('Successfully merged.', 'success')
			}
		})
	},
	'click #js-reject': function(event, templateInstance) {
		event.preventDefault()

		resolveProjectDataUpdate.call({
			projectId: this._id,
			editId: this.editId,
			decision: 'reject'
		}, (err, data) => {
			if (err) {
				notify(err.reason || err.message, 'error')
			} else {
				notify('Successfully rejected.', 'success')
			}
		})
	},
})