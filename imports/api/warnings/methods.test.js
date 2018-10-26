import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import { Warnings } from './warnings'
import { callWithPromise } from '/imports/api/utilities'

import './methods'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ profile: { name: 'Test User'}, moderator: true }) // stub user data as well
Meteor.user = () => ({ profile: { name: 'Test User'}, moderator: true })

describe('warning methods', () => {
    it('user can add a new warning', () => {
        return callWithPromise('addWarning', {
            headline: 'Test headline',
            summary: 'Test summary',
            github_url: 'test',
            type: 'built-on-cardano'
        }).then(data => {
            let warning = Warnings.findOne({
                _id: data
            })

            assert.ok(warning)

            assert.ok(warning.headline === 'Test headline')
            assert.ok(warning.summary === 'Test summary')
            assert.ok(warning.github_url === 'test')
            assert.ok(warning.type === 'built-on-cardano')
        })
    })

    it('user cannot add a new warning if data is missing', () => {
        return callWithPromise('addWarning', {
            headline: 'Test headline',
            summary: ''
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    // Remove the comments if user is allowed to propose data
    /*
    it('user can propose new data', () => {
        let project = Warnings.findOne({})
        assert.ok(project)
        return callWithPromise('proposeNewDataWarning', {
            projectId: project._id,
            datapoint: 'website',
            newData: 'test',
            type: 'link'
        }).then(data => {
            let p2 = Warnings.findOne({
                _id: project._id
            })
            assert.ok(p2.edits.length > 0)
            assert.ok(p2.edits[0].type === 'link')
            assert.ok(p2.edits[0].newData === 'test')
            assert.ok(p2.edits[0].datapoint === 'website')            
        })
    })
    
    it('moderator can approve proposed data', () => {
        let warning = Warnings.findOne({
            'edits.0': {
                $exists: true
            }
        })
        assert.ok(warning)
        return callWithPromise('resolveProjectDataUpdate', {
            projectId: warning._id,
            editId: warning.edits[0]._id,
            decision: 'merge'
        }).then(data => {
            let w2 = Warnings.findOne({
                _id: warning._id
            })
            assert.ok(w2.edits[0].status === 'merged')
            assert.ok(w2[w2.edits[0].datapoint] === w2.edits[0].newData)
        })
    })
    */
   
    it('user can edit a warning', () => {
        let warning = Warnings.findOne({})

        assert.ok(warning)

        return callWithPromise('editWarning', {
            projectId: warning._id,
            headline: 'Test headline 2',
            summary: 'Test summary 2',
            github_url: 'test',
            website: 'test web',
            type: 'built-for-cardano'
        }).then(data => {
            let warning2 = Warnings.findOne({
                _id: warning._id
            })

            assert.ok(warning2)

            assert.ok(warning2.headline === 'Test headline 2')
            assert.ok(warning2.summary === 'Test summary 2')
            assert.ok(warning2.github_url === 'test')
            assert.ok(warning2.website === 'test web')
            assert.ok(warning2.type === 'built-for-cardano')
        })
    })

    it('user cannot edit a warning the he/she didn\'t create', () => {
        let warning = Warnings.insert({
            headline: 'a',
            summary: 'b',
            createdBy: 'not-me',
            createdAt: new Date().getTime()
        })

        assert.ok(warning)

        return callWithPromise('editWarning', {
            projectId: warning,
            headline: 'Test headline 2',
            summary: 'Test summary 2',
            github_url: 'test',
            website: 'test web'
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can remove a warning', () => {
        let warning = Warnings.findOne({
            headline: 'Test headline 2'
        })

        assert.ok(warning)

        return callWithPromise('deleteWarning', {
            projectId: warning._id
        }).then(data => {
            let warning2 = Warnings.findOne({
                _id: warning._id
            })

            assert.notOk(warning2)
        })
    })

    it('user cannot remove a warning that he/she didn\'t create', () => {
        let warning = Warnings.findOne({})

        assert.ok(warning)

        return callWithPromise('deleteWarning', {
            projectId: warning._id
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can flag a warning', () => {
        let warning = Warnings.insert({
            headline: 'a',
            summary: 'b',
            github_url: 'c',
            createdBy: 'not-me',
            createdAt: new Date().getTime()
        })

        assert.ok(warning)

        return callWithPromise('flagWarning', {
            projectId: warning,
            reason: 'Test reason'
        }, (err, data) => {
            let p2 = Warnings.findOne({
                _id: warning
            })

            assert.ok(p2)

            assert.ok(p2.flags.length > 0)
            assert.ok(p2.flags[0].reason === 'Test reason')
        })
    })

    it('moderator can remove a flagged project', () => {
        let warning = Warnings.findOne({
            flags: {
                $exists: true
            }
        })

        assert.ok(warning)

        return callWithPromise('resolveWarningFlags', {
            projectId: warning._id,
            decision: 'remove'
        }, (err, data) => {
            let p2 = Warnings.findOne({
                _id: warning._id
            })

            assert.notOk(p2)
        })
    })

    after(function() {
        Warnings.remove({})
    })
})