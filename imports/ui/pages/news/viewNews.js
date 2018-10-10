import './viewNews.html'
import '../comments/commentBody'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { News } from '/imports/api/news/news'
import { Comments } from '/imports/api/comments/comments'

import { newComment } from '/imports/api/comments/methods' 
import { flagNews, toggleWatchNews } from '/imports/api/news/methods'

import { notify } from '/imports/modules/notifier'

import swal from 'sweetalert2'

Template.viewNews.onCreated(function() {
	this.autorun(() => {
		this.subscribe('news.item', FlowRouter.getParam('slug'))
		this.subscribe('users')

		let news = News.findOne({
			slug: FlowRouter.getParam('slug')
		})

		if (news) {
			this.subscribe('comments.item', news._id)
		}
	})

	this.message = new ReactiveVar('')
})

Template.viewNews.helpers({
  isOwner : function() {
    if(this.createdBy === Meteor.userId()){
      return true
    }
    return false
  },
	watching: function() {
		return ~(this.subscribers || []).indexOf(Meteor.userId())
	},
	news: () => News.findOne({
		slug: FlowRouter.getParam('slug')
	}),
	author: function() {
        return ((Meteor.users.findOne({
            _id: this.createdBy
        }) || {}).profile || {}).name || 'No name'
    },
    comments: () => {
    	let news = News.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}

    	return Comments.find({
        parentId: news._id
    	}, {sort: {createdAt: -1}})
    },
	commentInvalidMessage: () => Template.instance().message.get(),
	commentCount: function () {
		return Comments.find({
		  parentId: this._id
		}).count()
	}
})

Template.viewNews.events({
	'click .flag-news': (event, templateInstance) => {
		let news = News.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}

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
					newsId: news._id,
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
	'click .new-comment': (event, templateInstance) => {
		event.preventDefault()
		let news = News.findOne({
			slug: FlowRouter.getParam('slug')
		})

		newComment.call({
			parentId: news._id,
			text: $('#comments').val(),
			newsId: news._id
		}, (err, data) => {
      $('#comments').val('')
			if (!err) {
				notify('Successfully commented.', 'success')
				templateInstance.message.set('')
			} else {
				templateInstance.message.set(err.reason || err.message)
			}
		})
	},
	'click .watch-news': function(event, templateInstance) {
		event.preventDefault()

		toggleWatchNews.call({
			newsId: this._id
		}, (err, data) => {
			if (err) {
                notify(err.reason || err.message, 'error')
            }
		})
	}
})
