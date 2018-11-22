import { Template } from 'meteor/templating'

import { isModerator } from '/imports/api/user/methods'

import marked from 'marked'
import moment from 'moment-timezone'
import CryptoJS from 'crypto-js'

Template.registerHelper('SubsCacheReady', () => Object.keys(SubsCache.cache).map(x => SubsCache.cache[x].ready()).reduce((x1, x2) => x1 && x2, true))

Template.registerHelper('isModerator', () => isModerator(Meteor.userId()))
Template.registerHelper('LimitChars', (val) => val&&val.length>100?val.slice(0,100)+' ... ':val )

Template.registerHelper('md', content => {
	return this.innerHTML = marked(content || '', {sanitize: true})
});

Template.registerHelper('showTimeAgoTimestamp', (date, timezone) => {
	if (!date) {
		return ''
	}

	if (timezone && typeof timezone === 'string') {
		return moment.tz(date, 'UTC').tz(timezone).fromNow()
	}

	return moment(date).fromNow()
})

Template.registerHelper('showLocalTimestamp', (date, timezone) => {
	if (!date) {
		return ''
	}

	if (timezone && typeof timezone === 'string') {
		return moment.tz(date, 'UTC').tz(timezone).format('LLL z')
	}

	return moment(date).format('LLL')
})

Template.registerHelper('isEventUpcoming', (date, timezone) => {
	if (!date) {
		return ''
	}

	let mDate = moment(date)
	let now = moment.now()

	if (timezone && typeof timezone === 'string') {
		mDate = moment.tz(date, 'UTC').tz(timezone)
		now = moment.tz(timezone)
	}

	return (moment.duration(mDate.diff(now)).as('hours') <= 48 && moment.duration(mDate.diff(now)).as('hours') >= 0)
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