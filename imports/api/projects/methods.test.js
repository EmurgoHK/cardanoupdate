import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import { Projects } from './projects'
import { callWithPromise } from '/imports/api/utilities'

import './methods'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ profile: { name: 'Test User'}, moderator: true }) // stub user data as well
Meteor.user = () => ({ profile: { name: 'Test User'}, moderator: true })

describe('project methods', () => {
    it('user can add a new project', () => {
        return callWithPromise('addProject', {
            headline: 'Test headline',
            description: 'Test description',
            github_url: 'test'
        }).then(data => {
            let project = Projects.findOne({
                _id: data
            })

            assert.ok(project)

            assert.ok(project.headline === 'Test headline')
            assert.ok(project.description === 'Test description')
            assert.ok(project.github_url === 'test')
        })
    })

    it('user cannot add a new project if data is missing', () => {
        return callWithPromise('addProject', {
            headline: 'Test headline',
            description: ''
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can propose new data', () => {
        let project = Projects.findOne({})

        assert.ok(project)

        return callWithPromise('proposeNewData', {
            projectId: project._id,
            datapoint: 'website',
            newData: 'test',
            type: 'link'
        }).then(data => {
            let p2 = Projects.findOne({
                _id: project._id
            })

            assert.ok(p2.edits.length > 0)
            assert.ok(p2.edits[0].type === 'link')
            assert.ok(p2.edits[0].newData === 'test')
            assert.ok(p2.edits[0].datapoint === 'website')            
        })
    })

    it('moderator can approve proposed data', () => {
        let project = Projects.findOne({
            'edits.0': {
                $exists: true
            }
        })

        assert.ok(project)

        return callWithPromise('resolveProjectDataUpdate', {
            projectId: project._id,
            editId: project.edits[0]._id,
            decision: 'merge'
        }).then(data => {
            let p2 = Projects.findOne({
                _id: project._id
            })

            assert.ok(p2.edits[0].status === 'merged')
            assert.ok(p2[p2.edits[0].datapoint] === p2.edits[0].newData)
        })
    })

    it('user can edit a project', () => {
        let project = Projects.findOne({})

        assert.ok(project)

        return callWithPromise('editProject', {
            projectId: project._id,
            headline: 'Test headline 2',
            description: 'Test description 2',
            github_url: 'test',
            website: 'test web'
        }).then(data => {
            let project2 = Projects.findOne({
                _id: project._id
            })

            assert.ok(project2)

            assert.ok(project2.headline === 'Test headline 2')
            assert.ok(project2.description === 'Test description 2')
            assert.ok(project2.github_url === 'test')
            assert.ok(project2.website === 'test web')
        })
    })

    it('user cannot edit a project the he/she didn\'t create', () => {
        let project = Projects.insert({
            headline: 'a',
            description: 'b',
            createdBy: 'not-me',
            createdAt: new Date().getTime()
        })

        assert.ok(project)

        return callWithPromise('editProject', {
            projectId: project,
            headline: 'Test headline 2',
            description: 'Test description 2',
            github_url: 'test',
            website: 'test web'
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can remove a project', () => {
        let project = Projects.findOne({
            headline: 'Test headline 2'
        })

        assert.ok(project)

        return callWithPromise('deleteProject', {
            projectId: project._id
        }).then(data => {
            let project2 = Projects.findOne({
                _id: project._id
            })

            assert.notOk(project2)
        })
    })

    it('user cannot remove a project that he/she didn\'t create', () => {
        let project = Projects.findOne({})

        assert.ok(project)

        return callWithPromise('deleteProject', {
            projectId: project._id
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can flag a project', () => {
        let project = Projects.insert({
            headline: 'a',
            description: 'b',
            github_url: 'c',
            createdBy: 'not-me',
            createdAt: new Date().getTime()
        })

        assert.ok(project)

        return callWithPromise('flagProject', {
            projectId: project,
            reason: 'Test reason'
        }, (err, data) => {
            let p2 = Projects.findOne({
                _id: project
            })

            assert.ok(p2)

            assert.ok(p2.flags.length > 0)
            assert.ok(p2.flags[0].reason === 'Test reason')
        })
    })

    it('moderator can remove a flagged project', () => {
        let project = Projects.findOne({
            flags: {
                $exists: true
            }
        })

        assert.ok(project)

        return callWithPromise('resolveProjectFlags', {
            projectId: project._id,
            decision: 'remove'
        }, (err, data) => {
            let p2 = Projects.findOne({
                _id: project._id
            })

            assert.notOk(p2)
        })
    })

    after(function() {
        Projects.remove({})
    })
})
