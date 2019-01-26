import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { Events } from './events'
import { Comments } from '../comments/comments'
import { isModerator, userStrike } from '/imports/api/user/methods'
import { isTesting } from '../utilities';
import { addTranslation, removeTranslation, checkTranslation, updateTranslationSlug } from '../translationGroups/methods';

export const newEvent = new ValidatedMethod({
  name: 'newEvent',
  validate: new SimpleSchema({
    headline: {
      type: String,
      max: 90,
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
    rsvp: {
      type: String,
      regEx: SimpleSchema.RegEx.Url,
      optional: false
    },
    captcha: {
      type: String,
      optional: isTesting
    }
  }).validator({
    clean: true
  }),
  run(data) {
    if(Meteor.isServer) {
      if (!Meteor.userId()) {
        throw new Meteor.Error('Error.', 'messages.login')
      }

      if(!isTesting) {
        var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, data.captcha);

        if (!verifyCaptchaResponse.success) {
            throw new Meteor.Error('messages.recaptcha');
        }
      }
      data.createdBy = Meteor.userId()
      data.createdAt = new Date().getTime()
      
      const original = data.original ? Events.findOne({$or: [{_id: data.original}, {slug: data.original}]}) : undefined;
      
      if (data.original && !original)
        throw new Meteor.Error('Error.', 'messages.originalNotFound');
      delete data.original;
      
      if (original && checkTranslation(original, data.language)) 
        throw new Meteor.Error('Error.', 'messages.alreadyTranslated');

      const id = Events.insert(data);
      
      addTranslation(Events.findOne({_id: id}), data.language, 'event', original);
      
      return id;
    }
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
        throw new Meteor.Error('Error.', 'messages.events.no_event')
      }

      if (!Meteor.userId()) {
        throw new Meteor.Error('Error.', 'messages.login')
      }

      if (event.createdBy !== Meteor.userId()) {
        throw new Meteor.Error('Error.', 'messages.events.cant_remove')
      }

      removeTranslation(eventId);

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
      max: 90,
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
    rsvp: {
      type: String,
      regEx: SimpleSchema.RegEx.Url,
      optional: false
    },
    captcha: {
      type: String,
      optional: isTesting
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
    rsvp,
    captcha
  }) {
    if (Meteor.isServer) {
      let event = Events.findOne({
        _id: eventId
      })

      if (!event) {
        throw new Meteor.Error('Error.', 'messages.events.no_event')
      }

      if (!Meteor.userId()) {
        throw new Meteor.Error('Error.', 'messages.login')
      }

      if (event.createdBy !== Meteor.userId()) {
        throw new Meteor.Error('Error.', 'messages.events.cant_edit')
      }
      
      if(!isTesting) {
        var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, captcha);

        if (!verifyCaptchaResponse.success) {
            throw new Meteor.Error('messages.recaptcha');
        } else
            console.log('reCAPTCHA verification passed!');
      }
      Events.update({
        _id: eventId
      }, {
        $set: {
          headline: headline,
          description: description,
          start_date: start_date,
          end_date: end_date,
          location: location,
          rsvp:rsvp,
          updatedAt: new Date().getTime()
        }
      });

      updateTranslationSlug(eventId, Events.findOne({_id: eventId}).slug);
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
      throw new Meteor.Error('Error.', 'messages.events.no_event')
    }

    if (!Meteor.userId()) {
      throw new Meteor.Error('Error.', 'messages.login')
    }

    if ((event.flags || []).some(i => i.flaggedBy === Meteor.userId())) {
      throw new Meteor.Error('Error.', 'messages.already_flagged')
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
      throw new Meteor.Error('Error.', 'messages.login')
    }

    if (!isModerator(Meteor.userId())) {
      throw new Meteor.Error('Error.', 'messages.moderator')
    }

    let event = Events.findOne({
      _id: eventId
    })

    if (!event) {
      throw new Meteor.Error('Error.', 'messages.events.no_event')
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
          throw new Meteor.Error('Error.', 'messages.events.no_event')
      }

      if (!Meteor.userId()) {
          throw new Meteor.Error('Error.', 'messages.login')
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
