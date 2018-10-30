import { Template } from 'meteor/templating'

import { isModerator } from '/imports/api/user/methods'

import marked from 'marked'
import moment from 'moment'
import CryptoJS from 'crypto-js'

Template.registerHelper('SubsCacheReady', () => Object.keys(SubsCache.cache).map(x => SubsCache.cache[x].ready()).reduce((x1, x2) => x1 && x2, true))

Template.registerHelper('isModerator', () => isModerator(Meteor.userId()))
Template.registerHelper('LimitChars', (val) => val&&val.length>50?val.slice(0,50)+' ... ':val )

Template.registerHelper('md', content => {
    return  this.innerHTML = marked(content || '')
})

Template.registerHelper('showTimeAgoTimestamp', date => {
	return !date ? "" : moment(date).fromNow()
})

Template.registerHelper('showLocalTimestamp', date => {
	return !date ? "" : moment(date).format('LLL')
})

Template.registerHelper('isEventUpcoming', date => {
	return !date ? "" :  (moment.duration(moment(date).diff(moment.now())).as('hours') <= 48 && moment.duration(moment(date).diff(moment.now())).as('hours') >=0 )
})

Template.registerHelper('avatarFor', (user, size) => {
	if (user && (user.profile && user.profile.picture)) {
		return user.profile.picture
	}

	const email = user.emails[0].address.toLowerCase()
	const gravatarId = CryptoJS.MD5(email).toString(CryptoJS.enc.Hex)
	const gravatarUrl = `https://secure.gravatar.com/avatar/${gravatarId}?s=${size}`

	return gravatarUrl
})
