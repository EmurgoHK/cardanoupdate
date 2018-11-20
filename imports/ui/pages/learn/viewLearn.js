import './viewLearn.html'
import '../comments/commentBody'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Learn } from '/imports/api/learn/learn'
import { Comments } from '/imports/api/comments/comments'

import { newComment } from '/imports/api/comments/methods' 
import { flagLearningItem } from '/imports/api/learn/methods'

import { notify } from '/imports/modules/notifier'
import { flagDialog } from '/imports/modules/flagDialog'

import swal from 'sweetalert2'

Template.viewLearn.onCreated(function() {
	this.autorun(() => {
		this.subscribe('learn.item', FlowRouter.getParam('slug'))
		this.subscribe('users')

		let learn = Learn.findOne({
			slug: FlowRouter.getParam('slug')
		})

		if (learn) {
			this.subscribe('comments.item', learn._id)
		}
	})

	this.message = new ReactiveVar('')
})

Template.viewLearn.helpers({
  isOwner: function() {
    return this.createdBy === Meteor.userId()
  },
  learningLevel () {
    let level = this.difficultyLevel
    if(level){
      if(level == 'beginner'){
        return `<span class="text-success" title="Difficulty Level"><i class="fa fa-circle"></i> ${TAPi18n.__(`learn.view.${level}`)}</span>`
      } else if (level == 'intermediate') {
        return `<span class="text-warning" title="Difficulty Level"><i class="fa fa-circle"></i> ${TAPi18n.__(`learn.view.${level}`)}</span>`
      } else {
        return `<span class="text-danger" title="Difficulty Level"><i class="fa fa-circle"></i> ${TAPi18n.__(`learn.view.${level}`)}</span>`
      }
    }
    return false
  },
	learn: () => Learn.findOne({
		slug: FlowRouter.getParam('slug')
	}),
	author: () => Meteor.users.findOne({_id: Template.currentData().createdBy}),
    comments: () => {
    	let learn = Learn.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}

    	return Comments.find({
        	parentId: learn._id
    	}, {
    		sort: {
    			createdAt: -1
    		}
    	})
    },
	commentInvalidMessage: () => Template.instance().message.get(),
	commentCount: function () {
		return Comments.find({
		  newsId: this._id
		}).count()
	},
	tagName: (tag) => tag.name,
	tagUrl: (tag) => `/tags?search=${encodeURIComponent(tag.name)}`,
	commentSuccess: () => {
		return () => {
			notify(TAPi18n.__('learn.view.success'), 'success');
		}
	},
})

Template.viewLearn.events({
	'click .flag-learn': (event, templateInstance) => {
		let learn = Learn.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}

		flagDialog.call(learn, flagLearningItem, 'learnId')
	}
})
