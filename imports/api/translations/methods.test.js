import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import { Translations } from './translations'

import { callWithPromise } from '/imports/api/utilities'

import './methods'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ profile: { name: 'Test User'}, moderator: true }) // stub user data as well
Meteor.user = () => ({ profile: { name: 'Test User'}, moderator: true })

describe('translation methods', () => {
    it('user can save language data', () => {
        return callWithPromise('saveLanguageData', 'test-scope', 'en', 'English', {
            test: 'testing'
        }).then(data => {
            let translation = Translations.findOne({})

            assert.ok(translation)

            assert.equal(translation.scope, 'test-scope')
            assert.equal(translation.language, 'en')
            assert.equal(translation.languageName, 'English')
            assert.equal(translation.status, 'new')
            assert.equal(translation.data.test, 'testing')

            assert.ok(~translation.authors.indexOf(Meteor.userId()))
        })
    })

    it('moderators can vote on translations', () => {
        let translation = Translations.findOne({})

        assert.ok(translation)

        return callWithPromise('translationVote', translation._id, 'voteUp').then(data => {
            let tr = Translations.findOne({})

            assert.ok(tr)

            assert.equal(tr.score, 1)
            assert.equal(tr.upvotes, 1)

            assert.ok(tr.votes[0])

            assert.equal(tr.votes[0].userId, Meteor.userId())
            assert.equal(tr.votes[0].type, 'voteUp')
        })
    })

    it('getLanguageScopes works correctly', () => {
        return callWithPromise('getLanguageScopes', 'en').then(data => {
            assert.ok(data)

            assert.ok(data.length)
        })
    })

    it('getLanguageData works correctly', () => {
        return callWithPromise('getLanguageData', 'comments', 'en').then(data => {
            assert.ok(data)

            assert.ok(data.comments.flag)
        })
    })

    after(function() {
        Translations.remove({})
    })
})
