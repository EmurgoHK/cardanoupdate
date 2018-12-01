import './viewProject.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Projects } from '/imports/api/projects/projects'
import { Comments } from '/imports/api/comments/comments'
import { TranslationGroups } from '../../../api/translationGroups/translationGroups';

import { flagProject, proposeNewData } from '/imports/api/projects/methods'

import { notify } from '/imports/modules/notifier'

import { flagDialog } from '/imports/modules/flagDialog'

import swal from 'sweetalert2'

Template.viewProject.onCreated(function() {
	this.autorun(() => {
		this.subscribe('projects.item', FlowRouter.getParam('slug'))
        this.subscribe('users')

        this.subscribe('translationGroups.itemSlug', {slug: FlowRouter.getParam('slug'), contentType: 'project'});
    });
})

Template.viewProject.helpers({
  isOwner : function() {
    if(this.createdBy === Meteor.userId()){
      return true
    }
    return false
  },
	project: () => Projects.findOne({
		slug: FlowRouter.getParam('slug')
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
	tagName: (tag) => tag.name,
	tagUrl: (tag) => `/tags?search=${encodeURIComponent(tag.name)}`,
	commentSuccess: () => {
		return () => {
			notify(TAPi18n.__('projects.view.success'), 'success');
		}
	},
	translations: () => {
        const group = TranslationGroups.findOne({});
		return group 
			? group.translations
				.filter(t => t.slug !== FlowRouter.getParam('slug'))
				.map(t => ({language: t.language, href: `/projects/${t.slug}`}))
			: [];
	},
})

Template.viewProject.events({
	'click .flag-project': (event, templateInstance) => {
		let project = Projects.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}

		flagDialog.call(project, flagProject, 'projectId')
	},
	'click .github': function(event, temlateInstance) {
        if ($(event.currentTarget).attr('href')) {
            return
        }

        swal({
            text: TAPi18n.__('projects.view.no_gh'),
            type: 'warning',
            showCancelButton: true,
            input: 'text'
        }).then(val => {
            if (val.value) {
                proposeNewData.call({
                    projectId: this._id,
                    datapoint: 'github_url',
                    newData: val.value,
                    type: 'link'
                }, (err, data) => {
                    if (err) {
                        notify(TAPi18n.__(err.reason || err.message), 'error')
                    } else {
                        notify(TAPi18n.__('projects.view.success_contrib'), 'success')
                    }
                })
            }
        })
    },
    'click .website': function(event, temlateInstance) {
        if ($(event.currentTarget).attr('href')) {
            return
        }

        swal({
            text: TAPi18n.__('projects.view.no_web'),
            type: 'warning',
            showCancelButton: true,
            input: 'text'
        }).then(val => {
            if (val.value) {
                proposeNewData.call({
                    projectId: this._id,
                    datapoint: 'website',
                    newData: val.value,
                    type: 'link'
                }, (err, data) => {
                    if (err) {
                        notify(TAPi18n.__(err.reason || err.message), 'error')
                    } else {
                        notify(TAPi18n.__('projects.view.success_contrib'), 'success')
                    }
                })
            }
        })
    },
    'click .projectWarning' (event, _tpl) {
        event.preventDefault()
        swal({
            title: TAPi18n.__('projects.view.missing_repo'),
            text: TAPi18n.__('projects.view.missing_info'),
            type: 'warning',
            cancelButtonColor: '#d33',
            confirmButtonText: TAPi18n.__('projects.view.ok')
        })
    }
})
