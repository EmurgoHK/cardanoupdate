import { Meteor } from 'meteor/meteor'

import { Faq } from '../faq'

Meteor.publish('faq', () => Faq.find({}, {
	sort: {
		createdAt: -1
	}
}))

Meteor.publish('faq.item', (id) => Faq.find({
	$or: [{
		_id: id
	}]
}, {
	sort: {
		createdAt: -1
	}
}))