import './viewWarning.html'
 import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
 import { Warnings } from '/imports/api/warnings/warnings'
import { Comments } from '/imports/api/comments/comments'
import { flagWarning } from '/imports/api/warnings/methods'
 import { notify } from '/imports/modules/notifier'
 import swal from 'sweetalert2'
 Template.viewWarning.onCreated(function() {
	this.autorun(() => {
		this.subscribe('warnings.item', FlowRouter.getParam('slug'))
		this.subscribe('users')
 		let warning = Warnings.findOne({
			slug: FlowRouter.getParam('slug')
		})
 		if (warning) {
			this.subscribe('comments.item', warning._id)
		}
	})
})
 Template.viewWarning.helpers({
  isOwner : function() {
    if(this.createdBy === Meteor.userId()){
      return true
    }
    return false
  },
  	warning: () => Warnings.findOne({
		slug: FlowRouter.getParam('slug')
	}),
	author: () => Meteor.users.findOne({_id: Template.currentData().createdBy}),
	commentCount: function () {
		return Comments.find({
		  	newsId: this._id,
		}).count()
	},
	
	tagName: (tag) => tag.name,
	tagUrl: (tag) => `/tags?search=${encodeURIComponent(tag.name)}`,
	commentSuccess: () => {
		return () => {
			notify(TAPi18n.__('warnings.view.success'), 'success');
		}
	},
})
 Template.viewWarning.events({
	'click .flag-warning': (event, templateInstance) => {
		let warning = Warnings.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}
 		swal({
		  	title: TAPi18n.__('warnings.view.flag_reason'),
		  	input: 'text',
		  	showCancelButton: true,
		  	inputValidator: (value) => {
		    	return !value && TAPi18n.__('warnings.view.invalid_reason')
		  	}
		}).then(data => {
			if (data.value) {
				flagWarning.call({
					projectId: warning._id,
					reason: data.value
				}, (err, data) => {
					if (err) {
						notify(TAPi18n.__(err.reason || err.message), 'error')
					} else {
						notify(TAPi18n.__('warnings.view.success_flag'), 'success')
					}
				})
			}
		})
	},
})