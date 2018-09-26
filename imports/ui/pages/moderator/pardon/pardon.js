import './pardon.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

Template.pardon.onCreated(function() {
	this.autorun(() => {
		this.subscribe('users')
	})
})

Template.pardon.helpers({
	pardonRequest: () => {
		return _.sample(Meteor.users.find({ 
			'pardon.status': 'new',
			'pardon.votes': {
				'$not': { 
					'$elemMatch': {
						userId: Meteor.userId()
					}
				}
			}
		}).fetch())
	},
	nextPardonRequest: (pardon) => {
		if (!pardon) {
			return
		} 

		FlowRouter.go(`/moderator/pardon/${pardon._id}`)
	}
})