import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { News } from './news'

import { sendNotification } from '/imports/api/notifications/methods'

export const addToSubscribers = (newsId, userId) => {
    let news = News.findOne({
        _id: newsId
    })

    News.update({
        _id: newsId
    }, {
        $addToSet: {
            subscribers: userId
        }
    })
}

export const sendToSubscribers = (newsId, authorId, message) => {
    let news = News.findOne({
        _id: newsId
    })

    if (news && news.subscribers && news.subscribers.length) {
        news.subscribers.forEach(i => {
            if (i !== authorId) { // don't notify yourself
                sendNotification(i, message, 'System', `/news/${news.slug}`)
            }
        })
    }
  
    return news.subscribers
}

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
            createdBy: Meteor.userId(),
            subscribers: [Meteor.userId()]
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

export const toggleWatchNews = new ValidatedMethod({
    name: 'toggleWatchNews',
    validate:
        new SimpleSchema({
            newsId: {
                type: String,
                optional: false
            }
        }).validator({
            clean: true
        }),
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

        return News.update({
            _id: newsId
        }, {
            [!~(news.subscribers || []).indexOf(Meteor.userId()) ? '$addToSet' : '$pull']: {
                subscribers: Meteor.userId()
            }
        })
    }
})
