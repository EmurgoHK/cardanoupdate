import './home.html'
import './home.scss'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { News } from '/imports/api/news/news'
import { Comments } from '/imports/api/comments/comments'
import { notify } from '/imports/modules/notifier'

import { removeNews, voteNews } from '/imports/api/news/methods'

import swal from 'sweetalert2'
import moment from 'moment'

Template.home.onCreated(function () {
    this.sort = new ReactiveVar('date-desc')

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
        // TODO : we can remove this on production
        author : user.hasOwnProperty('profile') ? user.profile.name : 'No name',
        headline : a.headline,
        summary : a.summary,
        rating: a.rating || 0,
        canVote: !(a.votes || []).some(i => i.votedBy === Meteor.userId()),
        slug : a.slug,
        date : moment(a.createdAt).fromNow(),
        createdAt: a.createdAt,
        image: a.image,
        canEdit
      }
    }).sort((i1, i2) => {
        let sort = Template.instance().sort.get()

        if (sort === 'date-desc') return i2.createdAt - i1.createdAt
        if (sort === 'date-asc') return i1.createdAt - i2.createdAt
        if (sort === 'rating-desc') return i2.rating - i1.rating
        if (sort === 'rating-asc') return i1.rating - i2.rating
    })
  },
  comments: function (id) {
    return Comments.find({
      newsId: id
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
  },
    'click .vote-news': function(event, templateInstance) {
        event.preventDefault()

        voteNews.call({
            newsId: this.newsId,
            vote: event.currentTarget.dataset.vote
        }, (err, data) => {
            if (err) {
                notify(err.reason || err.message, 'error')
            }
        })
    },
    'change #js-sort': (event, templateInstance) => {
        event.preventDefault()

        templateInstance.sort.set($(event.currentTarget).val())
    }
})