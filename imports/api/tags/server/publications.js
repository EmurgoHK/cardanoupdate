import { Meteor } from 'meteor/meteor'
import { Tags } from '../tags'

Meteor.publish('tags', () => Tags.find({}, {
	sort: {
		mentions: -1
	},
	limit: 10
}))