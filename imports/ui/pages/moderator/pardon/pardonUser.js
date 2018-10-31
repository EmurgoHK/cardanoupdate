import './pardonUser.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { getName } from '../../suspended/suspended'
import { notify } from '/imports/modules/notifier'

import { pardonVote } from '/imports/api/user/methods'

import moment from 'moment'

const newPardonUser = () => {
	let sample = _.sample(Meteor.users.find({ 
		_id: {
			$ne: FlowRouter.getParam('id')
		},
		'pardon.status': 'new',
		'pardon.votes': { 
			'$not': { 
				'$elemMatch': {
					userId: Meteor.userId()
				}
			}
		}
	}).fetch())

	if (!sample) { 
		FlowRouter.go('/moderator/pardon')
		
		return
	}

	FlowRouter.go(`/moderator/pardon/${sample._id}`)
}

Template.pardonUser.onCreated(function() {
	this.autorun(() => {
		this.subscribe('users')
	})
})

Template.pardonUser.helpers({
	pardonUser: () => {
		return Meteor.users.findOne({
			_id: FlowRouter.getParam('id')
		})
	},
	pardons: () => Meteor.users.find({
		'pardon.status': 'new'
	}),
	offences: function() {
		return this.strikes && this.strikes.map(i => ({
			date: moment(i.time).fromNow(),
			name: getName(i.type)
		}))
	},
	voted: function() {
		return !!(this.pardon.votes || []).filter(i => i.userId === Meteor.userId()).length
	},
	upvotes: function() {
		return this.pardon.upvotes || 0
	},
	downvotes: function() {
		return this.pardon.downvotes || 0
	}
})

Template.pardonUser.events({
	'click .js-vote': function(event, templateInstance) {
        let type = 

        pardonVote.call({
        	userId: this._id,
        	type: $(event.currentTarget).data('vote')
        }, (err, data) => {
            if (err) {
            	notify(err.message || err.reason, 'error')
            } else {
				newPardonUser()
			}
        })
	},
	'click #skipPardon': (event, templateInstance) => {
		newPardonUser()
	}
})