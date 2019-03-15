import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { transliterate as tr, slugify } from 'transliteration'
import { Research } from './research'
import { Comments } from '/imports/api/comments/comments'

import { isModerator, userStrike } from '/imports/api/user/methods'
import { sendNotification } from '/imports/api/notifications/methods'
import { addTranslation, removeTranslation, checkTranslation, updateTranslationSlug } from '../translationGroups/methods';

import { isTesting } from '../utilities';

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
                regEx: SimpleSchema.RegEx.Url,
                optional: false
            },
            'links.$.displayName': {
                type: String,
                optional: false
            },
        }).validator({
            clean: true
        }),
    run({ headline, abstract, pdf, captcha, links, language, original }) {
        if(Meteor.isServer) {
            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'messages.login')
            }
    
            if(!isTesting) {
                var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, captcha);
    
                if (!verifyCaptchaResponse.success) {
                    throw new Meteor.Error('messages.recaptcha');
                }
            }

            // Readble slugs with translation to English from other languages
            data.slug = slugify(data.headline)
            
            const originalDoc = original ? Research.findOne({$or: [{_id: original}, {slug: original}]}) : undefined;

            if (original && !originalDoc)
                throw new Meteor.Error('Error.', 'messages.originalNotFound');

            if (originalDoc && checkTranslation(originalDoc, language)) 
                throw new Meteor.Error('Error.', 'messages.alreadyTranslated');
            
            const id = Research.insert({
                headline: headline,
                abstract: abstract,
                pdf: pdf,
                createdAt: new Date().getTime(),
                createdBy: Meteor.userId(),
                links,
                language,
            });

            addTranslation(Research.findOne({_id: id}), language, 'research', originalDoc);

            return id;
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
            throw new Meteor.Error('Error.', 'messages.research.no_research')
        }

        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'messages.login')
        }

        if (research.createdBy !== Meteor.userId()) {
            throw new Meteor.Error('Error.', 'messages.research.cant_remove')
        }

        Comments.remove({
            newsId: researchId
        })

        removeTranslation(researchId);

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
                optional: isTesting
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
                regEx: SimpleSchema.RegEx.Url,
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
                throw new Meteor.Error('Error.', 'messages.research.no_research')
            }
    
            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'messages.login')
            }
    
            if (research.createdBy !== Meteor.userId()) {
                throw new Meteor.Error('Error.', 'messages.research.cant_edit')
            }
    
            if(!isTesting) {
                var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, captcha);
        
                if (!verifyCaptchaResponse.success) {
                    throw new Meteor.Error('messages.recaptcha');
                }
            }
    
            Research.update({
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

            updateTranslationSlug(researchId, Research.findOne({_id: researchId}).slug);
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
            throw new Meteor.Error('Error.', 'messages.research.no_research')
        }

        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'messages.login')
        }

        if ((research.flags || []).some(i => i.flaggedBy === Meteor.userId())) {
            throw new Meteor.Error('Error.', 'messages.already_flagged')
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
            throw new Meteor.Error('Error.', 'messages.login')
        }

        if (!isModerator(Meteor.userId())) {
            throw new Meteor.Error('Error.', 'messages.moderator')
        }

        let research = Research.findOne({
            _id: researchId
        })

        if (!research) {
            throw new Meteor.Error('Error.', 'messages.research.no_research')
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
