import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { Research } from './research'
import { Comments } from '/imports/api/comments/comments'

import { isModerator, userStrike } from '/imports/api/user/methods'

import { sendNotification } from '/imports/api/notifications/methods'

export const newResearch = new ValidatedMethod({
    name: 'newResearch',
    validate:
        new SimpleSchema({
            headline: {
                type: String,
                max: 160,
                optional: false
            },
            abstract: {
                type: String,
                // max: 1000,
                optional: false
            },
            pdf: {
                type: String,
                optional: false
            },
            captcha: {
                type: String,
                optional: false
            },
            links: {
                type: Array,
                optional: true
            },
            'links.$': {
                type: Object,
                optional: true
            },
            'links.$.url': {
                type: String,
                optional: false
            },
            'links.$.displayName': {
                type: String,
                optional: false
            },
        }).validator({
            clean: true
        }),
    run({ headline, abstract, pdf, captcha, links }) {
        if(Meteor.isServer) {
            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You have to be logged in.')
            }
    
            if(captcha != '_test_captcha_') {
                var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, captcha);
    
                if (!verifyCaptchaResponse.success) {
                    throw new Meteor.Error('recaptcha failed please try again');
                }
            }
            
            return Research.insert({
                headline: headline,
                abstract: abstract,
                pdf: pdf,
                createdAt: new Date().getTime(),
                createdBy: Meteor.userId(),
                links,
            })
        }
    }
})

export const removeResearch = new ValidatedMethod({
    name: 'removeResearch',
    validate:
        new SimpleSchema({
            researchId: {
                type: String,
                optional: false
            }
        }).validator(),
    run({ researchId }) {
        let research = Research.findOne({
            _id: researchId
        })

        if (!research) {
            throw new Meteor.Error('Error.', 'Research doesn\'t exist.')
        }

        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        if (research.createdBy !== Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You can\'t remove research that you haven\'t posted.')
        }

        Comments.remove({
            newsId: researchId
        })

        return Research.remove({
            _id: researchId
        })
    }
})

export const editResearch = new ValidatedMethod({
    name: 'editResearch',
    validate:
        new SimpleSchema({
            researchId: {
                type: String,
                optional: false
            },
            headline: {
                type: String,
                max: 160,
                optional: false
            },
            abstract: {
                type: String,
                // max: 1000,
                optional: false
            },
            pdf: {
                type: String,
                optional: false
            },
            captcha: {
                type: String,
                optional: false
            },
            links: {
                type: Array,
                optional: true
            },
            'links.$': {
                type: Object,
                optional: true
            },
            'links.$.url': {
                type: String,
                optional: false
            },
            'links.$.displayName': {
                type: String,
                max: 25,
                optional: false
            },
        }).validator({
            clean: true
        }),
    run({ researchId, headline, abstract, pdf, captcha, links }) {
        if(Meteor.isServer) {
            let research = Research.findOne({
                _id: researchId
            })
    
            if (!research) {
                throw new Meteor.Error('Error.', 'Research doesn\'t exist.')
            }
    
            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You have to be logged in.')
            }
    
            if (research.createdBy !== Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You can\'t edit research that you haven\'t posted.')
            }
    
            if(captcha != '_test_captcha_') {
                var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, captcha);
        
                if (!verifyCaptchaResponse.success) {
                    throw new Meteor.Error('recaptcha failed please try again');
                }
            }
    
            return Research.update({
                _id: researchId
            }, {
                $set: {
                    headline: headline,
                    abstract: abstract,
                    pdf: pdf,
                    editedAt: new Date().getTime(),
                    links,
                }
            })
        }
    }
})

export const flagResearch = new ValidatedMethod({
    name: 'flagResearch',
    validate:
        new SimpleSchema({
            researchId: {
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
    run({ researchId, reason }) {
        let research = Research.findOne({
            _id: researchId
        })

        if (!research) {
            throw new Meteor.Error('Error.', 'Research doesn\'t exist.')
        }

        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        if ((research.flags || []).some(i => i.flaggedBy === Meteor.userId())) {
            throw new Meteor.Error('Error.', 'You have already flagged this item.')
        }

        return Research.update({
            _id: researchId
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

export const resolveResearchFlags = new ValidatedMethod({
    name: 'resolveResearchFlags',
    validate:
        new SimpleSchema({
            researchId: {
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
    run({ researchId, decision }) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        if (!isModerator(Meteor.userId())) {
            throw new Meteor.Error('Error.', 'You have to be a moderator.')
        }

        let research = Research.findOne({
            _id: researchId
        })

        if (!research) {
            throw new Meteor.Error('Error.', 'Research doesn\'t exist.')
        }

        if (decision === 'ignore') {
            return Research.update({
                _id: researchId
            }, {
                $set: {
                    flags: []
                }
            })
        } else {
            userStrike.call({
                userId: research.createdBy,
                type: 'research',
                token: 's3rv3r-only',
                times: 1
            }, (err, data) => {})

            Comments.remove({
                newsId: researchId
            })

            return Research.remove({
                _id: researchId
            })
        }
    }
})
