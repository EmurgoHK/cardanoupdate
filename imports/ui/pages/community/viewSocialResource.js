import './viewSocialResource.html'

import { Template } from 'meteor/templating'
import { socialResources } from '/imports/api/socialResources/socialResources'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Comments } from '/imports/api/comments/comments'
import { notify } from '/imports/modules/notifier'


Template.viewSocialResourceTemp.onCreated(function() {
	this.autorun(() => {
		this.subscribe('socialResources.item', FlowRouter.getParam('slug'))
		this.subscribe('users')
	})
})

Template.viewSocialResourceTemp.helpers({
	tagName: (tag) => tag.name,
	tagUrl: (tag) => `/tags?search=${encodeURIComponent(tag.name)}`,

  isOwner : function() {
    if(this.createdBy === Meteor.userId()){
      return true
    }
    return false
  },
	socialResource: () => socialResources.findOne({
		_id: FlowRouter.getParam('slug')
	}),
	author: () => Meteor.users.findOne({_id: Template.currentData().createdBy}),
	coolCount: function () {
		return Comments.find({
		  	newsId: this._id,
		  	type: 'coolstuff'
		}).count()
	},
	flagCount: function () {
		return Comments.find({
		  	newsId: this._id,
		  	type: 'redflag'
		}).count()
	},
	resourceUrlClass(resourceUrlType) {
		switch(resourceUrlType) {
				case 'TELEGRAM':
					return 'fab fa-telegram';
				case 'FACEBOOK':
					return 'fab fa-facebook';
				case 'TWITTER':
					return 'fab fa-twitter';
				case 'DISCORD':
					return 'fab fa-discord';
				case 'SLACK':
					return 'fab fa-slack';
				case 'GITTER':
					return 'fab fa-gitter';
				default:
					return 'fas fa-globe';
		}
	},
	commentSuccess: () => {
		return () => {
			notify(TAPi18n.__('community.view.success'), 'success');
		}
	},
})
