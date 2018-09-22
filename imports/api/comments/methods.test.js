import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import { Comments } from './comments'
import { News } from '/imports/api/news/news'
import { callWithPromise } from '/imports/api/utilities'

import './methods'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ profile: { name: 'Test User'} }) // stub user data as well
Meteor.user = () => ({ profile: { name: 'Test User'} })

describe('comments methods', () => {
    it('user can add a new comment', () => {
        let news = News.insert({
            headline: 'a',
            summary: 'b',
            body: 'c',
            createdBy: 'not-me',
            createdAt: new Date().getTime()
        })

        return callWithPromise('newComment', {
            text: 'Test text',
            parentId: news
        }).then(data => {
            let comment = Comments.findOne({
                _id: data
            })

            assert.ok(comment)

            assert.ok(comment.text === 'Test text')
            assert.ok(comment.parentId === news)
        })
    })

    it('user cannot add a new comment if data is missing', () => {
        let news = News.findOne({})

        return callWithPromise('newComment', {
            parentId: news._id,
            text: ''
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can edit a comment', () => {
        let comment = Comments.findOne({})

        assert.ok(comment)

        return callWithPromise('editComment', {
            commentId: comment._id,
            text: 'Text test 2'
        }).then(data => {
            let c2 = Comments.findOne({
                _id: comment._id
            })

            assert.ok(c2)

            assert.ok(c2.text === 'Text test 2')
        })
    })

    it('user cannot edit a comment the he/she didn\'t create', () => {
        let comment = Comments.insert({
            text: 'abc',
            createdBy: 'not-me',
            createdAt: new Date().getTime()
        })

        assert.ok(comment)

        return callWithPromise('editComment', {
            commentId: comment,
            text: 'Text test 2'
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can remove a comment', () => {
        let comment = Comments.findOne({
            createdBy: Meteor.userId()
        })

        assert.ok(comment)

        return callWithPromise('removeComment', {
            commentId: comment._id
        }).then(data => {
            let c2 = Comments.findOne({
                _id: comment._id
            })

            assert.notOk(c2)
        })
    })

    it('user cannot remove a comment that he/she didn\'t create', () => {
        let comment = Comments.findOne({})

        assert.ok(comment)

        return callWithPromise('removeComment', {
            commentId: comment._id
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    after(function() {
        News.remove({})
        Comments.remove({})
    })
})
