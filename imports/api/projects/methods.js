import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { Projects } from './projects'
import { Comments } from '../comments/comments'

import { Tags } from '/imports/api/tags/tags'
import { addTag, mentionTag, getTag } from '/imports/api/tags/methods'

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
                optional: true
            },
            website: {
                type: String,
                optional: true
            },
            tags: {
                type: Array,
                optional: true
            },
            "tags.$": {
                type: Object,
                optional: true
            },
            "tags.$.id": {
                type: String,
                optional: true
            },
            "tags.$.name": {
                type: String,
                optional: true
            },
            type: {
                type: String,
                optional: false
            }
        }).validator({
            clean: true
        }),
    run(data) {
        if (Meteor.isServer) {
            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You have to be logged in.')
            }

            data.tags = data.tags || []

            // find the type tag
            let tag = getTag(data.type) || {}

            // add it to the list of tags
            data.tags.push({
                name: data.type,
                id: tag._id // this will be undefined if the tag doesn't exist yet, so it'll be added correctly
            })
            
            if (data.tags != undefined) {
                data.tags.forEach(tag => {
                    if(tag.id && tag.id != '') {
                        // add mention
                        mentionTag(tag.id)
                    } else if(tag.name && tag.name != '') {
                        // add the tag to the list
                        tagId = addTag(tag.name)
                        tag.id = tagId
                    }
                })
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
                optional: true
            },
            website: {
                type: String,
                optional: true
            },
            tags: {
                type: Array,
                optional: true
            },
            "tags.$": {
                type: Object,
                optional: true
            },
            "tags.$.id": {
                type: String,
                optional: true
            },
            "tags.$.name": {
                type: String,
                optional: true
            },
            type: {
                type: String,
                optional: false
            }
        }).validator({
            clean: true
        }),
    run({ projectId, headline, description, github_url, website, tags, type }) {
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

            tags = tags || []

            // find the type tag
            let tag = getTag(type) || {}

            // check if it already has the type tag
            if (!tags.some(i => i.name === type)) {
                // if the type tag has changed, remove the old one
                tags = tags.filter(i => !/built-(on|for)-cardano/i.test(i.name))

                // and add the new tag
                tags.push({
                    name: type,
                    id: tag._id
                })
            }

            if (tags != undefined) {
                tags.forEach(tag => {
                    if(tag.id && tag.id != '') {
                        // add mention
                        mentionTag(tag.id)
                    } else if(tag.name && tag.name != '') {
                        // add the tag to the list
                        tagId = addTag(tag.name)
                        tag.id = tagId
                    }
                })
            }

            return Projects.update({
                _id: projectId
            }, {
                $set: {
                    headline: headline,
                    description: description,
                    github_url: github_url,
                    website: website,
                    tags: tags,
                    type: type,
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

export const proposeNewData = new ValidatedMethod({
    name: 'proposeNewData',
    validate: 
        new SimpleSchema({
            projectId: {
                type: String,
                optional: false
            },
            datapoint: {
                type: String,
                optional: false
            },
            newData: {
                type: String,
                optional: false
            },
            type: {
                type: String,
                optional: true
            }
        }).validator({
            clean: true
        }),
    run({ projectId, datapoint, newData, type }) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }
        
        let project = Projects.findOne({
            _id: projectId
        })

        if (!project) {
            throw new Meteor.Error('Error.', 'Project doesn\'t exist.')
        }

        if (project[datapoint]) {
            throw new Meteor.Error('Error.', 'Data already exists.')
        }

        Projects.update({
            _id: project._id
        }, {
            $push: {
                edits: {
                    _id: Random.id(10),
                    proposedBy: Meteor.userId(),
                    datapoint: datapoint,
                    newData: newData,
                    createdAt: new Date().getTime(),
                    status: 'open',
                    type: type || 'string'
                }
            }
        })
    }
})

export const resolveProjectDataUpdate = new ValidatedMethod({
    name: 'resolveProjectDataUpdate',
    validate:
        new SimpleSchema({
            projectId: {
                type: String,
                optional: false
            },
            editId: {
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
    run({ projectId, editId, decision }) {
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

        if (decision === 'merge') {
            let edits = project.edits || []
            let edit = {}

            edits.forEach(i => {
                if (i._id === editId) {
                    edit = i

                    i.mergedAt =  new Date().getTime()
                    i.status = 'merged'
                }
            })

            if (!edit) {
                throw new Meteor.Error('Error.', 'Edit doesn\'t exist.')
            }

            return Projects.update({
                _id: project._id
            }, {
                $set: {
                    edits: edits,
                    [edit.datapoint]: edit.newData
                }
            })
        } else {
            let edits = project.edits || []

            edits.forEach(i => {
                if (i._id === editId) {
                    i.rejectedAt =  new Date().getTime()

                    i.status = 'rejected'
                }
            })

            return Projects.update({
                _id: project._id
            }, {
                $set: {
                    edits: edits
                }
            })
        }
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

if (Meteor.isDevelopment) {
    Meteor.methods({
        generateTestChanges: () => {
            for (let i = 0; i < 2; i++) {
                Projects.insert({
                    headline: `Testing 123`,
                    description: 'Test',
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
        removeTestChanges: () => {
            for (let i = 0; i < 2; i++) {
                Projects.remove({
                    headline: `Testing 123`,
                })
            }
        }
    })
}
