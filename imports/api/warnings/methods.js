import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { Warnings } from './warnings'
import { Comments } from '../comments/comments'

import { isModerator, userStrike } from '/imports/api/user/methods'
import { addTranslation, removeTranslation, checkTranslation } from '../translationGroups/methods';

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
            language: {
              type: String,
              optional: false,
            },
            captcha: {
              type: String,
              optional: isTesting
            },
            original: {
                type: String,
                optional: true,
            },
        }).validator({
            clean: true
        }),
    run(data) {
        if (Meteor.isServer) {
            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'messages.login')
            }
    
            if(!isTesting) {
                var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, data.captcha);
        
                if (!verifyCaptchaResponse.success) {
                    throw new Meteor.Error('messages.recaptcha');
                } else
                    console.log('reCAPTCHA verification passed!');
            }
            data.createdBy = Meteor.userId()
            data.createdAt = new Date().getTime()
    
            const original = data.original ? Warnings.findOne({$or: [{_id: data.original}, {slug: data.original}]}) : undefined;
            
            if (data.original && !original)
              throw new Meteor.Error('Error.', 'messages.originalNotFound');
            delete data.original;
            
            if (original && checkTranslation(original, data.language)) 
              throw new Meteor.Error('Error.', 'messages.alreadyTranslated');

            const id = Warnings.insert(data);
      
            addTranslation(Warnings.findOne({_id: id}), data.language, 'warning', original);
            return id;
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
                throw new Meteor.Error('Error.', 'messages.warnings.no_warning')
            }

            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'messages.login')
            }

            if (warning.createdBy !== Meteor.userId()) {
                throw new Meteor.Error('Error.', 'messages.warnings.cant_remove')
            }

            removeTranslation(projectId);

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
                throw new Meteor.Error('Error.', 'messages.warnings.no_warning')
            }

            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'messages.login')
            }

            if (warning.createdBy !== Meteor.userId()) {
                throw new Meteor.Error('Error.', 'messages.warnings.cant_edit')
            }

            if(!isTesting) {
                var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, captcha);

                if (!verifyCaptchaResponse.success) {
                    throw new Meteor.Error('messages.recaptcha');
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
            throw new Meteor.Error('Error.', 'messages.warnings.no_warning')
        }

        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'messages.login')
        }
      
        if ((warning.flags || []).some(i => i.flaggedBy === Meteor.userId())) {
            throw new Meteor.Error('Error.', 'messages.already_flagged')
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
            throw new Meteor.Error('Error.', 'messages.login')
        }

        if (!isModerator(Meteor.userId())) {
            throw new Meteor.Error('Error.', 'messages.moderator')
        }

        let warning = Warnings.findOne({
            _id: projectId
        })

        if (!warning) {
            throw new Meteor.Error('Error.', 'messages.warnings.no_warning')
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