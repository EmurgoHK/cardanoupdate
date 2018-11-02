import { socialResources } from './socialResources'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'

import { addTag, mentionTag, removeTag } from '../tags/methods';

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
        }).validator({
            clean: true
        }),
    run(data) {
        if (Meteor.isServer) {
            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You have to be logged in.')
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

            return socialResources.insert(data)
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
                throw new Meteor.Error('Error.', 'Project doesn\'t exist.')
            }

            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You have to be logged in.')
            }

            if (project.createdBy !== Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You can\'t remove a project that you haven\'t added.')
            }

            // remove mentions of tags & decrease the counter of each tag
            if(project.tags) {
                project.tags.forEach(t => {
                    removeTag(t.id)
                })
            }
            
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
        }).validator({
            clean: true
        }),
    run({ projectId, Name, description, Resource_url, tags }) {
        if (Meteor.isServer) {
            let project = socialResources.findOne({ _id: projectId })

            if (!project) {
                throw new Meteor.Error('Error.', 'Project doesn\'t exist.')
            }

            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You have to be logged in.')
            }

            if (project.createdBy !== Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You can\'t edit a project that you haven\'t added.')
            }
            
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

            return socialResources.update({
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