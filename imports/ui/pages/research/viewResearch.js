import './viewResearch.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Research } from '/imports/api/research/research'
import { Comments } from '/imports/api/comments/comments'

import { flagResearch } from '/imports/api/research/methods'

import { notify } from '/imports/modules/notifier'
import { flagDialog } from '/imports/modules/flagDialog'


Template.viewResearch.onCreated(function() {
	this.autorun(() => {
		this.subscribe('research.item', FlowRouter.getParam('slug'))
		this.subscribe('users')
	})
})

Template.viewResearch.helpers({
  	isOwner: function() {
    	return this.createdBy === Meteor.userId()
  	},
	research: () => Research.findOne({
		slug: FlowRouter.getParam('slug')
	}),
	author: () => Meteor.users.findOne({_id: Template.currentData().createdBy}),
	commentCount: function () {
		return Comments.find({
		  	newsId: this._id
		}).count()
	},
	commentSuccess: () => {
		return () => notify(TAPi18n.__('research.view.success'), 'success');
	},
})

Template.viewResearch.events({
	'click .flag-research': (event, templateInstance) => {
		let research = Research.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}

		flagDialog.call(research, flagResearch, 'researchId')
	},
})
