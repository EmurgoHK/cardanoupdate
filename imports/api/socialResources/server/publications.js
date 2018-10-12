import { Meteor } from 'meteor/meteor'
import { socialResources } from '../socialResources'

Meteor.publish('socialResources', () => socialResources.find({}, {
	sort: {
		createdAt: -1
	}
}))

Meteor.publish('socialResources.item', (id) => socialResources.find({
	$or: [{
		_id: id
	}, {
		slug: id
	}]
}, {
	sort: {
		createdAt: -1
	}
}))
