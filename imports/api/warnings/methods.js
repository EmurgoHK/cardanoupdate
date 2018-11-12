import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { Warnings } from './warnings'
import { Comments } from '../comments/comments'

import { isModerator, userStrike } from '/imports/api/user/methods'
import { isTesting } from '../utilities';

export const addWarning = new ValidatedMethod({
    name: 'addWarning',
    validate:
        new SimpleSchema({
            headline: {
                type: String,
                max: 100,
                optional: false
            },
            summary: {
                type: String,
                max: 260,
                optional: false
            },
            captcha: {
                type: String,
                optional: isTesting
            },
        }).validator({
            clean: true
        }),
    run(data) {
        if (Meteor.isServer) {
            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You have to be logged in.')
            }
    
            if(!isTesting) {
                var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, data.captcha);
        
                if (!verifyCaptchaResponse.success) {
                    throw new Meteor.Error('recaptcha failed please try again');
                } else
                    console.log('reCAPTCHA verification passed!');
            }
            data.createdBy = Meteor.userId()
            data.createdAt = new Date().getTime()
    
            return Warnings.insert(data)
        }
    }
})

export const deleteWarning = new ValidatedMethod({
    name: 'deleteWarning',
    validate:
        new SimpleSchema({
            projectId: {
                type: String,
                optional: false
            }
        }).validator(),
    run({ projectId }) {
        if (Meteor.isServer) {
            let warning = Warnings.findOne({ _id: projectId })

            if (!warning) {
                throw new Meteor.Error('Error.', 'Warning doesn\'t exist.')
            }

            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You have to be logged in.')
            }

            if (warning.createdBy !== Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You can\'t remove a warning that you haven\'t added.')
            }

            return Warnings.remove({ _id: projectId })
        }
    }
})

export const editWarning = new ValidatedMethod({
    name: 'editWarning',
    validate:
        new SimpleSchema({
            projectId: {
                type: String,
                optional: false
            },
            headline: {
                type: String,
                max: 100,
                optional: false
            },
            summary: {
                type: String,
                max: 260,
                optional: false
            },
            captcha: {
                type: String,
                optional: isTesting
            }
        }).validator({
            clean: true
        }),
    run({ projectId, headline, summary, captcha }) {
        if (Meteor.isServer) {
            let warning = Warnings.findOne({ _id: projectId })

            if (!warning) {
                throw new Meteor.Error('Error.', 'Warning doesn\'t exist.')
            }

            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You have to be logged in.')
            }

            if (warning.createdBy !== Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You can\'t edit a warning that you haven\'t added.')
            }

            if(!isTesting) {
                var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, captcha);

                if (!verifyCaptchaResponse.success) {
                    throw new Meteor.Error('recaptcha failed please try again');
                } else
                    console.log('reCAPTCHA verification passed!');
            }

            return Warnings.update({
                _id: projectId
            }, {
                $set: {
                    headline: headline,
                    summary: summary,
                    updatedAt: new Date().getTime()
                }
            })
        }
    }
})

export const flagWarning = new ValidatedMethod({
    name: 'flagWarning',
    validate:
        new SimpleSchema({
            projectId: {
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
    run({ projectId, reason }) {
        let warning = Warnings.findOne({
            _id: projectId
        })

        if (!warning) {
            throw new Meteor.Error('Error.', 'Warning doesn\'t exist.')
        }

        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }
      
        if ((warning.flags || []).some(i => i.flaggedBy === Meteor.userId())) {
            throw new Meteor.Error('Error.', 'You have already flagged this item.')
        }

        return Warnings.update({
            _id: projectId
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

export const resolveWarningFlags = new ValidatedMethod({
    name: 'resolveWarningFlags',
    validate:
        new SimpleSchema({
            projectId: {
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
    run({ projectId, decision }) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        if (!isModerator(Meteor.userId())) {
            throw new Meteor.Error('Error.', 'You have to be a moderator.')
        }

        let warning = Warnings.findOne({
            _id: projectId
        })

        if (!warning) {
            throw new Meteor.Error('Error.', 'Warning doesn\'t exist.')
        }

        if (decision === 'ignore') {
            return Warnings.update({
                _id: projectId
            }, {
                $set: {
                    flags: []
                }
            })
        } else {
            userStrike.call({
                userId: warning.createdBy,
                type: 'warning',
                token: 's3rv3r-only',
                times: 1
            }, (err, data) => {})
            
            Comments.remove({
                newsId: projectId
            })

            return Warnings.remove({
                _id: projectId
            })
        }
    }
})

if (Meteor.isDevelopment) {
    Meteor.methods({
        generateTestWarnings: () => {
            for (let i = 0; i < 2; i++) {
                Warnings.insert({
                    headline: `Testing 123`,
                    summary: 'Test',
                    createdBy: 'test',
                    createdAt: new Date().getTime(),
                    edits: [{
                        _id: 'testId',
                        proposedBy: 'test',
                        newData: 'https://testing.com',
                        datapoint: 'github_url',
                        status: 'open',
                        createdAt: new Date().getTime(),
                        type: 'link'
                    }]
                })
            }
        },
        removeTestWarnings: () => {
            for (let i = 0; i < 2; i++) {
                Warnings.remove({
                    headline: `Testing 123`,
                })
            }
        }
    })
}