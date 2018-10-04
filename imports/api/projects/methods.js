import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { Projects } from './projects'

export const addProject = new ValidatedMethod({
    name: 'addProject',
    validate:
        new SimpleSchema({
            headline: {
                type: String,
                max: 100,
                optional: false
            },
            description: {
                type: String,
                max: 500,
                optional: false
            },
            github_url: {
                type: String,
                optional: false
            },
            website: {
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
            return Projects.insert(data)
        }
    }
})

export const deleteProject = new ValidatedMethod({
    name: 'deleteProject',
    validate:
        new SimpleSchema({
            projectId: {
                type: String,
                optional: false
            }
        }).validator(),
    run({ projectId }) {
        if (Meteor.isServer) {
            let project = Projects.findOne({ _id: projectId })

            if (!project) {
                throw new Meteor.Error('Error.', 'Project doesn\'t exist.')
            }

            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You have to be logged in.')
            }

            if (project.createdBy !== Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You can\'t remove a project that you haven\'t added.')
            }

            return Projects.remove({ _id: projectId })
        }
    }
})

export const editProject = new ValidatedMethod({
    name: 'editProject',
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
            description: {
                type: String,
                max: 500,
                optional: false
            },
            github_url: {
                type: String,
                optional: false
            },
            website: {
                type: String,
                optional: true
            }
        }).validator({
            clean: true
        }),
    run({ projectId, headline, description, github_url, website }) {
        if (Meteor.isServer) {
            let project = Projects.findOne({ _id: projectId })

            if (!project) {
                throw new Meteor.Error('Error.', 'Project doesn\'t exist.')
            }

            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You have to be logged in.')
            }

            if (project.createdBy !== Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You can\'t edit a project that you haven\'t added.')
            }

            return Projects.update({
                _id: projectId
            }, {
                $set: {
                    headline: headline,
                    description: description,
                    github_url: github_url,
                    website: website,
                    updatedAt: new Date().getTime()
                }
            })
        }
    }
})