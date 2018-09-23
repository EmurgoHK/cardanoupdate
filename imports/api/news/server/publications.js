import { Meteor } from 'meteor/meteor'

import { News } from '../news'

Meteor.publish('news', () => News.find({}, {
	sort: {
		createdAt: -1
	}
}))

Meteor.publish('news.item', (id) => News.find({
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

Meteor.publish('news.my', () => News.find({
	createdBy: Meteor.userId()
}, {
	sort: {
		createdAt: -1
	}
}))

Meteor.publish('news.flagged', () => {
	return News.find({
		'flags.0': {
			$exists: true
		}
	}, {
		sort: {
			createdAt: -1
		}
	})
})