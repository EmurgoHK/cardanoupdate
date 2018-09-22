import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { News } from './news'

export const addNews = new ValidatedMethod({
    name: 'addNews',
    validate:
        new SimpleSchema({
            headline: {
                type: String,
                max: 140,
                optional: false
            },
            summary: {
                type: String,
                max: 500,
                optional: false
            },
            body: {
                type: String,
                optional: false
            }
        }).validator({
            clean: true
        }),
    run({ headline, summary, body }) {
		if (!Meteor.userId()) {
			throw new Meteor.Error('Error.', 'You have to be logged in.')
		}

        return News.insert({
            headline: headline,
            summary: summary,
            body: body,
            createdAt: new Date().getTime(),
            createdBy: Meteor.userId()
        })
    }
})

export const removeNews = new ValidatedMethod({
    name: 'removeNews',
    validate:
        new SimpleSchema({
            newsId: {
                type: String,
                optional: false
            }
        }).validator(),
    run({ newsId }) {
        let news = News.findOne({
            _id: newsId
        })

        if (!news) {
            throw new Meteor.Error('Error.', 'News doesn\'t exist.')
        }

        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        if (news.createdBy !== Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You can\'t remove news that you haven\'t posted.')
        }

        return News.remove({
            _id: newsId
        })
    }
})

export const editNews = new ValidatedMethod({
    name: 'editNews',
    validate:
        new SimpleSchema({
            newsId: {
                type: String,
                optional: false
            },
            headline: {
                type: String,
                max: 140,
                optional: false
            },
            summary: {
                type: String,
                max: 500,
                optional: false
            },
            body: {
                type: String,
                optional: false
            }
        }).validator({
            clean: true
        }),
    run({ newsId, headline, summary, body }) {
        let news = News.findOne({
            _id: newsId
        })

        if (!news) {
            throw new Meteor.Error('Error.', 'News doesn\'t exist.')
        }

        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        if (news.createdBy !== Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You can\'t edit news that you haven\'t posted.')
        }

        return News.update({
            _id: newsId
        }, {
            $set: {
                headline: headline,
                summary: summary,
                body: body,
                editedAt: new Date().getTime()
            }
        })
    }
})
