import { Mongo } from 'meteor/mongo'

export const Learn = new Mongo.Collection('learn')

Learn.friendlySlugs({
  	slugFrom: 'title',
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