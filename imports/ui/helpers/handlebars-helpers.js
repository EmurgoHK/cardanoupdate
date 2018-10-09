import { Template } from 'meteor/templating'

import { isModerator } from '/imports/api/user/methods'

import marked from 'marked'
import moment from 'moment'

Template.registerHelper('SubsCacheReady', () => Object.keys(SubsCache.cache).map(x => SubsCache.cache[x].ready()).reduce((x1, x2) => x1 && x2, true))

Template.registerHelper('isModerator', () => isModerator(Meteor.userId()))

Template.registerHelper('md', content => {
    return  this.innerHTML = marked(content || '')
})

Template.registerHelper('showTimeAgoTimestamp', date => {
	return !date ? "" : moment(date).fromNow()
})

Template.registerHelper('showLocalTimestamp', date => {
	return !date ? "" : moment(date).format('LLL')
})