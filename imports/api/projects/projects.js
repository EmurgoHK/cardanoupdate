import { Mongo } from 'meteor/mongo'

export const Projects = new Mongo.Collection('projects')

Projects.friendlySlugs({
  	slugFrom: ['headline', 'type'],
  	slugField: 'slug',
  	distinct: true,
  	updateSlug: true,
  	debug: false,
  	transliteration: [{
    	from: 'ü',
    	to: 'u'
  	}, {
    	from: 'õö',
    	to: 'o'
  	}]
})
