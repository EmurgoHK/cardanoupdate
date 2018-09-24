import { News } from '/imports/api/news/news'
import { Comments } from '/imports/api/comments/comments'
import './viewProfile.html'
import './userProfile.scss'

Template.viewProfile.onCreated(function(){
  this.autorun(() => {
    this.subscribe('news')
    this.subscribe('users')
    this.subscribe('comments')
  })
})

Template.viewProfile.helpers({
  user(){
    let user = Meteor.users.findOne({_id : Meteor.userId()})
    // For old users, who doesn't have name in profile
    return {
      name : user.profile.name ? user.profile.name : 'No Name',
      email : user.emails[0].address,
      verifiedEmail : user.emails[0].verified,
    }
  },
  newsCount(){
    return News.find({createdBy : Meteor.userId()}).count()
  },
  commentsCount(){
    return Comments.find({createdBy : Meteor.userId()}).count()
  },
  news(){
    let news =  News.find({createdBy : Meteor.userId()})
    return news.map(a => {
      return {
        newsId : a._id,
        headline : a.headline,
        slug : a.slug,
        date : new Date(a.createdAt).toLocaleString(),
      }
    })
  },
  comments() {
    let comments = Comments.find({createdBy: Meteor.userId()})
    return comments.map(a => {
      let post = News.findOne({_id : a.parentId})
      return {
        headline : post.headline,
        slug : post.slug
      }
    })
  },
})