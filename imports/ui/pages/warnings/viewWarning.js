import './viewWarning.html'
import '../comments/commentBody'
 import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
 import { Warnings } from '/imports/api/warnings/warnings'
import { Comments } from '/imports/api/comments/comments'
 import { newComment } from '/imports/api/comments/methods' 
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
    comment: () => {
    	let warning = Warnings.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}
     	return Comments.find({
			parentId: warning._id,
			$or: [
				{ type: 'coolstuff' },
				{ type: 'redflag' },
				{ type: 'warning' },
			]
    	}, {
    		sort: {
    			createdAt: -1
    		}
    	})
    },
	commentCount: function () {
		return Comments.find({
		  	newsId: this._id,
		}).count()
	},
	
	tagName: (tag) => tag.name,
	tagUrl: (tag) => `/tags?search=${encodeURIComponent(tag.name)}`,
	commentSuccess: () => {
		return () => {
			notify('Successfully commented.', 'success');
		}
	},
})
 Template.viewWarning.events({
	'click .flag-warning': (event, templateInstance) => {
		let warning = Warnings.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}
 		swal({
		  	title: 'Why are you flagging this?',
		  	input: 'text',
		  	showCancelButton: true,
		  	inputValidator: (value) => {
		    	return !value && 'You need to write a valid reason!'
		  	}
		}).then(data => {
			if (data.value) {
				flagWarning.call({
					projectId: warning._id,
					reason: data.value
				}, (err, data) => {
					if (err) {
						notify(err.reason || err.message, 'error')
					} else {
						notify('Successfully flagged. Moderators will decide what to do next.', 'success')
					}
				})
			}
		})
	},
})