import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { Events } from './events'
import { Comments } from '../comments/comments'
import { isModerator, userStrike } from '/imports/api/user/methods'

export const newEvent = new ValidatedMethod({
  name: 'newEvent',
  validate: new SimpleSchema({
    headline: {
      type: String,
      max: 100,
      optional: false
    },
    description: {
      type: String,
      max: 1000,
      optional: false
    },
    start_date: {
      type: String,
      optional: false
    },
    end_date: {
      type: String,
      optional: false
    },
    location: {
      type: String,
      max: 100,
      optional: false
    },
    placeId: {
      type: String,
      optional: false
    },
    rsvp: {
      type: String,
      optional: false
    }
  }).validator({
    clean: true
  }),
  run(data) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Error.', 'You have to be logged in.')
    }
    data.createdBy = Meteor.userId()
    data.createdAt = new Date().getTime()
    return Events.insert(data)
  }
})

export const deleteEvent = new ValidatedMethod({
  name: 'deleteEvent',
  validate: new SimpleSchema({
    eventId: {
      type: String,
      optional: false
    }
  }).validator(),
  run({
    eventId
  }) {
    if (Meteor.isServer) {
      let event = Events.findOne({
        _id: eventId
      })

      if (!event) {
        throw new Meteor.Error('Error.', 'Event doesn\'t exist.')
      }

      if (!Meteor.userId()) {
        throw new Meteor.Error('Error.', 'You have to be logged in.')
      }

      if (event.createdBy !== Meteor.userId()) {
        throw new Meteor.Error('Error.', 'You can\'t remove a event that you haven\'t added.')
      }

      return Events.remove({
        _id: eventId
      })
    }
  }
})

export const editEvent = new ValidatedMethod({
  name: 'editEvent',
  validate: new SimpleSchema({
    eventId: {
      type: String,
      optional: false
    },
    headline: {
      type: String,
      max: 100,
      optional: false
    },
    description: {
      type: String,
      max: 1000,
      optional: false
    },
    start_date: {
      type: String,
      optional: false
    },
    end_date: {
      type: String,
      optional: false
    },
    location: {
      type: String,
      max: 100,
      optional: false
    },
    placeId: {
      type: String,
      optional: false
    },
    rsvp: {
      type: String,
      optional: false
    }
  }).validator({
    clean: true
  }),
  run({
    eventId,
    headline,
    description,
    start_date,
    end_date,
    location,
    placeId,
    rsvp
  }) {
    if (Meteor.isServer) {
      let event = Events.findOne({
        _id: eventId
      })

      if (!event) {
        throw new Meteor.Error('Error.', 'Event doesn\'t exist.')
      }

      if (!Meteor.userId()) {
        throw new Meteor.Error('Error.', 'You have to be logged in.')
      }

      if (event.createdBy !== Meteor.userId()) {
        throw new Meteor.Error('Error.', 'You can\'t edit a event that you haven\'t added.')
      }

      return Events.update({
        _id: eventId
      }, {
        $set: {
          headline: headline,
          description: description,
          start_date: start_date,
          end_date: end_date,
          location: location,
          rsvp:rsvp,
          placeId: placeId,
          updatedAt: new Date().getTime()
        }
      })
    }
  }
})

export const flagEvent = new ValidatedMethod({
  name: 'flagEvent',
  validate: new SimpleSchema({
    eventId: {
      type: String,
      optional: false
    },
    reason: {
      type: String,
      max: 1000,
      optional: false
    }
  }).validator({
    clean: true
  }),
  run({
    eventId,
    reason
  }) {
    let event = Events.findOne({
      _id: eventId
    })

    if (!event) {
      throw new Meteor.Error('Error.', 'Event doesn\'t exist.')
    }

    if (!Meteor.userId()) {
      throw new Meteor.Error('Error.', 'You have to be logged in.')
    }

    if ((event.flags || []).some(i => i.flaggedBy === Meteor.userId())) {
      throw new Meteor.Error('Error.', 'You have already flagged this item.')
    }

    return Events.update({
      _id: eventId
    }, {
      $push: {
        flags: {
          reason: reason,
          flaggedBy: Meteor.userId(),
          flaggedAt: new Date().getTime()
        }
      }
    })
  }
})

export const resolveEventFlags = new ValidatedMethod({
  name: 'resolveEventFlags',
  validate: new SimpleSchema({
    eventId: {
      type: String,
      optional: false
    },
    decision: {
      type: String,
      optional: false
    }
  }).validator({
    clean: true
  }),
  run({
    eventId,
    decision
  }) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Error.', 'You have to be logged in.')
    }

    if (!isModerator(Meteor.userId())) {
      throw new Meteor.Error('Error.', 'You have to be a moderator.')
    }

    let event = Events.findOne({
      _id: eventId
    })

    if (!event) {
      throw new Meteor.Error('Error.', 'Event doesn\'t exist.')
    }

    if (decision === 'ignore') {
      return Events.update({
        _id: eventId
      }, {
        $set: {
          flags: []
        }
      })
    } else {
      userStrike.call({
        userId: event.createdBy,
        type: 'event',
        token: 's3rv3r-only',
        times: 1
      }, (err, data) => {})

      Comments.remove({
        newsId: eventId
      })

      return Events.remove({
        _id: eventId
      })
    }
  }
})

export const toggleWatchEvents = new ValidatedMethod({
  name: 'toggleWatchEvents',
  validate:
      new SimpleSchema({
          eventId: {
              type: String,
              optional: false
          }
      }).validator({
          clean: true
      }),
  run({ eventId }) {
      let event = Events.findOne({
          _id: eventId
      })

      if (!event) {
          throw new Meteor.Error('Error.', 'Event doesn\'t exist.')
      }

      if (!Meteor.userId()) {
          throw new Meteor.Error('Error.', 'You have to be logged in.')
      }

      return Events.update({
          _id: eventId
      }, {
          [!~(event.subscribers || []).indexOf(Meteor.userId()) ? '$addToSet' : '$pull']: {
              subscribers: Meteor.userId()
          }
      })
  }
})