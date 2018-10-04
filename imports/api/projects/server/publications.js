import { Meteor } from 'meteor/meteor'
import { Projects } from '../projects'

Meteor.publish('projects', () => Projects.find({}, {
	sort: {
		createdAt: -1
	}
}))

Meteor.publish('projects.item', (id) => Projects.find({
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