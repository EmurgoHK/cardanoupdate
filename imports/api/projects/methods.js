import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { Projects } from './projects'
import { Comments } from '../comments/comments'

import { isModerator, userStrike } from '/imports/api/user/methods'

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

export const flagProject = new ValidatedMethod({
    name: 'flagProject',
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
        let project = Projects.findOne({
            _id: projectId
        })

        if (!project) {
            throw new Meteor.Error('Error.', 'Project doesn\'t exist.')
        }

        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }
      
        if ((project.flags || []).some(i => i.flaggedBy === Meteor.userId())) {
            throw new Meteor.Error('Error.', 'You have already flagged this item.')
        }

        return Projects.update({
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

export const resolveProjectFlags = new ValidatedMethod({
    name: 'resolveProjectFlags',
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

        let project = Projects.findOne({
            _id: projectId
        })

        if (!project) {
            throw new Meteor.Error('Error.', 'Project doesn\'t exist.')
        }

        if (decision === 'ignore') {
            return Projects.update({
                _id: projectId
            }, {
                $set: {
                    flags: []
                }
            })
        } else {
            userStrike.call({
                userId: project.createdBy,
                type: 'project',
                token: 's3rv3r-only',
                times: 1
            }, (err, data) => {})
            
            Comments.remove({
                newsId: projectId
            })

            return Projects.remove({
                _id: projectId
            })
        }
    }
})