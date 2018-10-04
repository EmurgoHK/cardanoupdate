import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import { News } from './news'
import { callWithPromise } from '/imports/api/utilities'

import './methods'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ profile: { name: 'Test User'}, moderator: true }) // stub user data as well
Meteor.user = () => ({ profile: { name: 'Test User'}, moderator: true })

describe('news methods', () => {
    it('user can add a new news item', () => {
        return callWithPromise('addNews', {
            headline: 'Test headline',
            summary: 'Test summary',
            body: 'Test body',
            image: '/images/test.png'
        }).then(data => {
            let news = News.findOne({
                _id: data
            })

            assert.ok(news)

            assert.ok(news.headline === 'Test headline')
            assert.ok(news.summary === 'Test summary')
            assert.ok(news.body === 'Test body')
            assert.ok(news.image === '/images/test.png')
        })
    })

    it('user can toggle watch status', () => {
        let news = News.findOne({})

        assert.ok(news)

        return callWithPromise('toggleWatchNews', {
            newsId: news._id
        }).then(data => {
            let news2 = News.findOne({
                _id: news._id
            })

            assert.ok(news2)

            assert.ok(!~news2.subscribers.indexOf(Meteor.userId()))
        })
    })

    it('user can vote', () => {
        let news = News.findOne({})

        assert.ok(news)

        return callWithPromise('voteNews', {
            newsId: news._id,
            vote: 'up'
        }).then(data => {
            let news2 = News.findOne({
                _id: news._id
            })

            assert.ok(news2)

            assert.ok(news2.votes.length > 0)
            assert.ok(news2.votes.some(i => i.votedBy === Meteor.userId() && i.vote === 'up'))
        })
    })

    it('user cannot add a new news item if data is missing', () => {
        return callWithPromise('addNews', {
            headline: 'Test headline',
            summary: '',
            body: 'Test body'
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can edit a news item', () => {
        let news = News.findOne({})

        assert.ok(news)

        return callWithPromise('editNews', {
            newsId: news._id,
            headline: 'Test headline 2',
            summary: 'Test summary 2',
            body: 'Test body 2',
            image: '/images/test2.png'
        }).then(data => {
            let news2 = News.findOne({
                _id: news._id
            })

            assert.ok(news2)

            assert.ok(news2.headline === 'Test headline 2')
            assert.ok(news2.summary === 'Test summary 2')
            assert.ok(news2.body === 'Test body 2')
            assert.ok(news2.image === '/images/test2.png')
        })
    })

    it('user cannot edit a news item the he/she didn\'t create', () => {
        let news = News.insert({
            headline: 'a',
            summary: 'b',
            body: 'c',
            createdBy: 'not-me',
            createdAt: new Date().getTime()
        })

        assert.ok(news)

        return callWithPromise('editNews', {
            newsId: news,
            headline: 'Test headline 2',
            summary: 'Test summary 2',
            body: 'Test body 2'
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can remove a news item', () => {
        let news = News.findOne({
            headline: 'Test headline 2'
        })

        assert.ok(news)

        return callWithPromise('removeNews', {
            newsId: news._id
        }).then(data => {
            let news2 = News.findOne({
                _id: news._id
            })

            assert.notOk(news2)
        })
    })

    it('user cannot remove a news item that he/she didn\'t create', () => {
        let news = News.findOne({})

        assert.ok(news)

        return callWithPromise('removeNews', {
            newsId: news._id
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can flag a news item', () => {
        let news = News.insert({
            headline: 'a',
            summary: 'b',
            body: 'c',
            createdBy: 'not-me',
            createdAt: new Date().getTime()
        })

        assert.ok(news)

        return callWithPromise('flagNews', {
            newsId: news,
            reason: 'Test reason'
        }, (err, data) => {
            let n2 = News.findOne({
                _id: news
            })

            assert.ok(n2)

            assert.ok(n2.flags.length > 0)
            assert.ok(n2.flags[0].reason === 'Test reason')
        })
    })

    it('moderator can remove a flagged news item', () => {
        let news = News.findOne({
            flags: {
                $exists: true
            }
        })

        assert.ok(news)

        return callWithPromise('resolveNewsFlags', {
            newsId: news._id,
            decision: 'remove'
        }, (err, data) => {
            let n2 = News.findOne({
                _id: news._id
            })

            assert.notOk(n2)
        })
    })

    after(function() {
        News.remove({})
    })
})
