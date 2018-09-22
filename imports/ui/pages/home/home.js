import './home.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { News } from '/imports/api/news/news'
import { Comments } from '/imports/api/comments/comments'
import { notify } from '/imports/modules/notifier'

import { removeNews } from '/imports/api/news/methods'

import swal from 'sweetalert2'

Template.home.onCreated(function() {
    this.autorun(() => {
        this.subscribe('news')
        this.subscribe('users')

        this.subscribe('comments')
    })
})

Template.home.helpers({
    news: () => News.find({}),
    author: function() {
        return (Meteor.users.findOne({
            _id: this.createdBy
        }) || {}).username || ''
    },
    comments: function() {
        return Comments.find({
            parentId: this._id
        }).count()
    },
    canEdit: function() {
        return this.createdBy === Meteor.userId()
    }
})

Template.home.events({
    'click #js-new': (event, templateInstance) => {
        event.preventDefault()

        FlowRouter.go('/add')
    },
    'click #js-remove': function(event, templateInstance) {
        event.preventDefault()

        swal({
            text: `Are you sure you want to remove this news item? This action is not reversible.`,
            type: 'warning',
            showCancelButton: true
        }).then(confirmed => {
            if (confirmed.value) {
                removeNews.call({
                    newsId: this._id
                }, (err, data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                    }
                })
            }
        })
    }
})