import { Template } from 'meteor/templating'
import { Translations } from '/imports/api/translations/translations'
import { FlowRouter } from 'meteor/kadira:flow-router'

import './translations.html'

const nextTranslation = (id) => {
    let sample = _.sample(Translations.find({ 
		_id: {
			$ne: id
		}, 
		status: 'new',
		'votes.userId': {
			$ne: Meteor.userId()
		}	
    }).fetch())

    setTimeout(() => {
        if (!sample) {
            FlowRouter.go('/moderator/translations')
        } else {
            FlowRouter.go(`/moderator/translations/${sample._id}`)    
        }
    }, 300)
}

export { nextTranslation }

Template.modTranslations.onCreated(function() {
	this.autorun(() => {
		this.subscribe('translations')
	})
})

Template.modTranslations.helpers({
	nextTranslation: () => nextTranslation()
})