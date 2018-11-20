import { Comments } from '/imports/api/comments/comments'
import { Projects } from '/imports/api/projects/projects'
import { Research } from '/imports/api/research/research'
import { Learn } from '/imports/api/learn/learn'
import { socialResources } from '/imports/api/socialResources/socialResources'
import { Warnings } from '/imports/api/warnings/warnings'
import { Events } from '/imports/api/events/events'
import { updateProfile } from '/imports/api/user/methods'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { notify } from '/imports/modules/notifier'

import './viewProfile.html'
import './editProfile.html'
import './userProfile.scss'

import '/imports/ui/shared/uploader/uploader'
import { getFiles } from '/imports/ui/shared/uploader/uploader'

Template.viewProfile.onCreated(function() {
  this.autorun(() => {
    this.subscribe('users')
    this.subscribe('comments')

    this.subscribe('research');
    this.subscribe('projects')
    this.subscribe('learn');
    this.subscribe('socialResources');
    this.subscribe('warnings');
    this.subscribe('events');
  })
})

Template.viewProfile.helpers({
  user(){
    let user = Meteor.users.findOne({
      _id: FlowRouter.getParam('userId')
    })
    if(user){
      return {
        id : user._id,
        name : user.profile.name ? user.profile.name : TAPi18n.__('user.edit.no_name'),
        bio : user.profile.bio ? user.profile.bio : '',
        picture: user.profile.picture || '',
        profile: user.profile,
        emails: user.emails
        // email : user.emails[0].address,
        // verifiedEmail : user.emails[0].verified,
      }
    }
  },

  isModerator () {
    let user = Meteor.users.findOne({
      _id: FlowRouter.getParam('userId')
    })
    if (user.moderator) {
      return true
    }
    return false
  },

  rank () {
    let user = Meteor.users.findOne({
      _id: FlowRouter.getParam('userId')
    })
    if (user) {
      let totalUserQuery = {}
      //
      let strikes = (user.strikes || []).filter(i => i.time > (new Date().getTime() - 1000 * 60 * 60 * 24 * 30))
      if (!user.suspended && !user.moderator && strikes.length === 0) {
        totalUserQuery = { _id: { $ne: user._id } }
      }
      //
      let totalUsers = Meteor.users.find(totalUserQuery).count()
      if (user.mod && user.mod.data && !_.isEmpty(totalUserQuery)) {
        return `${user.mod.data.rank} ${TAPi18n.__('user.edit.out')} ${totalUsers} ${TAPi18n.__('user.edit.rank')}`
      }
    }
    return false
  },

  contentCount(){
    let comments = Comments.find({createdBy : FlowRouter.getParam('userId')}).count()

    return news + comments
  },
  userContent() {
    let content = []
    let comments = Comments.find({createdBy : FlowRouter.getParam('userId')})
    if(news){
      news.map(news => {
        content.push({
          isComment : false,
          createdAt : news.createdAt,
          title : news.headline,
          link : news.slug
        })
      })
    }
    if(comments){
      comments.map(comment => {
        content.push({
          isComment : true,
          createdAt : comment.createdAt,
          title : newsTitle(comment.newsId),
          link : newsUrl(comment.newsId, comment._id)
        })
      })
    }
    return content
  },
  comments: () => Comments.find({createdBy : FlowRouter.getParam('userId')}).map(comment => { 
    // We are adding extra data to the comment depending on the content it was made on.
    
    // Fetching the project if the comment was made on one
    const project = Projects.findOne({_id: comment.newsId});
    if (project) {
      comment.contentTitle = project.headline;
      comment.contentUrl = `/projects/${project.slug}`;
      return comment;
    } 
    
    // Fetching the research if the comment was made on one
    const research = Research.findOne({_id: comment.newsId});
    if (research) {
      comment.contentTitle = research.headline;
      comment.contentUrl = `/research/${research.slug}`;
      return comment;
    }
    
    // Fetching the learning resource if the comment was made on one
    const learn = Learn.findOne({_id: comment.newsId});
    if (learn) {
      comment.contentTitle = learn.title;
      comment.contentUrl = `/learn/${learn.slug}`;
      return comment;
    }
    
    // Fetching the scam if the comment was made on one
    const warning = Warnings.findOne({_id: comment.newsId});
    if (warning) {
      comment.contentTitle = warning.headline;
      comment.contentUrl = `/scams/${warning.slug}`;
      return comment;
    }
    
    // Fetching the social resource if the comment was made on one
    const socialResource = socialResources.findOne({_id: comment.newsId});
    if (socialResource) {
      comment.contentTitle = socialResource.Name;
      comment.contentUrl = `/community/${socialResource._id}`;
      return comment;
    }

    // Fetching the event if the comment was made on one
    const event = Events.findOne({_id: comment.newsId});
    if (event) {
      comment.contentTitle = event.headline;
      comment.contentUrl = `/events/${event.slug}`;
      return comment;
    }
    
    comment.contentTitle = 'Unknown';
    comment.contentUrl = '#';

    return comment;
  }),
  projects: () => Projects.find({createdBy : FlowRouter.getParam('userId')}),
  research: () => Research.find({createdBy : FlowRouter.getParam('userId')}),
  events: () => Events.find({createdBy : FlowRouter.getParam('userId')}),
  community: () => socialResources.find({createdBy : FlowRouter.getParam('userId')}),
  learn: () => Learn.find({createdBy : FlowRouter.getParam('userId')}),
  scams: () => Warnings.find({createdBy : FlowRouter.getParam('userId')}),
})

Template.editProfile.onCreated(function(){
  this.autorun(() => {
    this.subscribe('users')
  })
})

Template.editProfile.helpers({
  user(){
    let user = Meteor.users.findOne({_id : Meteor.userId()})
    return {
      name : user.profile.name ? user.profile.name : TAPi18n.__('user.edit.no_name'),
      email : user.emails[0].address,
      bio : user.profile.bio ? user.profile.bio : '',
      picture: user.profile.picture || ''
    }
  },
  images: () => {
    let user = Meteor.users.findOne({
      _id : Meteor.userId()
    })

    if (user && user.profile && user.profile.picture) {
      return [user.profile.picture]
    }

    return []
  }
})

Template.editProfile.events({
  'click .save-changes': (event, templateInstance) => {
    event.preventDefault()
    updateProfile.call({
      uId : Meteor.userId(),
      name : $('#userName').val(),
      email : $('#userEmail').val(),
      bio : $('#bio').val(),
      image: getFiles()[0] || ''
    }, (err, res) => {
      if (!err) {
        notify('Successfully updated.')

        history.back()

        return
      }

      if (err.details === undefined && err.reason) {
        notify(err.reason, 'error')
        return
      }

      if (err.details && err.details.length >= 1) {
        err.details.forEach(e => {
          $(`#${e.name}`).addClass('is-invalid')
          $(`#${e.name}Error`).show()
          $(`#${e.name}Error`).text(e.message)
        })
      }
    })
  },
})
