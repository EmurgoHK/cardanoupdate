import { Meteor } from 'meteor/meteor'

import { Search } from '../search'

Meteor.publish('research', () => Research.find({}, {
	sort: {
		createdAt: -1
	}
}))

Meteor.publish('research.item', (id) => Research.find({
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

Meteor.publish('research.flagged', () => {
	return Research.find({
		'flags.0': {
			$exists: true
		}
	}, {
		sort: {
			createdAt: -1
		}
	})
})