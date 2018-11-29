import { Template } from 'meteor/templating';
import { Translations } from '/imports/api/translations/translations'
import { FlowRouter } from 'meteor/kadira:flow-router'

import './translation.html'

import { flatten } from '/imports/ui/pages/translations/translations'
import { nextTranslation } from './translations'

import { notify } from '/imports/modules/notifier'

Template.modTranslation.onCreated(function() {
	this.autorun(() => {
		this.subscribe('translations')
	})
})

Template.modTranslation.helpers({
	translation: () => Translations.findOne({
		_id: FlowRouter.getParam('id')
	}),
	translations: function() {
		let data = flatten(this.data)

		return Object.keys(data).map(i => ({
			key: i,
			value: data[i],
			english: TAPi18n.__(i, {
				lang: 'en'
			})
		})) 
	},
	voted: function() {
		return !!(this.votes || []).filter(i => i.userId === Meteor.userId()).length
	},
	upvotes: function() {
		return this.upvotes || 0
	},
	downvotes: function() {
		return this.downvotes || 0
	}
})

Template.modTranslation.events({
	'click .js-vote': function(event, templateInstance) {
		event.preventDefault()

        let type = $(event.currentTarget).data('vote')

        Meteor.call('translationVote', this._id, type, (err, data) => {
            if (err && err.error === 'mod-only') {
                notify(TAPi18n.__('mod.translation.only_mod'), 'error')
            }

            if (data === 'ok') {
                notify(TAPi18n.__('mod.translation.approved'))
            } else if (data === 'not-ok') {
            	notify(TAPi18n.__('mod.translation.deleted'))
            }

            if (!err) {
            	nextTranslation(this._id)
            }
        })
    },
    'click #skipChange': function(event, templateInstance) {
    	event.preventDefault()

    	nextTranslation(this._id)
    }
})