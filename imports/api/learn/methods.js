import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { Learn } from './learn'
import { Comments } from '/imports/api/comments/comments'

import { isModerator, userStrike } from '/imports/api/user/methods'
import { addTag, mentionTag, getTag } from '/imports/api/tags/methods'

import { sendNotification } from '/imports/api/notifications/methods'

export const addToSubscribers = (newsId, userId) => {
  let learn = Learn.findOne({
    _id: newsId
  })

  Learn.update({
      _id: newsId
  }, {
      $addToSet: {
          subscribers: userId
      }
  })
}

export const sendToSubscribers = (newsId, authorId, message) => {
  let learn = Learn.findOne({
      _id: newsId
  })

  if (learn && learn.subscribers && learn.subscribers.length) {
    learn.subscribers.forEach(i => {
          if (i !== authorId) { // don't notify yourself
            sendNotification(i, message, 'System', `/learn/${learn.slug}`)
          }
      })
  }
  return learn.subscribers
}

export const newLearningItem = new ValidatedMethod({
    name: 'newLearningItem',
    validate:
        new SimpleSchema({
            title: {
              type: String,
              max: 90,
              optional: false
            },
            summary : {
              type: String,
              max: 260,
              optional: false
            },
            content: {
              type: String,
              max: 5000,
              optional: false
            },
            difficultyLevel: {
              type: String,
              optional: false
            },
            captcha: {
                type: String,
                optional: false
            },
            tags: {
                type: Array,
                optional: true
            },
            'tags.$': {
                type: Object,
                optional: true
            },
            'tags.$.id': {
                type: String,
                optional: true
            },
            'tags.$.name': {
                type: String,
                optional: true
            }
        }).validator({
            clean: true
        }),
    run({ title, summary, content, tags, captcha, difficultyLevel }) {
        if (Meteor.isServer) {
            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You have to be logged in.')
            }

            if(captcha != '_test_captcha_') {
                var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, captcha);
        
                if (!verifyCaptchaResponse.success) {
                    throw new Meteor.Error('recaptcha failed please try again');
                }
            }
            if (tags) {
                tags.forEach(tag => {
                    if (tag.id) {
                        mentionTag(tag.id)
                    } else if (tag.name) {
                        tagId = addTag(tag.name)
                        tag.id = tagId
                    }
                })
            }
    
            return Learn.insert({
                title: title,
                summary: summary,
                content: content,
                difficultyLevel: difficultyLevel,
                tags: tags,
                createdAt: new Date().getTime(),
                createdBy: Meteor.userId()
            })
        }
    }
})

export const removeLearningItem = new ValidatedMethod({
    name: 'removeLearningItem',
    validate:
        new SimpleSchema({
            learnId: {
                type: String,
                optional: false
            }
        }).validator(),
    run({ learnId }) {
        let learn = Learn.findOne({
            _id: learnId
        })

        if (!learn) {
            throw new Meteor.Error('Error.', 'Learning item doesn\'t exist.')
        }

        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        if (learn.createdBy !== Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You can\'t remove a learning item that you haven\'t created.')
        }

        Comments.remove({
            newsId: learnId
        })

        return Learn.remove({
            _id: learnId
        })
    }
})

export const editLearningItem = new ValidatedMethod({
    name: 'editLearningItem',
    validate:
        new SimpleSchema({
            learnId: {
                type: String,
                optional: false
            },
            title: {
                type: String,
                max: 90,
                optional: false
            },
            summary : {
              type: String,
              max: 260,
              optional: false
            },
            content: {
              type: String,
              max: 5000,
              optional: false
            },
            difficultyLevel: {
              type: String,
              optional: false
            },
            captcha: {
                type: String,
                optional: false
            },
            tags: {
              type: Array,
              optional: true
            },
            'tags.$': {
              type: Object,
              optional: true
            },
            'tags.$.id': {
              type: String,
              optional: true
            },
            'tags.$.name': {
              type: String,
              optional: true
            }
        }).validator({
            clean: true
        }),
    run({ learnId, title, summary, content, tags, captcha, difficultyLevel }) {
        if (Meteor.isServer) {
            let learn = Learn.findOne({
                _id: learnId
            })
    
            if (!learn) {
                throw new Meteor.Error('Error.', 'Learning item doesn\'t exist.')
            }
    
            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You have to be logged in.')
            }
    
            if (learn.createdBy !== Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You can\'t edit a learning item that you haven\'t created.')
            }
            
            if(captcha != '_test_captcha_') {
                var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, captcha);
        
                if (!verifyCaptchaResponse.success) {
                    throw new Meteor.Error('recaptcha failed please try again');
                } 
            }
            if (tags) {
                tags.forEach(tag => {
                    if (tag.id) {
                        mentionTag(tag.id)
                    } else if (tag.name) {
                        tagId = addTag(tag.name)
                        tag.id = tagId
                    }
                })
            }
    
            return Learn.update({
                _id: learnId
            }, {
                $set: {
                    title: title,
                    summary: summary,
                    content: content,
                    difficultyLevel: difficultyLevel,
                    tags: tags,
                    editedAt: new Date().getTime()
                }
            })
        }
    }
})

export const flagLearningItem = new ValidatedMethod({
    name: 'flagLearningItem',
    validate:
        new SimpleSchema({
            learnId: {
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
    run({ learnId, reason }) {
        let learn = Learn.findOne({
            _id: learnId
        })

        if (!learn) {
            throw new Meteor.Error('Error.', 'Learning item doesn\'t exist.')
        }

        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        if ((learn.flags || []).some(i => i.flaggedBy === Meteor.userId())) {
            throw new Meteor.Error('Error.', 'You have already flagged this item.')
        }

        return Learn.update({
            _id: learnId
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

export const resolveLearningItemFlags = new ValidatedMethod({
    name: 'resolveLearningItemFlags',
    validate:
        new SimpleSchema({
            learnId: {
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
    run({ learnId, decision }) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        if (!isModerator(Meteor.userId())) {
            throw new Meteor.Error('Error.', 'You have to be a moderator.')
        }

        let learn = Learn.findOne({
            _id: learnId
        })

        if (!learn) {
            throw new Meteor.Error('Error.', 'Learning item doesn\'t exist.')
        }

        if (decision === 'ignore') {
            return Learn.update({
                _id: learnId
            }, {
                $set: {
                    flags: []
                }
            })
        } else {
            userStrike.call({
                userId: learn.createdBy,
                type: 'learn',
                token: 's3rv3r-only',
                times: 1
            }, (err, data) => {})

            Comments.remove({
                newsId: learnId
            })

            return Learn.remove({
                _id: learnId
            })
        }
    }
})
