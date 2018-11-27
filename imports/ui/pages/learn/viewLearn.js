import './viewLearn.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Learn } from '/imports/api/learn/learn'
import { TranslationGroups } from '../../../api/translationGroups/translationGroups';

import { flagLearningItem } from '/imports/api/learn/methods'

import { notify } from '/imports/modules/notifier'
import { flagDialog } from '/imports/modules/flagDialog'

Template.viewLearn.onCreated(function() {
	this.autorun(() => {
		this.subscribe('learn.item', FlowRouter.getParam('slug'))
		this.subscribe('users')

		this.subscribe('translationGroups.itemSlug', FlowRouter.getParam('slug'));
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
	tagName: (tag) => tag.name,
	tagUrl: (tag) => `/tags?search=${encodeURIComponent(tag.name)}`,
	commentSuccess: () => {
		return () => {
			notify(TAPi18n.__('learn.view.success'), 'success');
		}
	},
	translations: () => {
		const group = TranslationGroups.findOne({});
		return group 
			? group.translations
				.filter(t => t.slug !== FlowRouter.getParam('slug'))
				.map(t => ({language: t.language, href: `/learn/${t.slug}`}))
			: [];
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
