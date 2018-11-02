import { Meteor } from 'meteor/meteor'
import { Projects } from '../projects'

Meteor.publish('projects', () => Projects.find({}, {
	sort: {
		createdAt: -1
	}
}))

Meteor.publish('projects.search', (q) => Projects.find(        {
          $or: [{
            headline: {
              $regex: new RegExp(q, "i")
            }
          }, {
            description: {
              $regex: new RegExp(q, "i")
            }
          }]
        }, {
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