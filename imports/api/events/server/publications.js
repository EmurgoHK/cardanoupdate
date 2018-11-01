import { Meteor } from 'meteor/meteor'
import { Events } from '../events'

Meteor.publish('events', () => Events.find({}, {
  sort: {
    start_date: 1
  }
}))

Meteor.publish('events.search', (q) => Events.find(        {
          $or: [{
            headline: {
              $regex: new RegExp(q, "i")
            }
          }, {
            description: {
              $regex: new RegExp(q, "i")
            }
          },
           {
            location: {
              $regex: new RegExp(q, "i")
            }
          }
          ]
        }, {
  sort: {
    createdAt: -1
  }
}))

Meteor.publish('events.item', (id) => Events.find({
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