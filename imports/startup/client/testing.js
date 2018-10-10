import { News } from '/imports/api/news/news'
import { Comments } from '/imports/api/comments/comments'
import { Notifications } from '/imports/api/notifications/notifications'
import { Projects } from '/imports/api/projects/projects'
import { Events } from '/imports/api/events/events'
import { Research } from '/imports/api/research/research'

const collections = {
	News: News,
	Comments: Comments,
	Notifications: Notifications,
	Projects: Projects,
	Research: Research,
	Events: Events
}

Object.keys(collections).forEach(a => {
	if (!window[`testing${a}`]) { // don't override existing globals
		if (Meteor.isDevelopment) {
	    	window[`testing${a}`] = collections[a]
		} else {
			window[`testing${a}`] = {}
			window[`testing${a}`]['find'] = window[`testing${a}`]['findOne'] = () => {
				throw new Meteor.Error('Error.', `You can't reference testing${a} globally when in production, please dynamically import it accordingly.`)
			}
		}
	}
})