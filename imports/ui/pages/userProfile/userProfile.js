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
  news: function(){
    let news =  News.find({})
    return news.map(a => {
      let user = Meteor.users.findOne({_id : a.createdBy})
      let canEdit = (Meteor.userId() === a.createdBy) ? true : false
      return {
        newsId : a._id,
        // TODO : Update this user Name
        author : user._id,
        headline : a.headline,
        summary : a.summary,
        slug : a.slug,
        date : new Date(a.createdAt).toLocaleString(),
        canEdit
      }
    })
  },
  comments: function () {
    return Comments.find({
      parentId: this._id
    }).count()
  },
})