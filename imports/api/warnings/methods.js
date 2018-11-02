import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { Warnings } from './warnings'
import { Comments } from '../comments/comments'

import { isModerator, userStrike } from '/imports/api/user/methods'

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
            }
        }).validator({
            clean: true
        }),
    run(data) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        data.createdBy = Meteor.userId()
        data.createdAt = new Date().getTime()

        return Warnings.insert(data)
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
            }
        }).validator({
            clean: true
        }),
    run({ projectId, headline, summary }) {
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


// Remove comments if the user is allowed to propose changes

/*
export const proposeNewDataWarning = new ValidatedMethod({
    name: 'proposeNewDataWarning',
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
        
        let warning = Warnings.findOne({
            _id: projectId
        })
        if (!warning) {
            throw new Meteor.Error('Error.', 'Project doesn\'t exist.')
        }
        if (warning[datapoint]) {
            throw new Meteor.Error('Error.', 'Data already exists.')
        }
        console.log('here')
        Warnings.update({
            _id: warning._id
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
export const resolveWarningDataUpdate = new ValidatedMethod({
    name: 'resolveWarningDataUpdate',
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
        let project = Warnings.findOne({
            _id: projectId
        })
        if (!project) {
            throw new Meteor.Error('Error.', 'Warning doesn\'t exist.')
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
            return Warnings.update({
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
            return Warnings.update({
                _id: project._id
            }, {
                $set: {
                    edits: edits
                }
            })
        }
    }
})
*/

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