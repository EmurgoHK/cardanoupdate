import './viewNews.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { News } from '/imports/api/news/news'
import { notify } from '/imports/modules/notifier'

Template.viewNews.onCreated(function() {
	this.autorun(() => {
		this.subscribe('news.item', FlowRouter.getParam('slug'))
		this.subscribe('users')
	})
})

Template.viewNews.helpers({
	news: () => News.findOne({
		slug: FlowRouter.getParam('slug')
	}),
	author: function() {
        return (Meteor.users.findOne({
            _id: this.createdBy
        }) || {}).username || ''
    },
})
