import './home.html'
import './home.scss'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { News } from '/imports/api/news/news'
import { Comments } from '/imports/api/comments/comments'
import { notify } from '/imports/modules/notifier'

import { flagNews, removeNews, voteNews } from '/imports/api/news/methods'
import { UsersStats } from '/imports/api/user/usersStats'
import swal from 'sweetalert2'
import moment from 'moment'

Template.home.onCreated(function () {
  this.sort = new ReactiveVar('date-desc')
  this.searchFilter = new ReactiveVar(undefined);
  this.autorun(() => {
    this.subscribe('news')
    this.subscribe('users')
    this.subscribe('comments')
    this.subscribe('usersStats')
    let searchFilter = Template.instance().searchFilter.get();
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
  thumb: function() {
    if (this.image) {
        let im = this.image.split('.')
        let ext = im[im.length - 1]

        return this.image.replace(`.${ext}`, `_thumbnail.${ext}`)
    } 

    return ''
  },
  news: function(){
    let news = [];
    let searchText = Template.instance().searchFilter.get()

    // Check if user has searched for something
    if (searchText != undefined && searchText != '') {
      news = News.find({
        $or: [{
            summary: new RegExp(searchText.replace(/ /g, '|'), 'ig')
          }, {
            headline: new RegExp(searchText.replace(/ /g, '|'), 'ig')
          }, {
            body: new RegExp(searchText.replace(/ /g, '|'), 'ig')
          },{
            tags: new RegExp(searchText.replace(/ /g, '|'), 'ig')
          }]
      })
    } else {
      news = News.find({})
    }
    
    return news.map(a => {
      let user = Meteor.users.findOne({_id : a.createdBy})
      let canEdit = (Meteor.userId() === a.createdBy) ? true : false
      return {
        newsId : a._id,
        // TODO : we can remove this on production
        author : (user || {}).hasOwnProperty('profile') ? user.profile.name : 'No name',
        headline : a.headline,
        summary : a.summary,
        rating: a.rating || 0,
        votes: a.votes || [],
        canVote: !(a.votes || []).some(i => i.votedBy === Meteor.userId()),
        slug : a.slug,
        date : moment(a.createdAt).fromNow(),
        createdBy: a.createdBy,
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
  truncate (str) {
    const max_length = 180
    
    if (str.length > max_length) {
      return str.substring(0, max_length) + `... <a href="/news/${this.slug}" class="read-more">(more)</a>` 
    }

    return str
  },
  upvotes () {
    return ((this.votes || []).filter(v => v.vote === 'up')).length
  },
  downvotes () {
    return ((this.votes || []).filter(v => v.vote === 'down')).length
  },
  voteThumbActive (vote) {
    if((this.votes || []).some(i => i.votedBy === Meteor.userId() && i.vote === vote)) {
      return 'fas'
    }

    return 'far'
  },
  signedUp: () => (UsersStats.findOne({
    _id: 'lastMonth'
  }) || {}).created || 0,
  commentsLastMonth: () => (UsersStats.findOne({
    _id: 'lastMonthComments'
  }) || {}).created || 0,
  onlineUsers() {
    console.log('user stats ::', UsersStats.find({}).fetch())
    let connectionUsers = ((UsersStats.findOne("connected") || {}).userIds || []).length;
    return connectionUsers ? connectionUsers : 0;
  },
  totalUsers: () => Meteor.users.find({}).count() || 0,
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
  'click .flag-news' : function(event, templateInstance) {
    swal({
      title: 'Why are you flagging this?',
      input: 'text',
      showCancelButton: true,
      inputValidator: (value) => {
        return !value && 'You need to write a valid reason!'
      }
    }).then(data => {
      if (data.value) {
        flagNews.call({
          newsId: this.newsId,
          reason: data.value
        }, (err, data) => {
          if (err) {
            notify(err.reason || err.message, 'error')
          } else {
            notify('Successfully flagged. Moderators will decide what to do next.', 'success')
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
    'change .sort-news input': (event, templateInstance) => {
      event.preventDefault()
      templateInstance.sort.set($(event.currentTarget).val())
    },
    'keyup #searchBox': function (event, templateInstance) {
      event.preventDefault();

      templateInstance.searchFilter.set($('#searchBox').val())
  }
})