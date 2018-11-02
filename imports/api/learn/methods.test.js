import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import { Learn } from './learn'
import { callWithPromise } from '/imports/api/utilities'

import './methods'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ _id: 'test-user', profile: { name: 'Test User'}, moderator: true }) // stub user data as well
Meteor.user = () => ({ _id: 'test-user', profile: { name: 'Test User'}, moderator: true })

describe('Learning items methods', () => {
    it('user can add a new learning item', () => {
        return callWithPromise('newLearningItem', {
            title: 'Test title',
            content: 'Test content',
            summary: 'Test summary'
        }).then(data => {
            let learn = Learn.findOne({
                _id: data
            })

            assert.ok(learn)

            assert.ok(learn.title === 'Test title')
            assert.ok(learn.summary === 'Test summary')
            assert.ok(learn.content === 'Test content')
        })
    })

    it('user cannot add a new learning item if data is missing', () => {
        return callWithPromise('newLearningItem', {
            title: 'Test title'
        }).then(data => {
            assert.fail('Learning item added without all required parameters.')
        }).catch(error => {
            assert.ok(error)
        })
    })

    it('user can edit a learning item', () => {
        let learn = Learn.findOne({})

        assert.ok(learn)

        return callWithPromise('editLearningItem', {
            learnId: learn._id,
            title: 'Test title 2',
            summary: 'Test summary 2',
            content: 'Test content 2'
        }).then(data => {
            let l2 = Learn.findOne({
                _id: learn._id
            })

            assert.ok(l2)

            assert.ok(l2.title === 'Test title 2')
            assert.ok(l2.content === 'Test content 2')
            assert.ok(l2.summary === 'Test summary 2')
        })
    })

    it('user cannot edit a learning item the he/she didn\'t create', () => {
        let learn = Learn.insert({
            title: 'a',
            summary : 's',
            content: 'b',
            createdBy: 'not-me',
            createdAt: new Date().getTime()
        })

        assert.ok(learn)

        return callWithPromise('editLearningItem', {
            learnId: learn,
            title: 'Test title 2',
            summary: 'Test summary 2',
            content: 'Test content 2'
        }).then(data => {
            assert.fail('Learning item was edited by the user that didn\'t create it.')
        }).catch(error => {
            assert.ok(error)
        })
    })

    it('user can remove a learning item', () => {
        let learn = Learn.findOne({
            title: 'Test title 2'
        })

        assert.ok(learn)

        return callWithPromise('removeLearningItem', {
            learnId: learn._id
        }).then(data => {
            let learn2 = Learn.findOne({
                _id: learn._id
            })

            assert.notOk(learn2)
        })
    })

    it('user cannot remove a learning item that he/she didn\'t create', () => {
        let learn = Learn.findOne({})

        assert.ok(learn)

        return callWithPromise('removeLearningItem', {
            learnId: learn._id
        }).then(data => {
            assert.fail('Learning item was removed by a user that didn\'t create it.')
        }).catch(error => {
            assert.ok(error)
        })
    })

    it('user can flag a learning item', () => {
        let learn = Learn.insert({
            title: 'a',
            summary: 's',
            content: 'b',
            createdBy: 'not-me',
            createdAt: new Date().getTime()
        })

        assert.ok(learn)

        return callWithPromise('flagLearningItem', {
            learnId: learn,
            reason: 'Test reason'
        }, (err, data) => {
            let n2 = Learn.findOne({
                _id: learn
            })

            assert.ok(n2)

            assert.ok(n2.flags.length > 0)
            assert.ok(n2.flags[0].reason === 'Test reason')
        })
    })

    it('moderator can remove a flagged learning item', () => {
        let learn = Learn.findOne({
            flags: {
                $exists: true
            }
        })

        assert.ok(learn)

        return callWithPromise('resolveLearningItemFlags', {
            learnId: learn._id,
            decision: 'remove'
        }, (err, data) => {
            let n2 = Learn.findOne({
                _id: learn._id
            })

            assert.notOk(n2)
        })
    })

    after(function() {
        Learn.remove({})
    })
})
