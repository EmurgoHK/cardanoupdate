import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { Comments } from './comments'
import { Learn } from '/imports/api/learn/learn'

import { isModerator, userStrike } from '/imports/api/user/methods'

import { addToSubscribers, sendToSubscribers } from '/imports/api/learn/methods'

export const newComment = new ValidatedMethod({
    name: 'newComment',
    validate:
        new SimpleSchema({
            parentId: {
                type: String,
                optional: false
            },
            text: {
                type: String,
                max: 1000,
                optional: false
            },
            newsId: {
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
    run({ parentId, newsId, text, type }) {
		if (!Meteor.userId()) {
			throw new Meteor.Error('Error.', 'You have to be logged in.')
		}

        if (Learn.findOne({
            _id: newsId
        })) {
            addToSubscribers(newsId, Meteor.userId())
            sendToSubscribers(newsId, Meteor.userId(), `${((Meteor.users.findOne({_id: Meteor.userId()}) || {}).profile || {}).name || 'No name'} commented on a news item you're watching.`)
        }

        return Comments.insert({
            parentId: parentId,
            text: text,
            createdAt: new Date().getTime(),
            createdBy: Meteor.userId(),
            newsId: newsId,
            type: type || 'comment'
        })
    }
})

export const removeComment = new ValidatedMethod({
    name: 'removeComment',
    validate:
        new SimpleSchema({
            commentId: {
                type: String,
                optional: false
            }
        }).validator(),
    run({ commentId }) {
        let comment = Comments.findOne({
            _id: commentId
        })

        if (!comment) {
            throw new Meteor.Error('Error.', 'Comment doesn\'t exist.')
        }

        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        if (comment.createdBy !== Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You can\'t remove a comment that you haven\'t posted.')
        }

        // if the comment that's being deleted has children, append the children to the parent comment
        let comments = Comments.find({
            parentId: comment._id
        }).fetch()

        comments.forEach(i => {
            Comments.update({
                _id: i._id
            }, {
                $set: {
                    parentId: comment.parentId
                }
            })
        })

        return Comments.remove({
            _id: commentId
        })
    }
})

export const editComment = new ValidatedMethod({
    name: 'editComment',
    validate:
        new SimpleSchema({
            commentId: {
                type: String,
                optional: false
            },
            text: {
                type: String,
                max: 1000,
                optional: false
            }
        }).validator({
            clean: true
        }),
    run({ commentId, text }) {
        let comment = Comments.findOne({
            _id: commentId
        })

        if (!comment) {
            throw new Meteor.Error('Error.', 'Comment doesn\'t exist.')
        }

        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        if (comment.createdBy !== Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You can\'t edit a comment that you haven\'t posted.')
        }

        return Comments.update({
            _id: commentId
        }, {
            $set: {
                text: text,
                editedAt: new Date().getTime()
            }
        })
    }
})

export const flagComment = new ValidatedMethod({
    name: 'flagComment',
    validate:
        new SimpleSchema({
            commentId: {
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
    run({ commentId, reason }) {
        let comment = Comments.findOne({
            _id: commentId
        })

        if (!comment) {
            throw new Meteor.Error('Error.', 'Comment doesn\'t exist.')
        }

        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        if ((comment.flags || []).some(i => i.flaggedBy === Meteor.userId())) {
            throw new Meteor.Error('Error.', 'You have already flagged this item.')
        }

        return Comments.update({
            _id: commentId
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

export const resolveCommentFlags = new ValidatedMethod({
    name: 'resolveCommentFlags',
    validate:
        new SimpleSchema({
            commentId: {
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
    run({ commentId, decision }) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        if (!isModerator(Meteor.userId())) {
            throw new Meteor.Error('Error.', 'You have to be a moderator.')
        }

        let comment = Comments.findOne({
            _id: commentId
        })

        if (!comment) {
            throw new Meteor.Error('Error.', 'Comment doesn\'t exist.')
        }

        if (decision === 'ignore') {
            return Comments.update({
                _id: commentId
            }, {
                $set: {
                    flags: []
                }
            })
        } else {
            userStrike.call({
                userId: comment.createdBy,
                type: 'comment',
                token: 's3rv3r-only',
                times: 1
            }, (err, data) => {})

            let comments = Comments.find({
                parentId: comment._id
            }).fetch()

            comments.forEach(i => {
                Comments.update({
                    _id: i._id
                }, {
                    $set: {
                        parentId: comment.parentId
                    }
                })
            })

            return Comments.remove({
                _id: commentId
            })
        }
    }
})
