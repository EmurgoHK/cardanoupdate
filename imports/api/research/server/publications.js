import { Meteor } from 'meteor/meteor'

import { Research } from '../research'

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

Meteor.publish('research.search', (q) => Research.find(        {
          $or: [{
            headline: {
              $regex: new RegExp(q, "i")
            }
          }, {
            abstract: {
              $regex: new RegExp(q, "i")
            }
          }
          ]
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