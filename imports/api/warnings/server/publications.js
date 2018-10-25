import { Meteor } from 'meteor/meteor'
import { Warnings } from '../warnings'
 Meteor.publish('warnings', () => Warnings.find({}, {
	sort: {
		createdAt: -1
	}
}))
 Meteor.publish('warnings.item', (id) => Warnings.find({
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