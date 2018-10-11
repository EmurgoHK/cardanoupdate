import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import { Research } from './research'
import { callWithPromise } from '/imports/api/utilities'

import './methods'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ profile: { name: 'Test User'}, moderator: true }) // stub user data as well
Meteor.user = () => ({ profile: { name: 'Test User'}, moderator: true })

describe('research methods', () => {
    it('user can add a new research item', () => {
        return callWithPromise('newResearch', {
            headline: 'Test headline',
            abstract: 'Test abstract',
            pdf: '/test.pdf'
        }).then(data => {
            let research = Research.findOne({
                _id: data
            })

            assert.ok(research)

            assert.ok(research.headline === 'Test headline')
            assert.ok(research.abstract === 'Test abstract')
            assert.ok(research.pdf === '/test.pdf')
        })
    })

    it('user cannot add a new research item if data is missing', () => {
        return callWithPromise('newResearch', {
            headline: 'Test headline',
            abstract: ''
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can edit a research item', () => {
        let research = Research.findOne({})

        assert.ok(research)

        return callWithPromise('editResearch', {
            researchId: research._id,
            headline: 'Test headline 2',
            abstract: 'Test abstract 2',
            pdf: '/test2.pdf'
        }).then(data => {
            let research2 = Research.findOne({
                _id: research._id
            })

            assert.ok(research2)

            assert.ok(research2.headline === 'Test headline 2')
            assert.ok(research2.abstract === 'Test abstract 2')
            assert.ok(research2.pdf === '/test2.pdf')
        })
    })

    it('user cannot edit a research item the he/she didn\'t create', () => {
        let research = Research.insert({
            headline: 'a',
            abstract: 'b',
            pdf: 'c',
            createdBy: 'not-me',
            createdAt: new Date().getTime()
        })

        assert.ok(research)

        return callWithPromise('editResearch', {
            researchId: research,
            headline: 'Test headline 2',
            abstract: 'Test abstract 2',
            pdf: '/test2.pdf'
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can remove a research item', () => {
        let research = Research.findOne({
            headline: 'Test headline 2'
        })

        assert.ok(research)

        return callWithPromise('removeResearch', {
            researchId: research._id
        }).then(data => {
            let research2 = Research.findOne({
                _id: research._id
            })

            assert.notOk(research2)
        })
    })

    it('user cannot remove a research item that he/she didn\'t create', () => {
        let research = Research.findOne({})

        assert.ok(research)

        return callWithPromise('removeResearch', {
            researchId: research._id
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can flag a research item', () => {
        let research = Research.insert({
            headline: 'a',
            abstract: 'b',
            pdf: 'c',
            createdBy: 'not-me',
            createdAt: new Date().getTime()
        })

        assert.ok(research)

        return callWithPromise('flagResearch', {
            researchId: research,
            reason: 'Test reason'
        }, (err, data) => {
            let n2 = Research.findOne({
                _id: research
            })

            assert.ok(n2)

            assert.ok(n2.flags.length > 0)
            assert.ok(n2.flags[0].reason === 'Test reason')
        })
    })

    it('moderator can remove a flagged research item', () => {
        let research = Research.findOne({
            flags: {
                $exists: true
            }
        })

        assert.ok(research)

        return callWithPromise('resolveResearchFlags', {
            researchId: research._id,
            decision: 'remove'
        }, (err, data) => {
            let n2 = Research.findOne({
                _id: research._id
            })

            assert.notOk(n2)
        })
    })

    after(function() {
        Research.remove({})
    })
})
