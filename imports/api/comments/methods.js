import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { Comments } from './comments'
import { Events } from '/imports/api/events/events'
import { Projects } from '/imports/api/projects/projects'
import { socialResources } from '/imports/api/socialResources/socialResources'
import { Warnings } from '/imports/api/warnings/warnings'
import { Learn } from '/imports/api/learn/learn'
import { Research } from '/imports/api/research/research'
import { isModerator, userStrike } from '/imports/api/user/methods'
import { sendNotification } from '/imports/api/notifications/methods'

function addToSubscribers (postType, newsId, userId) {
  if (postType == 'learn') {
    let learn = Learn.findOne({
      _id: newsId
    })
    if(learn){
      Learn.update({
        _id: newsId
      }, {
        $addToSet: {
          subscribers: userId
        }
      })
    }
  } else if (postType == 'event') {
    let ev = Events.findOne({
      _id: newsId
    })
    if(ev){
      Events.update({
        _id: newsId
      }, {
        $addToSet: {
          subscribers: userId
        }
      })
    }
  } else if (postType == 'project') {
    let project = Projects.findOne({
      _id: newsId
    })
    if(project){
      Projects.update({
        _id: newsId
      }, {
        $addToSet: {
          subscribers: userId
        }
      })
    }
  } else if (postType == 'community') {
    let social = socialResources.findOne({
      _id: newsId
    })
    if(social){
      socialResources.update({
        _id: newsId
      }, {
        $addToSet: {
          subscribers: userId
        }
      })
    }
  } else if (postType == 'scam') {
    let scam = Warnings.findOne({
      _id: newsId
    })
    if(scam){
      Warnings.update({
        _id: newsId
      }, {
        $addToSet: {
          subscribers: userId
        }
      })
    }
  } else if (postType == 'research') {
    let research = Research.findOne({
      _id: newsId
    })
    if(research){
      Research.update({
        _id: newsId
      }, {
        $addToSet: {
          subscribers: userId
        }
      })
    }
  }
}

function sendToSubscribers (postType, newsId, authorId, message) {
  if (postType == 'learn') {

    let learn = Learn.findOne({
      _id: newsId
    })
  
    if (learn && learn.subscribers && learn.subscribers.length) {
      learn.subscribers.forEach(i => {
        if (i !== authorId) { // don't notify yourself
          sendNotification(i, `${message} commented on Learning Resource you are following.`, 'System', `/learn/${learn.slug}`)
        }
      })
    }

    return learn.subscribers

  } else if (postType == 'event') {

    let ev = Events.findOne({
      _id: newsId
    })

    if (ev && ev.subscribers && ev.subscribers.length) {
      ev.subscribers.forEach(i => {
        if (i !== authorId) { // don't notify yourself
          sendNotification(i, `${message} commented on Event you are following.`, 'System', `/events/${ev.slug}`)
        }
      })
    }

    return ev.subscribers

  } else if (postType == 'project') {
    console.log('Project Comment .... ')
    let project = Projects.findOne({
      _id: newsId
    })
  
    if (project && project.subscribers && project.subscribers.length) {
      project.subscribers.forEach(i => {
        if (i !== authorId) { // don't notify yourself
          sendNotification(i, `${message} commented on Project you are following.`, 'System', `/projects/${project.slug}`)
        }
      })
    }

    return project.subscribers

  } else if (postType == 'community') {

    let community = socialResources.findOne({
      _id: newsId
    })
  
    if (community && community.subscribers && community.subscribers.length) {
      community.subscribers.forEach(i => {
        if (i !== authorId) { // don't notify yourself
          sendNotification(i, `${message} commented on Community you are following.`, 'System', `/community/${community.slug}`)
        }
      })
    }

    return community.subscribers

  } else if (postType == 'scam') {

    let scam = Warnings.findOne({
      _id: newsId
    })
  
    if (scam && scam.subscribers && scam.subscribers.length) {
      scam.subscribers.forEach(i => {
        if (i !== authorId) { // don't notify yourself
          sendNotification(i, `${message} commented on Scam you are following.`, 'System', `/scams/${scam.slug}`)
        }
      })
    }

    return scam.subscribers

  } else if (postType == 'research') {

    let research = Research.findOne({
      _id: newsId
    })
  
    if (research && research.subscribers && research.subscribers.length) {
      research.subscribers.forEach(i => {
        if (i !== authorId) { // don't notify yourself
          sendNotification(i, `${message} commented on Research Paper you are following.`, 'System', `/research/${research.slug}`)
        }
      })
    }

    return research.subscribers
  }
}

export const newComment = new ValidatedMethod({
  name: 'newComment',
  validate: new SimpleSchema({
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
    postType: {
      type: String,
      optional: true
    },
    type: {
      type: String,
      optional: true
    }
  }).validator({
    clean: true
  }),
  run({ parentId, newsId, text, type, postType }) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Error.', 'You have to be logged in.')
    }
    addToSubscribers(postType, newsId, Meteor.userId())
    sendToSubscribers(postType, newsId, Meteor.userId(), `${((Meteor.users.findOne({_id: Meteor.userId()}) || {}).profile || {}).name || 'No name'}`)
    return Comments.insert({
      parentId: parentId,
      text: text,
      createdAt: new Date().getTime(),
      createdBy: Meteor.userId(),
      newsId: newsId,
      postType : postType,
      type: type || 'comment'
    })
  }
})

export const removeComment = new ValidatedMethod({
  name: 'removeComment',
  validate: new SimpleSchema({
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
  validate: new SimpleSchema({
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
  validate: new SimpleSchema({
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
  validate: new SimpleSchema({
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