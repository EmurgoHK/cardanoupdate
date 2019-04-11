import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import { transliterate as tr, slugify } from 'transliteration'
import { socialResources } from './socialResources'
import { Comments } from '/imports/api/comments/comments'

import { isModerator, userStrike } from '/imports/api/user/methods'
import { addTag, mentionTag, removeTag } from '../tags/methods';
import { addTranslation, removeTranslation, checkTranslation, updateTranslationSlug } from '../translationGroups/methods';

import { isTesting } from '../utilities';
import { tweet } from '../twitter';

function guessResourceType(url) {
    if (!url) return "UNKNOWN";
    
    // Strip off protocol and/or www. from the start
    url = url.replace(/^(https?:\/\/)?(www\.)?/, '');

    if (url.startsWith('t.me/') || url.startsWith('telegram.me/')) return 'TELEGRAM';
    if (url.startsWith('facebook.com/')) return 'FACEBOOK';
    if (url.startsWith('twitter.com/')) return 'TWITTER';
    if (url.startsWith('discord.gg/')) return 'DISCORD';
    if (url.startsWith('slack.com/')) return 'SLACK';
    if (url.startsWith('gitter.im/')) return 'GITTER';

    return "UNKNOWN";
}

export const addSocialResource = new ValidatedMethod({
    name: 'addSocialResource',
    validate:
        new SimpleSchema({
            Name: {
                type: String,
                max: 90,
                optional: false
            },
            description: {
                type: String,
                max: 260,
                optional: false
            },
            Resource_url: {
                type: String,
                regEx: SimpleSchema.RegEx.Url,
                optional: true
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

            data.resourceUrlType = guessResourceType(data.Resource_url);

            if (data.tags) {
                data.tags.forEach(tag => {
                    if (tag.id) {
                        mentionTag(tag.id)
                    } else if (tag.name) {
                        tagId = addTag(tag.name)
                        tag.id = tagId
                    }
                })
            }
            
            // Readble slugs with translation to English from other languages
            data.slug = slugify(data.Name);

            const original = data.original ? socialResources.findOne({$or: [{_id: data.original}, {slug: data.original}]}) : undefined;
            
            if (data.original && !original)
              throw new Meteor.Error('Error.', 'messages.originalNotFound');
            delete data.original;
            
            if (original && checkTranslation(original, data.language)) 
              throw new Meteor.Error('Error.', 'messages.alreadyTranslated');

            const id = socialResources.insert(data);
      
            addTranslation(socialResources.findOne({_id: id}), data.language, 'socialResource', original);

            tweet(`New Community: ${data.Name} https://cardanoupdate.space/community/${_id} #Cardano`);

            return id;
        }
    }
})

export const deleteSocialResource = new ValidatedMethod({
    name: 'deleteSocialResource',
    validate:
        new SimpleSchema({
            projectId: {
                type: String,
                optional: false
            }
        }).validator(),
    run({ projectId }) {
        if (Meteor.isServer) {
            let project = socialResources.findOne({ _id: projectId })

            if (!project) {
                throw new Meteor.Error('Error.', 'messages.communities.no_community')
            }

            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'messages.login')
            }

            if (project.createdBy !== Meteor.userId()) {
                throw new Meteor.Error('Error.', 'messages.communities.cant_remove')
            }

            // remove mentions of tags & decrease the counter of each tag
            if(project.tags) {
                project.tags.forEach(t => {
                    removeTag(t.id)
                })
            }

            removeTranslation(projectId);
            
            return socialResources.remove({ _id: projectId })
        }
    }
})

export const editSocialResource = new ValidatedMethod({
    name: 'editSocialResource',
    validate:
        new SimpleSchema({
            projectId: {
                type: String,
                optional: false
            },
            Name: {
                type: String,
                max: 90,
                optional: false
            },
            description: {
                type: String,
                max: 260,
                optional: false
            },
            Resource_url: {
                type: String,
                regEx: SimpleSchema.RegEx.Url,
                optional: true
            },
            captcha: {
                type: String,
                optional: isTesting
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
            },
        }).validator({
            clean: true
        }),
    run({ projectId, Name, description, Resource_url, captcha, tags }) {
        if (Meteor.isServer) {
            let project = socialResources.findOne({ _id: projectId })

            if (!project) {
                throw new Meteor.Error('Error.', 'messages.communities.no_community')
            }

            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'messages.login')
            }

            if (project.createdBy !== Meteor.userId()) {
                throw new Meteor.Error('Error.', 'messages.communities.cant_edit')
            }

            if(!isTesting) {
                var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, captcha);

                if (!verifyCaptchaResponse.success) {
                    throw new Meteor.Error('messages.recaptcha');
                } else
                    console.log('reCAPTCHA verification passed!');
            }

            project.tags.filter(tag => 
                !tags.some(t => t.id == tag.id)).forEach(tag => {
                    removeTag(tag.id)
                })
                
            if (tags) {
                tags.filter(tag => // We filter out tags that are already on the resource to make edit not increase mentions.
                        !tag.id || // If we didn't get an id it's a new tag
                        !project.tags || // If we didn't have tags all tags are new
                        !project.tags.some(oldTag => oldTag.id === tag.id)) // If we can't find an old tag with the same id it's new
                    .forEach(tag => {
                        if (tag.id) {
                            mentionTag(tag.id)
                        } else if (tag.name) {
                            tagId = addTag(tag.name)
                            tag.id = tagId
                        }
                })
            }

            resourceUrlType = guessResourceType(Resource_url);

            socialResources.update({
                _id: projectId
            }, {
                $set: {
                    Name: Name,
                    description: description,
                    Resource_url: Resource_url,
                    updatedAt: new Date().getTime(),
                    resourceUrlType: resourceUrlType,
                    tags,
                }
            })

            updateTranslationSlug(projectId, socialResources.findOne({_id: projectId}).slug);
        }
    }
});


