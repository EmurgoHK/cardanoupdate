import { Meteor } from 'meteor/meteor'

Meteor.publish(null, () => Meteor.users.find({
	_id: Meteor.userId()
}, {
	fields: {
		_id: 1,
		moderator: 1,
		profile: 1,
		suspended: 1,
		pardon: 1,
		strikes: 1,
		mod: 1
	}
}))

Meteor.publish('users', () => Meteor.users.find({}, {
	fields: {
		_id: 1,
		moderator: 1,
		profile: 1,
		suspended: 1,
		pardon: 1,
		strikes: 1,
		mod: 1
	}
}))
