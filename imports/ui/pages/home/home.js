import './home.html'
import './home.scss'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { News } from '/imports/api/news/news'
import { Comments } from '/imports/api/comments/comments'
import { notify } from '/imports/modules/notifier'

import { removeNews } from '/imports/api/news/methods'

import swal from 'sweetalert2'
import moment from 'moment'

Template.home.onCreated(function () {
  this.autorun(() => {
    this.subscribe('news')
    this.subscribe('users')
    this.subscribe('comments')
  })
})

Template.home.helpers({
  newsCount(){
    let news =  News.find({}).count()
    if(news){
      return true
    }
    return false
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
        date : moment(a.createdAt).fromNow(),
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

Template.home.events({
  'click #js-new': (event, templateInstance) => {
    event.preventDefault()

    FlowRouter.go('/add')
  },
  'click #js-remove': function (event, templateInstance) {
    event.preventDefault()

    swal({
      text: `Are you sure you want to remove this news item? This action is not reversible.`,
      type: 'warning',
      showCancelButton: true
    }).then(confirmed => {
      if (confirmed.value) {
        removeNews.call({
          newsId: this.newsId
        }, (err, data) => {
          if (err) {
            notify(err.reason || err.message, 'error')
          }
        })
      }
    })
  }
})