export const updateResourceUrlTypes = new ValidatedMethod({
    name: 'updateResourceUrlTypes',
    validate: new SimpleSchema({}).validator({
      clean: true
    }),
    run({}) {
        const resources = socialResources.find({}).fetch();

        for (const res of resources) {
            const guessedType = guessResourceType(res.Resource_url);

            if (res.resourceUrlType !== guessedType) { // Only update where necessary
                socialResources.update({_id: res._id}, {$set: {resourceUrlType: guessedType}});
            }
        }
    }
  });

export const addTestSocialResource = new ValidatedMethod({
    name: 'addTestSocialResource',
    validate:
        new SimpleSchema({
            Name: {
                type: String,
                max: 90,
                optional: false
            },
            description: {
                type: String,
                max: 260,
                optional: false
            },
            Resource_url: {
                type: String,
                optional: true
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
            },
            'createdBy' : {
                type: String,
                optional: true,
            },
            'createdAt': {
                type: Number,
                optional: true,
            },
            language: {
                type: String,
                optional: true, // This is optional to allow adding resources in test that look like ones from before translations
            },
        }).validator({
            clean: true
        }),
    run(data) {
        if (!isTesting) {
            throw new Meteor.Error('Error.', 'This is a testing only method');
        }

        if (Meteor.isServer) {
            if (!data.createdBy)
                data.createdBy = 'other-test-user-id';
            if (!data.createdAt)
                data.createdAt = new Date().getTime()

            data.resourceUrlType = guessResourceType(data.Resource_url);

            if (data.tags) {
                data.tags.forEach(tag => {
                    if (tag.id) {
                        mentionTag(tag.id)
                    } else if (tag.name) {
                        tagId = addTag(tag.name)
                        tag.id = tagId
                    }
                })
            }

            return socialResources.insert(data)
        }
    }
})

export const deleteTestSocialResource = new ValidatedMethod({
    name: 'deleteTestSocialResource',
    validate:
        new SimpleSchema({
            id: {
                type: String,
                optional: true
            },
        }).validator({
            clean: true
        }),
    run({id}) {
        if (!isTesting) {
            throw new Meteor.Error('Error.', 'This is a testing only method');
        }

        let projects = id ? [socialResources.findOne({ _id: id })] : socialResources.find({createdBy: 'other-test-user-id'}).fetch();
        for (const project of projects) {
            // remove mentions of tags & decrease the counter of each tag
            if(project.tags) {
                project.tags.forEach(t => {
                    removeTag(t.id)
                })
            }
        
            socialResources.remove({ _id: project._id });
        }
    }
})
export const flagSocialResource = new ValidatedMethod({
    name: 'flagSocialResource',
    validate:
        new SimpleSchema({
            socialResourceId: {
                type: String,
                optional: false
            },
            reason: {
                type: String,
                max: 1000,
                optional: false
            },
            remark: {
                type: String,
                optional: true
            }
        }).validator({
            clean: true
        }),
    run({ socialResourceId, reason, remark }) {
        let socialResource = socialResources.findOne({
            _id: socialResourceId
        })

        if (!socialResource) {
            throw new Meteor.Error('Error.', 'messages.communities.no_community')
        }

        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'messages.login')
        }

        if ((socialResource.flags || []).some(i => i.flaggedBy === Meteor.userId())) {
            throw new Meteor.Error('Error.', 'messages.already_flagged')
        }

        return socialResources.update({
            _id: socialResourceId
        }, {
            $push: {
                flags: {
                    reason: reason,
                    remark: remark,
                    flaggedBy: Meteor.userId(),
                    flaggedAt: new Date().getTime()
                }
            }
        })
    }
});

export const resolveSocialResourceFlags = new ValidatedMethod({
    name: 'resolveSocialResourceFlags',
    validate:
        new SimpleSchema({
            socialResourceId: {
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
    run({ socialResourceId, decision }) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'messages.login')
        }

        if (!isModerator(Meteor.userId())) {
            throw new Meteor.Error('Error.', 'messages.moderator')
        }

        let socialResource = socialResources.findOne({
            _id: socialResourceId
        })

        if (!socialResource) {
            throw new Meteor.Error('Error.', 'messages.communities.no_community')
        }

        if (decision === 'ignore') {
            return socialResources.update({
                _id: socialResourceId
            }, {
                $set: {
                    flags: []
                }
            })
        } else {
            userStrike.call({
                userId: socialResource.createdBy,
                type: 'socialResource',
                token: 's3rv3r-only',
                times: 1
            }, (err, data) => {})

            Comments.remove({
                newsId: socialResourceId
            })

            return socialResources.remove({
                _id: socialResourceId
            })
        }
    }
});