import { Meteor } from 'meteor/meteor'

import { Learn } from '../learn'

Meteor.publish('learn', () => Learn.find({}, {
	sort: {
		createdAt: -1
	}
}))

Meteor.publish('learn.search', (q) => Learn.find(        {
          $or: [{
            title: {
              $regex: new RegExp(q, "i")
            }
          }, {
            summary: {
              $regex: new RegExp(q, "i")
            }
          },
           {
            content: {
              $regex: new RegExp(q, "i")
            }
          }
          ]
        }, {
  sort: {
    createdAt: -1
  }
}))

Meteor.publish('learn.item', (id) => Learn.find({
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

Meteor.publish('learn.flagged', () => {
	return Learn.find({
		'flags.0': {
			$exists: true
		}
	}, {
		sort: {
			createdAt: -1
		}
	})
})