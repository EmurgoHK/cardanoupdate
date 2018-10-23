import { socialResources } from './socialResources'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'

export const addSocialResource = new ValidatedMethod({
    name: 'addSocialResource',
    validate:
        new SimpleSchema({
            Name: {
                type: String,
                max: 25,
                optional: false
            },
            description: {
                type: String,
                max: 500,
                optional: false
            },
            Resource_url: {
                type: String,
                optional: true
            }
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
            },Name: {
                type: String,
                max: 25,
                optional: false
            },
            description: {
                type: String,
                max: 500,
                optional: false
            },
            Resource_url: {
                type: String,
                optional: true
            }
        }).validator({
            clean: true
        }),
    run({ projectId, Name, description, Resource_url }) {
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

            return socialResources.update({
                _id: projectId
            }, {
                $set: {
                    Name: Name,
                    description: description,
                    Resource_url: Resource_url,
                    updatedAt: new Date().getTime()
                }
            })
        }
    }
})
